import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Eye, Copy, Check } from "lucide-react";
import { DesignSystemData } from "./types";
import { generateCSS } from "@/lib/design-system-export";

interface Props {
  designSystem: DesignSystemData;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
}

export const ComponentPreviewsSection = ({ designSystem, copiedKey, onCopy }: Props) => {
  const allComponents = [
    { key: "button", label: "Button", html: designSystem.components.buttonHtml, css: designSystem.components.buttonCss },
    { key: "card", label: "Card", html: designSystem.components.cardHtml, css: designSystem.components.cardCss },
    { key: "input", label: "Input", html: designSystem.components.inputHtml, css: designSystem.components.inputCss },
    { key: "badge", label: "Badge", html: designSystem.components.badgeHtml, css: designSystem.components.badgeCss },
    { key: "alert", label: "Alert", html: designSystem.components.alertHtml, css: designSystem.components.alertCss },
    { key: "avatar", label: "Avatar", html: designSystem.components.avatarHtml, css: designSystem.components.avatarCss },
    { key: "tabs", label: "Tabs", html: designSystem.components.tabsHtml, css: designSystem.components.tabsCss },
    { key: "modal", label: "Modal", html: designSystem.components.modalHtml, css: designSystem.components.modalCss },
    { key: "tooltip", label: "Tooltip", html: designSystem.components.tooltipHtml, css: designSystem.components.tooltipCss },
    { key: "navbar", label: "Navbar", html: designSystem.components.navbarHtml, css: designSystem.components.navbarCss },
    { key: "toggle", label: "Toggle", html: designSystem.components.toggleHtml, css: designSystem.components.toggleCss },
    { key: "dropdown", label: "Dropdown", html: designSystem.components.dropdownHtml, css: designSystem.components.dropdownCss },
  ].filter(c => c.html && c.css);

  if (allComponents.length === 0) return null;

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Eye className="h-4 w-4" /> Component Previews
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="button">
          <TabsList className="flex-wrap h-auto gap-1">
            {allComponents.map((c) => (
              <TabsTrigger key={c.key} value={c.key}>{c.label}</TabsTrigger>
            ))}
          </TabsList>
          {allComponents.map((comp) => (
            <TabsContent key={comp.key} value={comp.key} className="mt-4 space-y-4">
              <div className="rounded-lg border border-border bg-muted/30 p-6">
                <iframe
                  srcDoc={`<!DOCTYPE html><html><head><style>body{margin:0;padding:24px;font-family:'${designSystem.typography.body}',sans-serif;background:${designSystem.colors.background};color:${designSystem.colors.foreground};}${generateCSS(designSystem)}\n${comp.css}</style></head><body>${comp.html}</body></html>`}
                  className="w-full h-[200px] border-0 rounded"
                  title={`${comp.key} preview`}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative">
                  <p className="text-xs font-medium text-muted-foreground mb-2">HTML</p>
                  <pre className="rounded-lg bg-muted p-3 overflow-auto text-xs font-mono max-h-[200px]"><code>{comp.html}</code></pre>
                  <Button size="icon" variant="ghost" className="absolute top-6 right-1 h-7 w-7" onClick={() => onCopy(comp.html!, `${comp.key}-html`)}>
                    {copiedKey === `${comp.key}-html` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                <div className="relative">
                  <p className="text-xs font-medium text-muted-foreground mb-2">CSS</p>
                  <pre className="rounded-lg bg-muted p-3 overflow-auto text-xs font-mono max-h-[200px]"><code>{comp.css}</code></pre>
                  <Button size="icon" variant="ghost" className="absolute top-6 right-1 h-7 w-7" onClick={() => onCopy(comp.css!, `${comp.key}-css`)}>
                    {copiedKey === `${comp.key}-css` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
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
