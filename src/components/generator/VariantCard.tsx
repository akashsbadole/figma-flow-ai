import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Copy, Code, Maximize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Variant {
  id: string;
  name: string;
  html: string;
  css: string;
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
    try {
      // Create an offscreen container to render the design at full size
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.width = `${deviceWidth}px`;
      container.style.height = `${deviceHeight}px`;
      container.style.overflow = "hidden";
      container.style.background = "white";
      container.innerHTML = `<style>*{margin:0;padding:0;box-sizing:border-box;}${variant.css}</style>${variant.html}`;
      document.body.appendChild(container);

      const canvas = await html2canvas(container, {
        width: deviceWidth,
        height: deviceHeight,
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      document.body.removeChild(container);

      // Convert canvas to blob and copy as image
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Failed to create image"))), "image/png");
      });

      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);

      setCopied(true);
      toast({ title: "Design copied as image!", description: "Paste into Figma or any design tool" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: copy HTML code
      await navigator.clipboard.writeText(`<style>${variant.css}</style>\n${variant.html}`);
      setCopied(true);
      toast({ title: "Copied as HTML code", description: "Image copy not supported — HTML copied instead" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyCode = async () => {
    const fullCode = `<!DOCTYPE html>\n<html>\n<head>\n<style>\n${variant.css}\n</style>\n</head>\n<body>\n${variant.html}\n</body>\n</html>`;
    await navigator.clipboard.writeText(fullCode);
    toast({ title: "HTML code copied!" });
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
