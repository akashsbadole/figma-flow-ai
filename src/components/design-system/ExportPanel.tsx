import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Code, Download, Copy, Check } from "lucide-react";
import { DesignSystemData } from "./types";
import {
  generateCSS,
  generateSCSS,
  generateTailwindConfig,
  generateFigmaTokens,
  generateStyleDictionary,
} from "@/lib/design-system-export";

interface Props {
  designSystem: DesignSystemData;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
  onDownloadAll: () => void;
  onDownloadFile: (content: string, filename: string) => void;
}

export const ExportPanel = ({ designSystem, copiedKey, onCopy, onDownloadAll, onDownloadFile }: Props) => {
  const formats = [
    { key: "figma", gen: () => generateFigmaTokens(designSystem), file: "figma-tokens.json", label: "Import into Figma using the Tokens Studio plugin" },
    { key: "css", gen: () => generateCSS(designSystem), file: "design-system.css", label: "CSS custom properties for web projects" },
    { key: "scss", gen: () => generateSCSS(designSystem), file: "design-system.scss", label: "SCSS variables with mixins" },
    { key: "tailwind", gen: () => generateTailwindConfig(designSystem), file: "tailwind.config.ts", label: "Tailwind CSS configuration" },
    { key: "style-dict", gen: () => generateStyleDictionary(designSystem), file: "tokens.json", label: "Style Dictionary format for multi-platform" },
  ];

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Code className="h-4 w-4" /> Export
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onDownloadAll}>
            <Download className="h-4 w-4 mr-1" /> Download All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="figma">
          <TabsList className="flex-wrap h-auto gap-1">
            {formats.map((f) => (
              <TabsTrigger key={f.key} value={f.key}>{f.key === "figma" ? "Figma Tokens" : f.key === "css" ? "CSS Variables" : f.key === "scss" ? "SCSS" : f.key === "tailwind" ? "Tailwind" : "Style Dictionary"}</TabsTrigger>
            ))}
          </TabsList>
          {formats.map((fmt) => (
            <TabsContent key={fmt.key} value={fmt.key} className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">{fmt.label}</p>
              <div className="relative">
                <pre className="rounded-lg bg-muted p-4 overflow-auto text-xs font-mono max-h-[400px]"><code>{fmt.gen()}</code></pre>
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8 bg-card/80" onClick={() => onCopy(fmt.gen(), fmt.key)}>
                    {copiedKey === fmt.key ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 bg-card/80" onClick={() => onDownloadFile(fmt.gen(), fmt.file)}>
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
