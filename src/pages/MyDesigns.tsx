import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Search, Trash2, Copy, Code, Download, Eye, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Design {
  id: string;
  prompt: string;
  html_code: string | null;
  css_code: string | null;
  svg_code: string | null;
  image_url: string | null;
  created_at: string;
}

const MyDesigns = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<Design | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchDesigns();
  }, [user]);

  const fetchDesigns = async () => {
    const { data } = await supabase
      .from("designs")
      .select("*")
      .order("created_at", { ascending: false });
    setDesigns(data || []);
    setLoading(false);
  };

  const deleteDesign = async (id: string) => {
    await supabase.from("designs").delete().eq("id", id);
    setDesigns((prev) => prev.filter((d) => d.id !== id));
    toast({ title: "Design deleted" });
  };

  const copyToFigma = async (design: Design) => {
    const html = `<style>${design.css_code || ""}</style>${design.html_code || ""}`;
    try {
      const htmlBlob = new Blob([html], { type: "text/html" });
      const textBlob = new Blob([html], { type: "text/plain" });
      await navigator.clipboard.write([
        new ClipboardItem({ "text/html": htmlBlob, "text/plain": textBlob }),
      ]);
      toast({ title: "Copied for Figma!", description: "Paste into Figma" });
    } catch {
      await navigator.clipboard.writeText(html);
      toast({ title: "Copied as HTML" });
    }
  };

  const downloadDesign = (design: Design) => {
    const full = `<!DOCTYPE html>\n<html>\n<head>\n<style>\n${design.css_code || ""}\n</style>\n</head>\n<body>\n${design.html_code || ""}\n</body>\n</html>`;
    const blob = new Blob([full], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `design-${design.id.slice(0, 8)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = designs.filter((d) =>
    !search || d.prompt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Clock className="h-8 w-8 text-primary" />
            My Designs
          </h1>
          <p className="text-muted-foreground mt-1">Browse, manage, and export your generated designs</p>
        </motion.div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search designs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Designs Grid */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted" />
                <CardContent className="p-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Clock className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground">
              {search ? "No matching designs" : "No designs yet"}
            </h3>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {search ? "Try a different search term" : "Generate your first design from the AI Generator"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((design, i) => (
              <motion.div
                key={design.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="overflow-hidden group hover:shadow-elevated transition-all border-border/50">
                  {/* Preview */}
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {design.image_url ? (
                      <img src={design.image_url} alt={design.prompt} className="w-full h-full object-cover" />
                    ) : design.html_code ? (
                      <iframe
                        srcDoc={`<style>body{margin:0;transform:scale(0.4);transform-origin:0 0;width:250%;height:250%;}${design.css_code || ""}</style>${design.html_code}`}
                        className="w-full h-full pointer-events-none border-0"
                        title={design.prompt}
                        sandbox=""
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="text-xs text-muted-foreground">No preview</p>
                      </div>
                    )}

                    {/* Overlay actions */}
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <Button size="sm" variant="secondary" onClick={() => setPreview(design)}>
                        <Eye className="h-3 w-3 mr-1" /> View
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-3 space-y-2">
                    <p className="text-sm font-medium truncate">{design.prompt}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(design.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <div className="flex gap-1.5 pt-1">
                      <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => copyToFigma(design)}>
                        <Copy className="h-3 w-3 mr-1" /> Figma
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => downloadDesign(design)}>
                        <Download className="h-3 w-3 mr-1" /> HTML
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 text-xs text-muted-foreground hover:text-destructive" onClick={() => deleteDesign(design.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Preview Dialog */}
        <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>{preview?.prompt}</DialogTitle>
            </DialogHeader>
            {preview && (
              <>
                <Tabs defaultValue="preview">
                  <TabsList>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    {preview.html_code && <TabsTrigger value="html">HTML</TabsTrigger>}
                    {preview.css_code && <TabsTrigger value="css">CSS</TabsTrigger>}
                  </TabsList>
                  <TabsContent value="preview" className="mt-4">
                    <div className="rounded-lg overflow-hidden border border-border">
                      {preview.image_url ? (
                        <img src={preview.image_url} alt={preview.prompt} className="w-full" />
                      ) : (
                        <iframe
                          srcDoc={`<style>${preview.css_code || ""}</style>${preview.html_code || ""}`}
                          className="w-full h-[500px] border-0"
                          title="Preview"
                        />
                      )}
                    </div>
                  </TabsContent>
                  {preview.html_code && (
                    <TabsContent value="html" className="mt-4">
                      <pre className="rounded-lg bg-muted p-4 overflow-auto text-xs font-mono max-h-[400px]">
                        <code>{preview.html_code}</code>
                      </pre>
                    </TabsContent>
                  )}
                  {preview.css_code && (
                    <TabsContent value="css" className="mt-4">
                      <pre className="rounded-lg bg-muted p-4 overflow-auto text-xs font-mono max-h-[400px]">
                        <code>{preview.css_code}</code>
                      </pre>
                    </TabsContent>
                  )}
                </Tabs>
                <div className="flex gap-2 justify-end mt-4">
                  <Button variant="outline" onClick={() => copyToFigma(preview)}>
                    <Copy className="h-4 w-4 mr-1" /> Copy for Figma
                  </Button>
                  <Button variant="outline" onClick={() => downloadDesign(preview)}>
                    <Download className="h-4 w-4 mr-1" /> Download HTML
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default MyDesigns;
