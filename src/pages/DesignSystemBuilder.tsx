import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Palette, Sparkles, Download, Loader2, Copy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DesignSystemData {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
  };
  typography: {
    heading: string;
    body: string;
    mono: string;
    scale: string[];
  };
  spacing: string[];
  borderRadius: string;
}

const DesignSystemBuilder = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [brandPrompt, setBrandPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [designSystem, setDesignSystem] = useState<DesignSystemData | null>(null);

  const handleGenerate = async () => {
    if (!brandPrompt.trim() || !user) return;
    setGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-design-system", {
        body: { prompt: brandPrompt.trim() },
      });

      if (error) throw error;
      setDesignSystem(data.designSystem);

      // Save to DB
      await supabase.from("design_systems").insert({
        user_id: user.id,
        name: data.designSystem.name || "Untitled System",
        colors: data.designSystem.colors,
        typography: data.designSystem.typography,
        spacing: data.designSystem.spacing,
      });

      toast({ title: "Design system generated!", description: "Your design system has been created and saved." });
    } catch (error: any) {
      toast({ title: "Generation failed", description: error.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const generateCSS = () => {
    if (!designSystem) return "";
    return `:root {
  /* Colors */
  --primary: ${designSystem.colors.primary};
  --secondary: ${designSystem.colors.secondary};
  --accent: ${designSystem.colors.accent};
  --background: ${designSystem.colors.background};
  --foreground: ${designSystem.colors.foreground};
  --muted: ${designSystem.colors.muted};

  /* Typography */
  --font-heading: '${designSystem.typography.heading}', sans-serif;
  --font-body: '${designSystem.typography.body}', sans-serif;
  --font-mono: '${designSystem.typography.mono}', monospace;

  /* Spacing */
${designSystem.spacing.map((s, i) => `  --space-${i + 1}: ${s};`).join("\n")}

  /* Border Radius */
  --radius: ${designSystem.borderRadius};
}`;
  };

  const generateTailwind = () => {
    if (!designSystem) return "";
    return `// tailwind.config.ts
{
  theme: {
    extend: {
      colors: {
        primary: '${designSystem.colors.primary}',
        secondary: '${designSystem.colors.secondary}',
        accent: '${designSystem.colors.accent}',
        background: '${designSystem.colors.background}',
        foreground: '${designSystem.colors.foreground}',
        muted: '${designSystem.colors.muted}',
      },
      fontFamily: {
        heading: ['${designSystem.typography.heading}', 'sans-serif'],
        body: ['${designSystem.typography.body}', 'sans-serif'],
        mono: ['${designSystem.typography.mono}', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '${designSystem.borderRadius}',
      },
    },
  },
}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Code copied to clipboard" });
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
      <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Palette className="h-8 w-8 text-accent" />
            Design System Builder
          </h1>
          <p className="text-muted-foreground mt-1">Create a complete design system with AI-generated tokens</p>
        </motion.div>

        {/* Brand Prompt */}
        <Card className="shadow-card border-border/50">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Describe your brand</Label>
              <Textarea
                placeholder="e.g., 'A modern fintech startup with a professional yet approachable feel. Blue and teal color palette, clean typography, rounded corners.'"
                value={brandPrompt}
                onChange={(e) => setBrandPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <Button
              onClick={handleGenerate}
              disabled={!brandPrompt.trim() || generating}
              className="gradient-primary text-primary-foreground"
            >
              {generating ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Generate Design System</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Design System */}
        {designSystem && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Color Preview */}
            <Card className="shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Color Palette</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(designSystem.colors).map(([name, value]) => (
                    <div key={name} className="space-y-2">
                      <div
                        className="h-20 rounded-lg border border-border shadow-sm"
                        style={{ backgroundColor: value }}
                      />
                      <div>
                        <p className="text-sm font-medium capitalize">{name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Typography Preview */}
            <Card className="shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Typography</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Heading Font</p>
                    <p className="text-2xl font-bold">{designSystem.typography.heading}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Body Font</p>
                    <p className="text-lg">{designSystem.typography.body}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Mono Font</p>
                    <p className="text-lg font-mono">{designSystem.typography.mono}</p>
                  </div>
                </div>
                {designSystem.typography.scale.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <p className="text-sm text-muted-foreground">Type Scale</p>
                    {designSystem.typography.scale.map((size, i) => (
                      <p key={i} style={{ fontSize: size }} className="leading-tight truncate">
                        {size} — The quick brown fox
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Export */}
            <Card className="shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Export</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="css">
                  <TabsList>
                    <TabsTrigger value="css">CSS Variables</TabsTrigger>
                    <TabsTrigger value="tailwind">Tailwind Config</TabsTrigger>
                  </TabsList>
                  <TabsContent value="css" className="mt-4">
                    <div className="relative">
                      <pre className="rounded-lg bg-muted p-4 overflow-auto text-sm font-mono max-h-[300px]">
                        <code>{generateCSS()}</code>
                      </pre>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => copyToClipboard(generateCSS())}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => downloadFile(generateCSS(), "design-system.css")}>
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="tailwind" className="mt-4">
                    <div className="relative">
                      <pre className="rounded-lg bg-muted p-4 overflow-auto text-sm font-mono max-h-[300px]">
                        <code>{generateTailwind()}</code>
                      </pre>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => copyToClipboard(generateTailwind())}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => downloadFile(generateTailwind(), "tailwind.config.ts")}>
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Empty State */}
        {!designSystem && !generating && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Palette className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground">No design system yet</h3>
            <p className="text-sm text-muted-foreground/70 mt-1">Describe your brand above to generate a complete design system</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default DesignSystemBuilder;
