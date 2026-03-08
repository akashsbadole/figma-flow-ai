import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Copy, Code, Maximize2, FileDown, Braces } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { htmlCssToReactComponent } from "@/lib/export-utils";

interface Variant {
  id: string;
  name: string;
  html: string;
  css: string;
  svg?: string;
}

interface VariantCardProps {
  variant: Variant;
  deviceType: "mobile" | "tablet" | "desktop";
  deviceWidth: number;
  deviceHeight: number;
  isSelected: boolean;
  onSelect: () => void;
  onExpand: () => void;
}

export function VariantCard({
  variant,
  deviceType,
  deviceWidth,
  deviceHeight,
  isSelected,
  onSelect,
  onExpand,
}: VariantCardProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const getScaleFactor = () => {
    if (deviceType === "mobile") return 0.32;
    if (deviceType === "tablet") return 0.25;
    return 0.2;
  };

  const scale = getScaleFactor();
  const containerWidth = deviceWidth * scale;
  const containerHeight = deviceHeight * scale;

  const copyToFigma = async () => {
    const svgContent = variant.svg || `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${deviceWidth} ${deviceHeight}" width="${deviceWidth}" height="${deviceHeight}"><text x="50%" y="50%" text-anchor="middle" font-size="24" fill="#888">No SVG available</text></svg>`;
    
    try {
      const htmlBlob = new Blob([svgContent], { type: "text/html" });
      const textBlob = new Blob([svgContent], { type: "text/plain" });

      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": htmlBlob,
          "text/plain": textBlob,
        }),
      ]);

      setCopied(true);
      toast({ title: "Design copied as SVG!", description: "Paste into Figma — elements are editable" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      await navigator.clipboard.writeText(svgContent);
      setCopied(true);
      toast({ title: "SVG copied as text", description: "Paste into Figma or save as .svg file" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyCode = async () => {
    const fullCode = `<!DOCTYPE html>\n<html>\n<head>\n<style>\n${variant.css}\n</style>\n</head>\n<body>\n${variant.html}\n</body>\n</html>`;
    await navigator.clipboard.writeText(fullCode);
    toast({ title: "HTML code copied!" });
  };

  const copyAsReact = async () => {
    const code = htmlCssToReactComponent(variant.name, variant.html, variant.css);
    await navigator.clipboard.writeText(code);
    toast({ title: "React component copied!" });
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

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 cursor-pointer border-2",
        isSelected
          ? "border-primary shadow-glow"
          : "border-border/50 hover:border-primary/30 hover:shadow-elevated"
      )}
      onClick={onSelect}
    >
      {/* Preview */}
      <div
        className="relative bg-muted flex items-start justify-center pt-4 pb-2 overflow-hidden"
        style={{ height: containerHeight + 32 }}
      >
        <div
          style={{
            width: deviceWidth,
            height: deviceHeight,
            transform: `scale(${scale})`,
            transformOrigin: "top center",
          }}
        >
          {deviceType === "mobile" && (
            <div className="relative rounded-[2.5rem] bg-foreground/90 p-3 h-full shadow-lg">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-foreground/90 rounded-b-2xl z-10" />
              <div className="w-full h-full rounded-[2rem] overflow-hidden bg-background">
                <iframe
                  srcDoc={`<style>*{margin:0;padding:0;box-sizing:border-box;}${variant.css}</style>${variant.html}`}
                  className="w-full h-full border-0"
                  title={variant.name}
                  sandbox="allow-scripts"
                />
              </div>
            </div>
          )}
          {deviceType === "tablet" && (
            <div className="relative rounded-[1.5rem] bg-foreground/90 p-3 h-full shadow-lg">
              <div className="w-full h-full rounded-[1rem] overflow-hidden bg-background">
                <iframe
                  srcDoc={`<style>*{margin:0;padding:0;box-sizing:border-box;}${variant.css}</style>${variant.html}`}
                  className="w-full h-full border-0"
                  title={variant.name}
                  sandbox="allow-scripts"
                />
              </div>
            </div>
          )}
          {deviceType === "desktop" && (
            <div className="relative rounded-xl bg-foreground/90 shadow-lg h-full flex flex-col">
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/20">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 overflow-hidden bg-background">
                <iframe
                  srcDoc={`<style>*{margin:0;padding:0;box-sizing:border-box;}${variant.css}</style>${variant.html}`}
                  className="w-full h-full border-0"
                  title={variant.name}
                  sandbox="allow-scripts"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions bar */}
      <div className="p-3 flex items-center justify-between border-t border-border/50">
        <span className="text-sm font-medium truncate">{variant.name}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => { e.stopPropagation(); copyToFigma(); }}
            title="Copy for Figma"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => { e.stopPropagation(); copyCode(); }}
            title="Copy HTML code"
          >
            <Code className="h-3.5 w-3.5" />
          </Button>
          {variant.svg && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => { e.stopPropagation(); downloadSvg(); }}
              title="Download SVG"
            >
              <FileDown className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => { e.stopPropagation(); copyAsReact(); }}
            title="Copy as React component"
          >
            <Braces className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => { e.stopPropagation(); onExpand(); }}
            title="Expand preview"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
