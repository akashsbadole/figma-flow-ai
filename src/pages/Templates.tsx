import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { LayoutGrid, Search, Heart, Download, Code, Eye, Copy, Check, Loader2 } from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string;
  thumbnail_url: string | null;
  tags: string[] | null;
  html_code: string;
  css_code: string;
  is_premium: boolean | null;
}

const categories = ["All", "Landing Pages", "Dashboards", "Forms", "Cards", "Navigation", "E-commerce"];

const Templates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data, error } = await supabase.from("templates").select("*").order("created_at", { ascending: false });
      if (!error && data) setTemplates(data as Template[]);
      setLoading(false);
    };
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchSaved = async () => {
      const { data } = await supabase
        .from("saved_templates")
        .select("template_id")
        .eq("user_id", user.id);
      if (data) setSavedIds(new Set(data.map((s) => s.template_id)));
    };
    fetchSaved();
  }, [user]);

  const filtered = templates.filter((t) => {
    const matchesSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.tags || []).some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleSave = async (templateId: string) => {
    if (!user) return;
    const isSaved = savedIds.has(templateId);

    if (isSaved) {
      await supabase.from("saved_templates").delete().eq("user_id", user.id).eq("template_id", templateId);
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(templateId);
        return next;
      });
      toast({ title: "Removed from saved" });
    } else {
      await supabase.from("saved_templates").insert({ user_id: user.id, template_id: templateId });
      setSavedIds((prev) => new Set(prev).add(templateId));
      toast({ title: "Saved!" });
    }
  };

  const downloadTemplate = (template: Template, format: "html" | "code") => {
    const content =
      format === "html"
        ? `<!DOCTYPE html>\n<html>\n<head>\n<style>\n${template.css_code}\n</style>\n</head>\n<body>\n${template.html_code}\n</body>\n</html>`
        : `/* HTML */\n${template.html_code}\n\n/* CSS */\n${template.css_code}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.name.toLowerCase().replace(/\s+/g, "-")}.${format === "html" ? "html" : "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!", description: `${template.name} downloaded as ${format.toUpperCase()}` });
  };

  const copyToFigma = async (template: Template) => {
    const html = `<style>${template.css_code}</style>${template.html_code}`;
    try {
      const htmlBlob = new Blob([html], { type: "text/html" });
      const textBlob = new Blob([html], { type: "text/plain" });
      await navigator.clipboard.write([new ClipboardItem({ "text/html": htmlBlob, "text/plain": textBlob })]);
      toast({ title: "Copied for Figma!", description: "Paste directly into Figma" });
    } catch {
      await navigator.clipboard.writeText(html);
      toast({ title: "Copied as HTML" });
    }
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LayoutGrid className="h-8 w-8 text-accent" />
            Template Gallery
          </h1>
          <p className="text-muted-foreground mt-1">Browse and download pre-made UI templates</p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={selectedCategory === cat ? "gradient-primary text-primary-foreground" : ""}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <LayoutGrid className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No templates found. {templates.length === 0 ? "Templates will appear here once added." : "Try a different search."}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((template, i) => (
              <motion.div key={template.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="overflow-hidden hover:shadow-elevated transition-all duration-300 group border-border/50">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    <iframe
                      srcDoc={`<style>body{margin:0;transform:scale(0.5);transform-origin:0 0;width:200%;height:200%;}${template.css_code}</style>${template.html_code}`}
                      className="w-full h-full pointer-events-none"
                      title={template.name}
                      sandbox=""
                    />
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button size="sm" variant="secondary" onClick={() => setPreviewTemplate(template)}>
                        <Eye className="h-4 w-4 mr-1" /> Preview
                      </Button>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <button onClick={() => toggleSave(template.id)} className="text-muted-foreground hover:text-primary transition-colors">
                        <Heart className={`h-4 w-4 ${savedIds.has(template.id) ? "fill-primary text-primary" : ""}`} />
                      </button>
                    </div>
                    <CardDescription className="text-xs">{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-1 mb-3 flex-wrap">
                      {(template.tags || []).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => copyToFigma(template)}>
                        <Copy className="h-3 w-3 mr-1" /> Figma
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => downloadTemplate(template, "html")}>
                        <Download className="h-3 w-3 mr-1" /> HTML
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => downloadTemplate(template, "code")}>
                        <Code className="h-3 w-3 mr-1" /> Code
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>{previewTemplate?.name}</DialogTitle>
              <DialogDescription>{previewTemplate?.description}</DialogDescription>
            </DialogHeader>
            {previewTemplate && (
              <Tabs defaultValue="preview">
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="html">HTML</TabsTrigger>
                  <TabsTrigger value="css">CSS</TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="mt-4">
                  <div className="rounded-lg overflow-hidden border border-border">
                    <iframe srcDoc={`<style>${previewTemplate.css_code}</style>${previewTemplate.html_code}`} className="w-full h-[500px]" title="Template preview" sandbox="allow-scripts" />
                  </div>
                </TabsContent>
                <TabsContent value="html" className="mt-4">
                  <pre className="rounded-lg bg-muted p-4 overflow-auto text-sm font-mono max-h-[400px]">
                    <code>{previewTemplate.html_code}</code>
                  </pre>
                </TabsContent>
                <TabsContent value="css" className="mt-4">
                  <pre className="rounded-lg bg-muted p-4 overflow-auto text-sm font-mono max-h-[400px]">
                    <code>{previewTemplate.css_code}</code>
                  </pre>
                </TabsContent>
              </Tabs>
            )}
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => previewTemplate && copyToFigma(previewTemplate)}>
                <Copy className="h-4 w-4 mr-1" /> Copy for Figma
              </Button>
              <Button variant="outline" onClick={() => previewTemplate && downloadTemplate(previewTemplate, "html")}>
                <Download className="h-4 w-4 mr-1" /> Download HTML
              </Button>
              <Button variant="outline" onClick={() => previewTemplate && downloadTemplate(previewTemplate, "code")}>
                <Code className="h-4 w-4 mr-1" /> Download Code
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Templates;
