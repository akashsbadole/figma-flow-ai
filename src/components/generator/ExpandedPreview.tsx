import { useState, useRef, useCallback, useEffect, WheelEvent as ReactWheelEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Copy, Code, Download, Check, MousePointer, Loader2, Send, ZoomIn, ZoomOut, Maximize, FileDown, Braces, Layers, Settings2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { htmlCssToReactComponent } from "@/lib/export-utils";
import { validateSVGForFigma, cleanSVGForFigma } from "@/lib/figma-svg-export";
import { sanitizeCSS, sanitizeHTML } from "@/lib/sanitize-css";
import html2canvas from "html2canvas";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayersPanel } from "./LayersPanel";
import { PropertiesPanel } from "./PropertiesPanel";

interface Variant {
  id: string;
  name: string;
  html: string;
  css: string;
  svg?: string;
  metadata?: {
    extractedTokens?: {
      colors: string[];
      fonts: string[];
      fontSizes: string[];
    };
  };
}

interface ExpandedPreviewProps {
  variant: Variant;
  deviceType: "mobile" | "tablet" | "desktop";
  deviceWidth: number;
  deviceHeight: number;
  onClose: () => void;
  onIterate?: (followUp: string, currentHtml: string, currentCss: string) => Promise<{ html: string; css: string } | null>;
}

