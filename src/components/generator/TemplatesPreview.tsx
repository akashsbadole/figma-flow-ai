import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Download, Check, Loader2, LayoutTemplate, FileText, Database, Navigation, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/integrations/neon/client";
import { cn } from "@/lib/utils";

interface TemplateItem {
  id: string;
  name: string;
  category: string;
  html: string;
  css: string;
}

interface TemplatesPreviewProps {
  screens: TemplateItem[];
  components: TemplateItem[];
  pageLayouts?: TemplateItem[];
  formPatterns?: TemplateItem[];
  dataDisplay?: TemplateItem[];
  navigationPatterns?: TemplateItem[];
  deviceWidth: number;
  deviceHeight: number;
  loading: boolean;
  error?: string | null;
}

function TemplateCard({ item, width, height, isScreen }: { item: TemplateItem; width: number; height: number; isScreen: boolean }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const cardHeight = isScreen ? height : 400;
  const scale = isScreen ? Math.min(280 / width, 320 / height) : Math.min(280 / width, 200 / 400);

  const copyCode = async () => {
    const full = `<!DOCTYPE html>\n<html>\n<head><style>\n${item.css}\n</style></head>\n<body>\n${item.html}\n</body>\n</html>`;
    await navigator.clipboard.writeText(full);
    setCopied(true);
    toast({ title: "Code copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadHtml = () => {
    const full = `<!DOCTYPE html>\n<html>\n<head><meta charset="utf-8"><style>\n${item.css}\n</style></head>\n<body>\n${item.html}\n</body>\n</html>`;
    const blob = new Blob([full], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.name.replace(/\s+/g, "-").toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    try {
      await api.createTemplate({
        name: item.name,
        category: item.category,
        html_code: item.html,
        css_code: item.css,
        tags: [item.category.toLowerCase()],
        metadata: { generated: true }
      });
      setSaved(true);
      toast({ title: "Saved to Library!", description: "You can find this in your templates." });
    } catch (err: any) {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all">
      <div className="bg-muted flex items-start justify-center pt-3 pb-2 overflow-hidden" style={{ height: isScreen ? 260 : 180 }}>
        <div
          style={{
            width,
            height: cardHeight,
            transform: `scale(${scale})`,
            transformOrigin: "top center",
          }}
        >
          <iframe
            srcDoc={`<style>*{margin:0;padding:0;box-sizing:border-box;}${item.css}</style>${item.html}`}
            className="w-full h-full border-0 rounded"
            title={item.name}
            sandbox="allow-scripts"
          />
        </div>
      </div>
      <div className="p-3 flex items-center justify-between border-t border-border/50">
        <div>
          <p className="text-sm font-medium truncate">{item.name}</p>
          <p className="text-[10px] text-muted-foreground">{item.category}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSave} title="Save to Library">
            <Heart className={cn("h-3.5 w-3.5", saved && "fill-primary text-primary")} />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copyCode} title="Copy code">
            {copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Code className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={downloadHtml} title="Download">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function TemplateGrid({ items, width, height, isScreen }: { items: TemplateItem[]; width: number; height: number; isScreen: boolean }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground text-center py-4">No templates generated</p>;
  return (
    <div className={`grid grid-cols-1 ${isScreen ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-4"} gap-4`}>
      {items.map((item) => (
        <TemplateCard key={item.id} item={item} width={width} height={isScreen ? height : 400} isScreen={isScreen} />
      ))}
    </div>
  );
}

export function TemplatesPreview({ screens, components, pageLayouts, formPatterns, dataDisplay, navigationPatterns, deviceWidth, deviceHeight, loading, error }: TemplatesPreviewProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Generating templates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  // Use new categories if available, fall back to legacy
  const layouts = pageLayouts?.length ? pageLayouts : screens;
  const forms = formPatterns || [];
  const dataItems = dataDisplay || [];
  const navItems = navigationPatterns || [];
  const comps = components || [];

  const totalCount = layouts.length + forms.length + dataItems.length + navItems.length + comps.length;

  if (totalCount === 0) {
    return (
      <div className="text-center py-8">
        <LayoutTemplate className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">Templates will appear here</p>
      </div>
    );
  }

  // Determine which tabs have content
  const tabs = [
    { value: "layouts", label: "Page Layouts", icon: LayoutTemplate, items: layouts, isScreen: true, count: layouts.length },
    { value: "forms", label: "Forms", icon: FileText, items: forms, isScreen: true, count: forms.length },
    { value: "data", label: "Data Display", icon: Database, items: dataItems, isScreen: true, count: dataItems.length },
    { value: "navigation", label: "Navigation", icon: Navigation, items: navItems, isScreen: false, count: navItems.length },
    { value: "components", label: "Components", icon: Code, items: comps, isScreen: false, count: comps.length },
  ].filter(t => t.count > 0);

  const defaultTab = tabs[0]?.value || "layouts";

  return (
    <Tabs defaultValue={defaultTab} className="space-y-4">
      <TabsList className="flex-wrap h-auto gap-1">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label} ({tab.count})
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          <TemplateGrid items={tab.items} width={deviceWidth} height={deviceHeight} isScreen={tab.isScreen} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
