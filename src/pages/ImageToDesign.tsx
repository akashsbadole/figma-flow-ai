import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Image, Upload, Loader2, Code, Copy, Check, Download, Wand2
} from "lucide-react";
import { useGenerationLimit } from "@/hooks/useGenerationLimit";

const ImageToDesign = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ html: string; css: string; react: string; tailwind: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!imageBase64 || !user) return;
    setGenerating(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("image-to-design", {
        body: {
          image: imageBase64,
          prompt: additionalPrompt || "Convert this design to code",
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult(data);

      // Save to history
      await supabase.from("generation_history").insert({
        user_id: user.id,
        type: "image_to_design",
        prompt: additionalPrompt || "Image to design conversion",
        result: data,
        metadata: { hasImage: true },
      });

      toast({ title: "Design generated!" });
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast({ title: "Copied!" });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Image className="h-8 w-8 text-primary" />
            Image to Design
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload a screenshot or mockup and generate production-ready code
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="border-border/50">
            <CardContent className="p-6 space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />

              {imagePreview ? (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Uploaded design"
                    className="w-full rounded-lg border border-border/50 max-h-[400px] object-contain bg-muted"
                  />
                  <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                    <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" /> Replace Image
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-[300px] border-2 border-dashed border-border/50 rounded-lg flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <Upload className="h-10 w-10 text-muted-foreground/50" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Upload a design image</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 5MB</p>
                  </div>
                </button>
              )}

              <Textarea
                placeholder="Optional: Describe what you want (e.g., 'Make it responsive', 'Use blue theme', 'Add hover states')"
                value={additionalPrompt}
                onChange={(e) => setAdditionalPrompt(e.target.value)}
                className="min-h-[80px]"
              />

              <Button
                className="w-full gradient-primary text-primary-foreground"
                disabled={!imageBase64 || generating}
                onClick={handleGenerate}
              >
                {generating ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating Code...</>
                ) : (
                  <><Wand2 className="h-4 w-4 mr-2" /> Generate Code</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Result Section */}
          <Card className="border-border/50">
            <CardContent className="p-6">
              {generating && (
                <div className="flex flex-col items-center justify-center h-[400px] gap-3">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Analyzing image and generating code...</p>
                </div>
              )}

              {!generating && !result && (
                <div className="flex flex-col items-center justify-center h-[400px] gap-3 text-center">
                  <Code className="h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Generated code will appear here</p>
                  <p className="text-xs text-muted-foreground/60">HTML, CSS, React JSX, and Tailwind</p>
                </div>
              )}

              {result && (
                <Tabs defaultValue="preview" className="space-y-3">
                  <TabsList className="flex-wrap h-auto gap-1">
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="html">HTML</TabsTrigger>
                    <TabsTrigger value="css">CSS</TabsTrigger>
                    <TabsTrigger value="react">React</TabsTrigger>
                    <TabsTrigger value="tailwind">Tailwind</TabsTrigger>
                  </TabsList>

                  <TabsContent value="preview">
                    <iframe
                      srcDoc={`<style>*{margin:0;padding:0;box-sizing:border-box;}${result.css}</style>${result.html}`}
                      className="w-full h-[350px] border border-border/50 rounded-lg"
                      title="Preview"
                      sandbox="allow-scripts"
                    />
                  </TabsContent>

                  {[
                    { key: "html", code: result.html, ext: "html" },
                    { key: "css", code: result.css, ext: "css" },
                    { key: "react", code: result.react, ext: "tsx" },
                    { key: "tailwind", code: result.tailwind, ext: "tsx" },
                  ].map(({ key, code, ext }) => (
                    <TabsContent key={key} value={key}>
                      <div className="relative">
                        <pre className="bg-muted rounded-lg p-4 overflow-auto text-xs font-mono max-h-[350px]">
                          <code>{code}</code>
                        </pre>
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 bg-card/80" onClick={() => copyText(code, key)}>
                            {copiedKey === key ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 bg-card/80" onClick={() => downloadFile(code, `design.${ext}`)}>
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default ImageToDesign;