export function ExpandedPreview({ variant, deviceType, deviceWidth, deviceHeight, onClose, onIterate }: ExpandedPreviewProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedHtml, setEditedHtml] = useState(variant.html);
  const [editedCss, setEditedCss] = useState(variant.css);
  const [followUp, setFollowUp] = useState("");
  const [iterating, setIterating] = useState(false);
  const [history, setHistory] = useState<{ html: string; css: string }[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const fitScale = useCallback(() => {
    const maxH = window.innerHeight * 0.55;
    const maxW = window.innerWidth * 0.5;
    return Math.min(maxW / deviceWidth, maxH / deviceHeight, 1);
  }, [deviceWidth, deviceHeight]);

  useEffect(() => {
    setZoom(fitScale());
    setPan({ x: 0, y: 0 });
  }, [fitScale]);

  const handleWheel = useCallback((e: ReactWheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setZoom((z) => Math.min(Math.max(z + delta, 0.1), 3));
  }, []);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault();
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    }
  }, [pan]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanning) return;
      setPan({
        x: panStart.current.panX + (e.clientX - panStart.current.x),
        y: panStart.current.panY + (e.clientY - panStart.current.y),
      });
    };
    const handleMouseUp = () => setIsPanning(false);
    if (isPanning) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isPanning]);

  const zoomIn = () => setZoom((z) => Math.min(z + 0.15, 3));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.1));
  const resetView = () => { setZoom(fitScale()); setPan({ x: 0, y: 0 }); };
  const handleIterate = async () => {
    if (!followUp.trim() || !onIterate || iterating) return;
    setIterating(true);
    try {
      const result = await onIterate(followUp.trim(), editedHtml, editedCss);
      if (result) {
        setHistory((prev) => [...prev, { html: editedHtml, css: editedCss }]);
        setEditedHtml(result.html);
        setEditedCss(result.css);
        setFollowUp("");
        toast({ title: "Design updated!" });
      }
    } catch (err: any) {
      toast({ title: "Iteration failed", description: err.message, variant: "destructive" });
    } finally {
      setIterating(false);
    }
  };

  const undoIteration = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setEditedHtml(prev.html);
    setEditedCss(prev.css);
    setHistory((h) => h.slice(0, -1));
  };

  const getIframeContent = () => {
    const sanitizedCSS = sanitizeCSS(editedCss);
    const sanitizedHTML = sanitizeHTML(editedHtml);
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      width: ${deviceWidth}px; 
      height: ${deviceHeight}px; 
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    ${sanitizedCSS}
  </style>
</head>
<body>
  ${sanitizedHTML}
  <script>
    window.onerror = function(msg, url, line) {
      window.parent.postMessage({ type: 'iframe-error', message: msg }, '*');
      return true;
    };
  </script>
</body>
</html>`;
  };

  const copyToFigma = async () => {
    let svgContent = variant.svg;
    
    if (!svgContent) {
      svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${deviceWidth} ${deviceHeight}" width="${deviceWidth}" height="${deviceHeight}"><text x="50%" y="50%" text-anchor="middle" font-size="24" fill="#888">No SVG available</text></svg>`;
    }
    
    const validation = validateSVGForFigma(svgContent);
    
    if (!validation.valid) {
      toast({
        title: "SVG validation failed",
        description: validation.errors.join(', '),
        variant: "destructive",
      });
      return;
    }
    
    if (validation.warnings.length > 0) {
      console.warn('SVG warnings:', validation.warnings);
    }
    
    const cleanedSVG = cleanSVGForFigma(svgContent);
    
    try {
      const svgBlob = new Blob([cleanedSVG], { type: 'image/svg+xml' });
      const textBlob = new Blob([cleanedSVG], { type: 'text/plain' });
      const htmlBlob = new Blob([cleanedSVG], { type: 'text/html' });

      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/svg+xml': svgBlob,
            'text/html': htmlBlob,
            'text/plain': textBlob,
          }),
        ]);
      } catch {
        await navigator.clipboard.writeText(cleanedSVG);
      }

      setCopied(true);
      toast({ title: "Design copied as SVG!", description: "Paste into Figma — elements are editable" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      await navigator.clipboard.writeText(cleanedSVG);
      setCopied(true);
      toast({ title: "SVG copied as text", description: "Paste into Figma or save as .svg file" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadHtml = () => {
    const full = `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<style>\n${editedCss}\n</style>\n</head>\n<body>\n${editedHtml}\n</body>\n</html>`;
    const blob = new Blob([full], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${variant.name.replace(/\s+/g, "-").toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPNG = async () => {
    if (!iframeRef.current || !iframeRef.current.contentDocument) return;

    const doc = iframeRef.current.contentDocument;
    const body = doc.body;

    toast({ title: "Exporting PNG...", description: "Rendering design at 3x scale" });

    try {
      const canvas = await html2canvas(body, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        width: deviceWidth,
        height: deviceHeight
      });

      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${variant.name.replace(/\s+/g, "-").toLowerCase()}@3x.png`;
      a.click();
      toast({ title: "PNG Exported!" });
    } catch (err) {
      console.error("PNG export failed:", err);
      toast({ title: "PNG Export failed", variant: "destructive" });
    }
  };

  const downloadCss = () => {
    const blob = new Blob([editedCss], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${variant.name.replace(/\s+/g, "-").toLowerCase()}.css`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSvg = () => {
    if (!variant.svg) return;
    const blob = new Blob([variant.svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${variant.name.replace(/\s+/g, "-").toLowerCase()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyAsReact = async () => {
    const code = htmlCssToReactComponent(variant.name, editedHtml, editedCss);
    await navigator.clipboard.writeText(code);
    toast({ title: "React component copied!" });
  };

  const enableDirectEdit = useCallback(() => {
    setEditMode(!editMode);
    if (!editMode && iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.designMode = "on";
        toast({ title: "Direct edit mode ON", description: "Click any text in the preview to edit it" });
      }
    } else if (editMode && iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.designMode = "off";
        setEditedHtml(doc.body.innerHTML);
      }
    }
  }, [editMode, toast]);

  const renderDeviceFrame = (ref?: React.Ref<HTMLIFrameElement>) => {
    const srcDoc = getIframeContent();
    const iframeEl = (
      <iframe
        ref={ref as any}
        srcDoc={srcDoc}
        className="w-full h-full border-0"
        title={variant.name}
        sandbox="allow-scripts"
      />
    );

    if (deviceType === "mobile") {
      return (
        <div className="relative rounded-[2.5rem] bg-foreground/90 p-3 h-full shadow-elevated">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-foreground/90 rounded-b-2xl z-10" />
          <div className="w-full h-full rounded-[2rem] overflow-hidden bg-background">{iframeEl}</div>
        </div>
      );
    }
    if (deviceType === "tablet") {
      return (
        <div className="relative rounded-[1.5rem] bg-foreground/90 p-3 h-full shadow-elevated">
          <div className="w-full h-full rounded-[1rem] overflow-hidden bg-background">{iframeEl}</div>
        </div>
      );
    }
    return (
      <div className="relative rounded-xl bg-foreground/90 shadow-elevated h-full flex flex-col">
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/20">
          <div className="w-3 h-3 rounded-full bg-destructive/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
        <div className="flex-1 overflow-hidden bg-background">{iframeEl}</div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex overflow-hidden"
      onClick={onClose}
    >
      <div
        className="flex flex-1 gap-4 p-6 w-full h-full max-w-[100vw] max-h-[100vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Preview side */}
        <div className="flex-1 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight truncate max-w-[300px]">{variant.name}</h2>
              <div className="h-4 w-px bg-border/40 hidden sm:block" />
              <span className="text-xs text-muted-foreground uppercase font-mono">{deviceType}</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              <Button
                variant={editMode ? "default" : "outline"}
                size="sm"
                onClick={enableDirectEdit}
                className={cn("h-8 px-3 text-xs", editMode ? "gradient-primary text-primary-foreground border-0" : "")}
              >
                <MousePointer className="h-3.5 w-3.5 mr-1.5" />
                {editMode ? "Save Edits" : "Direct Edit"}
              </Button>
              <Button variant="outline" size="sm" onClick={copyToFigma} className="h-8 px-3 text-xs">
                {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                Figma
              </Button>

              <div className="flex bg-muted/50 rounded-md p-0.5 border border-border/30">
                <Button variant="ghost" size="sm" onClick={downloadHtml} className="h-7 px-2 text-[10px] uppercase font-bold tracking-wider">
                  HTML
                </Button>
                <Button variant="ghost" size="sm" onClick={downloadCss} className="h-7 px-2 text-[10px] uppercase font-bold tracking-wider">
                  CSS
                </Button>
                <Button variant="ghost" size="sm" onClick={downloadSvg} disabled={!variant.svg} className="h-7 px-2 text-[10px] uppercase font-bold tracking-wider">
                  SVG
                </Button>
              </div>

              <Button variant="outline" size="sm" onClick={copyAsReact} className="h-8 px-3 text-xs">
                <Braces className="h-3.5 w-3.5 mr-1.5" /> React
              </Button>

              <div className="w-px h-6 bg-border/40 mx-1 hidden sm:block" />

              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div
            ref={canvasRef}
            className="flex-1 bg-muted rounded-xl p-4 flex items-center justify-center overflow-hidden relative"
            onWheel={handleWheel}
            onMouseDown={handleCanvasMouseDown}
            style={{ cursor: isPanning ? "grabbing" : "default" }}
          >
            <div
              style={{
                width: deviceWidth,
                height: deviceHeight,
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                transformOrigin: "center center",
                transition: isPanning ? "none" : "transform 0.15s ease-out",
              }}
            >
              {renderDeviceFrame(iframeRef)}
            </div>

            {/* Zoom controls */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-background/90 backdrop-blur-sm border border-border rounded-lg px-2 py-1 shadow-md">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={zoomOut}>
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs font-mono w-12 text-center text-muted-foreground">{Math.round(zoom * 100)}%</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={zoomIn}>
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
              <div className="w-px h-4 bg-border mx-0.5" />
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={resetView}>
                <Maximize className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Follow-up iteration bar */}
          {onIterate && (
            <div className="mt-3 flex gap-2">
              <div className="flex-1 relative">
                <Textarea
                  placeholder="Iterate: 'make the header darker', 'change to blue scheme'..."
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleIterate(); }
                  }}
                  className="min-h-[44px] max-h-[80px] resize-none pr-12 text-sm"
                />
                <Button
                  size="icon"
                  disabled={!followUp.trim() || iterating}
                  onClick={handleIterate}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 gradient-primary text-primary-foreground rounded-lg"
                >
                  {iterating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              {history.length > 0 && (
                <Button variant="outline" size="sm" onClick={undoIteration} className="self-center">
                  Undo
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Inspection Panel */}
        <div className="w-[380px] flex flex-col glass rounded-xl overflow-hidden relative z-[100]">
          <Tabs defaultValue="html" className="flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-border/50 bg-transparent px-2">
              <TabsList className="justify-start rounded-none bg-transparent border-0">
                <TabsTrigger value="html" className="text-xs">HTML</TabsTrigger>
                <TabsTrigger value="css" className="text-xs">CSS</TabsTrigger>
                <TabsTrigger value="layers" className="text-xs flex items-center gap-1">
                  <Layers className="h-3 w-3" /> Layers
                </TabsTrigger>
                <TabsTrigger value="props" className="text-xs flex items-center gap-1">
                  <Settings2 className="h-3 w-3" /> Inspect
                </TabsTrigger>
              </TabsList>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={exportPNG} title="Export as PNG (3x)">
                <ImageIcon className="h-3.5 w-3.5" />
              </Button>
            </div>

            <TabsContent value="html" className="flex-1 overflow-auto m-0 p-0">
              <pre className="p-4 text-xs font-mono leading-relaxed text-muted-foreground overflow-auto h-full bg-card/30">
                <code>{editedHtml}</code>
              </pre>
            </TabsContent>
            <TabsContent value="css" className="flex-1 overflow-auto m-0 p-0">
              <pre className="p-4 text-xs font-mono leading-relaxed text-muted-foreground overflow-auto h-full bg-card/30">
                <code>{editedCss}</code>
              </pre>
            </TabsContent>
            <TabsContent value="layers" className="flex-1 overflow-hidden m-0 p-0 bg-card/30">
              <LayersPanel svgCode={variant.svg || ""} />
            </TabsContent>
            <TabsContent value="props" className="flex-1 overflow-hidden m-0 p-0 bg-card/30">
              <PropertiesPanel tokens={variant.metadata?.extractedTokens} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
}
