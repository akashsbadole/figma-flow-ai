import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/integrations/neon/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Clock, Search, Trash2, Copy, Download, Eye, X, Filter, Image, Code, FileImage, LayoutGrid, List, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import html2canvas from "html2canvas";

interface Design {
  id: string;
  prompt: string;
  html_code: string | null;
  css_code: string | null;
  svg_code: string | null;
  image_url: string | null;
  created_at: string;
}

type ViewMode = "grid" | "list";
type SortBy = "newest" | "oldest" | "prompt";
type TimeFilter = "all" | "today" | "week" | "month";

const MyDesigns = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<Design | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [selectedDesigns, setSelectedDesigns] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    fetchDesigns();
  }, [user]);

  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const data = await api.getDesigns();
      if (Array.isArray(data)) {
        setDesigns(data);
      } else {
        console.error('Designs API returned non-array data:', data);
        setDesigns([]);
      }
    } catch (error) {
      console.error('Failed to fetch designs:', error);
      toast({ 
        title: "Error", 
        description: "Failed to load designs. Please try again later.",
        variant: "destructive"
      });
      setDesigns([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteDesign = async (id: string) => {
    try {
      await api.deleteDesign(id);
      setDesigns((prev) => prev.filter((d) => d.id !== id));
      setSelectedDesigns((prev) => { const n = new Set(prev); n.delete(id); return n; });
      toast({ title: "Design deleted" });
    } catch (error) {
      console.error('Failed to delete design:', error);
      toast({ 
        title: "Error", 
        description: "Failed to delete design. Please try again.",
        variant: "destructive"
      });
    }
  };

  const bulkDelete = async () => {
    const ids = Array.from(selectedDesigns);
    try {
      for (const id of ids) {
        await api.deleteDesign(id);
      }
      setDesigns((prev) => prev.filter((d) => !selectedDesigns.has(d.id)));
      setSelectedDesigns(new Set());
      toast({ title: `${ids.length} designs deleted` });
    } catch (error) {
      console.error('Failed to bulk delete designs:', error);
      toast({ 
        title: "Error", 
        description: "Failed to delete some designs. Please try again.",
        variant: "destructive"
      });
    }
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

  const downloadDesign = (design: Design, format: "html" | "css" | "both") => {
    if (format === "css") {
      const blob = new Blob([design.css_code || ""], { type: "text/css" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `design-${design.id.slice(0, 8)}.css`; a.click();
      URL.revokeObjectURL(url);
      return;
    }
    const full = `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<style>\n${design.css_code || ""}\n</style>\n</head>\n<body>\n${design.html_code || ""}\n</body>\n</html>`;
    const blob = new Blob([full], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `design-${design.id.slice(0, 8)}.html`; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAsImage = async (design: Design) => {
    const container = document.createElement("div");
    container.style.width = "390px";
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.innerHTML = `<style>${design.css_code || ""}</style>${design.html_code || ""}`;
    document.body.appendChild(container);
    try {
      const canvas = await html2canvas(container, { useCORS: true, width: 390, height: 844 });
      const link = document.createElement("a");
      link.download = `design-${design.id.slice(0, 8)}.png`;
      link.href = canvas.toDataURL();
      link.click();
      toast({ title: "Image downloaded!" });
    } catch {
      toast({ title: "Image export failed", variant: "destructive" });
    } finally {
      document.body.removeChild(container);
    }
  };

  const filtered = useMemo(() => {
    let result = designs;
    
    // Search filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((d) => d.prompt.toLowerCase().includes(q));
    }

    // Time filter
    if (timeFilter !== "all") {
      const now = new Date();
      const cutoff = new Date();
      if (timeFilter === "today") cutoff.setHours(0, 0, 0, 0);
      if (timeFilter === "week") cutoff.setDate(now.getDate() - 7);
      if (timeFilter === "month") cutoff.setMonth(now.getMonth() - 1);
      result = result.filter((d) => new Date(d.created_at) >= cutoff);
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return a.prompt.localeCompare(b.prompt);
    });

    return result;
  }, [designs, search, timeFilter, sortBy]);

  const toggleSelect = (id: string) => {
    setSelectedDesigns((prev) => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      return n;
    });
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Clock className="h-8 w-8 text-primary" />
            My Designs
          </h1>
          <p className="text-muted-foreground mt-1">
            {designs.length} design{designs.length !== 1 ? "s" : ""} generated
          </p>
        </motion.div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-1 w-full sm:w-auto">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by prompt..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
              <SelectTrigger className="w-[130px]">
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This week</SelectItem>
                <SelectItem value="month">This month</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
              <SelectTrigger className="w-[130px]">
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="prompt">A–Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 items-center">
            {selectedDesigns.size > 0 && (
              <Button size="sm" variant="destructive" onClick={bulkDelete}>
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete {selectedDesigns.size}
              </Button>
            )}
            <div className="flex bg-muted rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        {search && (
          <p className="text-sm text-muted-foreground">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"
          </p>
        )}

        {/* Designs */}
        {loading ? (
          <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className={viewMode === "grid" ? "aspect-video bg-muted" : "h-20 bg-muted"} />
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
        ) : viewMode === "grid" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((design, i) => (
              <motion.div
                key={design.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className={`overflow-hidden group hover:shadow-elevated transition-all ${selectedDesigns.has(design.id) ? "border-primary border-2" : "border-border/50"}`}>
                  <div className="aspect-video bg-muted relative overflow-hidden cursor-pointer" onClick={() => toggleSelect(design.id)}>
                    {design.html_code ? (
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
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setPreview(design); }}>
                        <Eye className="h-3 w-3 mr-1" /> View
                      </Button>
                    </div>
                    {selectedDesigns.has(design.id) && (
                      <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3 space-y-2">
                    <p className="text-sm font-medium truncate">{design.prompt}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(design.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    <div className="flex gap-1.5 pt-1">
                      <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => copyToFigma(design)}>
                        <Copy className="h-3 w-3 mr-1" /> Figma
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => downloadDesign(design, "html")}>
                        <Code className="h-3 w-3 mr-1" /> HTML
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => downloadAsImage(design)}>
                        <FileImage className="h-3 w-3" />
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
        ) : (
          <div className="space-y-2">
            {filtered.map((design, i) => (
              <motion.div
                key={design.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <Card className={`flex items-center gap-4 p-3 hover:shadow-elevated transition-all ${selectedDesigns.has(design.id) ? "border-primary border-2" : "border-border/50"}`}>
                  <div
                    className="w-24 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0 cursor-pointer"
                    onClick={() => toggleSelect(design.id)}
                  >
                    {design.html_code && (
                      <iframe
                        srcDoc={`<style>body{margin:0;transform:scale(0.15);transform-origin:0 0;width:666%;height:666%;}${design.css_code || ""}</style>${design.html_code}`}
                        className="w-full h-full pointer-events-none border-0"
                        title={design.prompt}
                        sandbox=""
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{design.prompt}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(design.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <Button size="sm" variant="ghost" className="h-8 w-8" onClick={() => setPreview(design)}><Eye className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8" onClick={() => copyToFigma(design)}><Copy className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8" onClick={() => downloadDesign(design, "html")}><Download className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8" onClick={() => downloadAsImage(design)}><FileImage className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteDesign(design.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
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
                      <iframe
                        srcDoc={`<style>${preview.css_code || ""}</style>${preview.html_code || ""}`}
                        className="w-full h-[500px] border-0"
                        title="Preview"
                      />
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
                <div className="flex gap-2 justify-end mt-4 flex-wrap">
                  <Button variant="outline" onClick={() => copyToFigma(preview)}>
                    <Copy className="h-4 w-4 mr-1" /> Copy for Figma
                  </Button>
                  <Button variant="outline" onClick={() => downloadDesign(preview, "html")}>
                    <Code className="h-4 w-4 mr-1" /> Download HTML
                  </Button>
                  <Button variant="outline" onClick={() => downloadDesign(preview, "css")}>
                    <Download className="h-4 w-4 mr-1" /> Download CSS
                  </Button>
                  <Button variant="outline" onClick={() => downloadAsImage(preview)}>
                    <FileImage className="h-4 w-4 mr-1" /> Download PNG
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
