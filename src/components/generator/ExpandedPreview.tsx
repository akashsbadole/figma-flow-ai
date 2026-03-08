import { useState, useRef, useCallback, useEffect, WheelEvent as ReactWheelEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Copy, Code, Download, Check, MousePointer, Sparkles, Loader2, FileImage, Send, ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Variant {
  id: string;
  name: string;
  html: string;
  css: string;
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

  const copyToFigma = async () => {
    try {
      const htmlBlob = new Blob([`<style>${editedCss}</style>${editedHtml}`], { type: "text/html" });
      const textBlob = new Blob([`<style>${editedCss}</style>${editedHtml}`], { type: "text/plain" });
      await navigator.clipboard.write([
        new ClipboardItem({ "text/html": htmlBlob, "text/plain": textBlob }),
      ]);
      setCopied(true);
      toast({ title: "Copied to clipboard!", description: "Paste directly into Figma" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      await navigator.clipboard.writeText(`<style>${editedCss}</style>\n${editedHtml}`);
      setCopied(true);
      toast({ title: "Copied as HTML" });
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

  const downloadCss = () => {
    const blob = new Blob([editedCss], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${variant.name.replace(/\s+/g, "-").toLowerCase()}.css`;
    a.click();
    URL.revokeObjectURL(url);
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
    const srcDoc = `<style>*{margin:0;padding:0;box-sizing:border-box;}${editedCss}</style>${editedHtml}`;
    const iframeEl = (
      <iframe
        ref={ref as any}
        srcDoc={srcDoc}
        className="w-full h-full border-0"
        title={variant.name}
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
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex"
      onClick={onClose}
    >
      <div
        className="flex flex-1 gap-4 p-6 max-w-[95vw] max-h-[95vh] mx-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Preview side */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">{variant.name}</h2>
            <div className="flex gap-2">
              <Button
                variant={editMode ? "default" : "outline"}
                size="sm"
                onClick={enableDirectEdit}
                className={editMode ? "gradient-primary text-primary-foreground" : ""}
              >
                <MousePointer className="h-4 w-4 mr-1" />
                {editMode ? "Save Edits" : "Direct Edit"}
              </Button>
              <Button variant="outline" size="sm" onClick={copyToFigma}>
                {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                Figma
              </Button>
              <Button variant="outline" size="sm" onClick={downloadHtml}>
                <Download className="h-4 w-4 mr-1" /> HTML
              </Button>
              <Button variant="outline" size="sm" onClick={downloadCss}>
                <Code className="h-4 w-4 mr-1" /> CSS
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
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

        {/* Code panel */}
        <div className="w-[380px] flex flex-col glass rounded-xl overflow-hidden">
          <Tabs defaultValue="html" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-transparent px-2">
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="css">CSS</TabsTrigger>
            </TabsList>
            <TabsContent value="html" className="flex-1 overflow-auto m-0 p-0">
              <pre className="p-4 text-xs font-mono leading-relaxed text-muted-foreground overflow-auto h-full">
                <code>{editedHtml}</code>
              </pre>
            </TabsContent>
            <TabsContent value="css" className="flex-1 overflow-auto m-0 p-0">
              <pre className="p-4 text-xs font-mono leading-relaxed text-muted-foreground overflow-auto h-full">
                <code>{editedCss}</code>
              </pre>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
}
