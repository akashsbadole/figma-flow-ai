import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Download, Code, Image, FileType, Loader2, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Generator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{
    imageUrl?: string;
    htmlCode?: string;
    cssCode?: string;
    svgCode?: string;
  } | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || !user) return;
    setGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-design", {
        body: { prompt: prompt.trim() },
      });

      if (error) throw error;

      setResult({
        imageUrl: data.imageUrl,
        htmlCode: data.htmlCode,
        cssCode: data.cssCode,
        svgCode: data.svgCode,
      });

      // Save to designs table
      await supabase.from("designs").insert({
        user_id: user.id,
        prompt: prompt.trim(),
        image_url: data.imageUrl,
        html_code: data.htmlCode,
        css_code: data.cssCode,
        svg_code: data.svgCode,
      });

      toast({ title: "Design generated!", description: "Your design has been created and saved." });
    } catch (error: any) {
      toast({ title: "Generation failed", description: error.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadImage = async (url: string, filename: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(blobUrl);
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Wand2 className="h-8 w-8 text-primary" />
            AI Design Generator
          </h1>
          <p className="text-muted-foreground mt-1">Describe your design and let AI create it for you</p>
        </motion.div>

        {/* Prompt Input */}
        <Card className="shadow-card border-border/50">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Textarea
                placeholder="Describe the design you want... e.g., 'A modern SaaS landing page with a hero section, dark theme, gradient accents, and a pricing table'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px] resize-none text-base"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Tip: Be specific about layout, colors, and style for better results
                </p>
                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || generating}
                  className="gradient-primary text-primary-foreground px-6"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Design
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <AnimatePresence>
          {generating && !result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center animate-pulse shadow-glow">
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </div>
              <p className="mt-4 text-muted-foreground">Creating your design...</p>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="shadow-elevated border-border/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Generated Design</CardTitle>
                  <div className="flex gap-2">
                    {result.imageUrl && (
                      <Button variant="outline" size="sm" onClick={() => downloadImage(result.imageUrl!, "design.png")}>
                        <Image className="h-4 w-4 mr-1" /> PNG
                      </Button>
                    )}
                    {result.svgCode && (
                      <Button variant="outline" size="sm" onClick={() => downloadFile(result.svgCode!, "design.svg", "image/svg+xml")}>
                        <FileType className="h-4 w-4 mr-1" /> SVG
                      </Button>
                    )}
                    {result.htmlCode && (
                      <Button variant="outline" size="sm" onClick={() => {
                        const fullHtml = `<!DOCTYPE html>\n<html>\n<head>\n<style>\n${result.cssCode || ""}\n</style>\n</head>\n<body>\n${result.htmlCode}\n</body>\n</html>`;
                        downloadFile(fullHtml, "design.html", "text/html");
                      }}>
                        <Code className="h-4 w-4 mr-1" /> HTML/CSS
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="preview" className="w-full">
                    <TabsList>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                      {result.htmlCode && <TabsTrigger value="html">HTML</TabsTrigger>}
                      {result.cssCode && <TabsTrigger value="css">CSS</TabsTrigger>}
                      {result.svgCode && <TabsTrigger value="svg">SVG</TabsTrigger>}
                    </TabsList>
                    <TabsContent value="preview" className="mt-4">
                      {result.imageUrl ? (
                        <div className="rounded-lg overflow-hidden border border-border bg-muted">
                          <img src={result.imageUrl} alt="Generated design" className="w-full" />
                        </div>
                      ) : result.htmlCode ? (
                        <div className="rounded-lg overflow-hidden border border-border">
                          <iframe
                            srcDoc={`<style>${result.cssCode || ""}</style>${result.htmlCode}`}
                            className="w-full h-[500px]"
                            title="Design preview"
                            sandbox="allow-scripts"
                          />
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-10">No preview available</p>
                      )}
                    </TabsContent>
                    {result.htmlCode && (
                      <TabsContent value="html" className="mt-4">
                        <pre className="rounded-lg bg-muted p-4 overflow-auto text-sm font-mono max-h-[400px]">
                          <code>{result.htmlCode}</code>
                        </pre>
                      </TabsContent>
                    )}
                    {result.cssCode && (
                      <TabsContent value="css" className="mt-4">
                        <pre className="rounded-lg bg-muted p-4 overflow-auto text-sm font-mono max-h-[400px]">
                          <code>{result.cssCode}</code>
                        </pre>
                      </TabsContent>
                    )}
                    {result.svgCode && (
                      <TabsContent value="svg" className="mt-4">
                        <pre className="rounded-lg bg-muted p-4 overflow-auto text-sm font-mono max-h-[400px]">
                          <code>{result.svgCode}</code>
                        </pre>
                      </TabsContent>
                    )}
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!result && !generating && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Wand2 className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground">No designs yet</h3>
            <p className="text-sm text-muted-foreground/70 mt-1">Enter a prompt above to generate your first design</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Generator;
