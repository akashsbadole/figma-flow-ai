import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Clock, Wand2, Palette, LayoutTemplate, Image, Trash2, Eye, Code, Download, Loader2
} from "lucide-react";

interface HistoryItem {
  id: string;
  type: string;
  prompt: string;
  result: any;
  metadata: any;
  created_at: string;
}

const typeConfig: Record<string, { icon: any; label: string; color: string }> = {
  variant: { icon: Wand2, label: "UI Variant", color: "text-blue-500" },
  design_system: { icon: Palette, label: "Design System", color: "text-purple-500" },
  template: { icon: LayoutTemplate, label: "Template", color: "text-green-500" },
  image_to_design: { icon: Image, label: "Image to Design", color: "text-orange-500" },
};

function HistoryCard({ item, onDelete, onPreview }: { item: HistoryItem; onDelete: (id: string) => void; onPreview: (item: HistoryItem) => void }) {
  const config = typeConfig[item.type] || typeConfig.variant;
  const Icon = config.icon;

  return (
    <Card className="p-4 border-border/50 hover:border-primary/30 transition-all group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className={`mt-0.5 ${config.color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted">{config.label}</span>
              <span className="text-[10px] text-muted-foreground">
                {new Date(item.created_at).toLocaleDateString()} · {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-sm font-medium truncate">{item.prompt}</p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onPreview(item)} title="Preview">
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(item.id)} title="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function PreviewModal({ item, onClose }: { item: HistoryItem; onClose: () => void }) {
  const { toast } = useToast();
  const result = item.result;

  const copyCode = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    toast({ title: "Result copied!" });
  };

  const downloadResult = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.type}-${item.id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-border rounded-xl shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{item.prompt}</h3>
            <p className="text-xs text-muted-foreground">{typeConfig[item.type]?.label} · {new Date(item.created_at).toLocaleString()}</p>
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={copyCode}>
              <Code className="h-3 w-3" /> Copy
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={downloadResult}>
              <Download className="h-3 w-3" /> Download
            </Button>
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={onClose}>Close</Button>
          </div>
        </div>
        <div className="p-4 overflow-auto max-h-[60vh]">
          {item.type === 'variant' && result.html && (
            <iframe
              srcDoc={`<style>*{margin:0;padding:0;box-sizing:border-box;}${result.css || ''}</style>${result.html}`}
              className="w-full h-[400px] border rounded-lg"
              title="Preview"
              sandbox="allow-scripts"
            />
          )}
          {item.type !== 'variant' && (
            <pre className="text-xs font-mono bg-muted rounded-lg p-4 overflow-auto whitespace-pre-wrap">
              {JSON.stringify(result, null, 2).slice(0, 5000)}
            </pre>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

const History = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewItem, setPreviewItem] = useState<HistoryItem | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  const loadHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("generation_history")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      toast({ title: "Failed to load history", variant: "destructive" });
    } else {
      setHistory((data as any[]) || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("generation_history").delete().eq("id", id);
    if (error) {
      toast({ title: "Failed to delete", variant: "destructive" });
    } else {
      setHistory((prev) => prev.filter((h) => h.id !== id));
      toast({ title: "Deleted" });
    }
  };

  const filtered = activeTab === "all" ? history : history.filter((h) => h.type === activeTab);

  const typeCounts = {
    all: history.length,
    variant: history.filter((h) => h.type === "variant").length,
    design_system: history.filter((h) => h.type === "design_system").length,
    template: history.filter((h) => h.type === "template").length,
    image_to_design: history.filter((h) => h.type === "image_to_design").length,
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Clock className="h-8 w-8 text-primary" />
            Generation History
          </h1>
          <p className="text-muted-foreground mt-1">View and manage all your past generations</p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="all">All ({typeCounts.all})</TabsTrigger>
            <TabsTrigger value="variant" className="gap-1"><Wand2 className="h-3 w-3" /> Variants ({typeCounts.variant})</TabsTrigger>
            <TabsTrigger value="design_system" className="gap-1"><Palette className="h-3 w-3" /> Systems ({typeCounts.design_system})</TabsTrigger>
            <TabsTrigger value="template" className="gap-1"><LayoutTemplate className="h-3 w-3" /> Templates ({typeCounts.template})</TabsTrigger>
            <TabsTrigger value="image_to_design" className="gap-1"><Image className="h-3 w-3" /> Image ({typeCounts.image_to_design})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">No history yet. Start generating!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((item, i) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <HistoryCard item={item} onDelete={handleDelete} onPreview={setPreviewItem} />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {previewItem && <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />}
      </div>
    </AppLayout>
  );
};

export default History;
