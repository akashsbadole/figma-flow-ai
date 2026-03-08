import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Sparkles, Download, Loader2, Copy, Check, Eye, Code, Layers, Grid3X3, Move, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  generateCSS,
  generateSCSS,
  generateTailwindConfig,
  generateFigmaTokens,
  generateStyleDictionary,
} from "@/lib/design-system-export";

export interface DesignSystemData {
  name: string;
  colors: Record<string, string>;
  typography: {
    heading: string;
    body: string;
    mono: string;
    scale: { name: string; size: string; lineHeight: string; letterSpacing: string }[];
    weights: { name: string; value: number }[];
  };
  spacing: { name: string; value: string }[];
  borderRadius: { name: string; value: string }[];
  shadows: { name: string; value: string }[];
  gradients: { name: string; value: string }[];
  breakpoints: { name: string; value: string }[];
  opacity: { name: string; value: number }[];
  zIndex: { name: string; value: number }[];
  transitions: { name: string; duration: string; easing: string }[];
  borders: { name: string; width: string; style: string; color: string }[];
  components: {
    buttonHtml: string;
    buttonCss: string;
    cardHtml: string;
    cardCss: string;
    inputHtml: string;
    inputCss: string;
    badgeHtml: string;
    badgeCss: string;
    alertHtml: string;
    alertCss: string;
    avatarHtml: string;
    avatarCss: string;
  };
}

const DesignSystemBuilder = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [brandPrompt, setBrandPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [designSystem, setDesignSystem] = useState<DesignSystemData | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!brandPrompt.trim() || !user) return;
    setGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-design-system", {
        body: { prompt: brandPrompt.trim() },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // Fill defaults for new fields if AI didn't return them
      const ds = data.designSystem;
      ds.breakpoints = ds.breakpoints || [
        { name: "sm", value: "640px" }, { name: "md", value: "768px" },
        { name: "lg", value: "1024px" }, { name: "xl", value: "1280px" }, { name: "2xl", value: "1536px" },
      ];
      ds.opacity = ds.opacity || [
        { name: "0", value: 0 }, { name: "25", value: 0.25 }, { name: "50", value: 0.5 },
        { name: "75", value: 0.75 }, { name: "100", value: 1 },
      ];
      ds.zIndex = ds.zIndex || [
        { name: "base", value: 0 }, { name: "dropdown", value: 10 }, { name: "sticky", value: 20 },
        { name: "modal", value: 30 }, { name: "popover", value: 40 }, { name: "toast", value: 50 },
      ];
      ds.transitions = ds.transitions || [
        { name: "fast", duration: "150ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
        { name: "normal", duration: "250ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
        { name: "slow", duration: "500ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
      ];
      ds.borders = ds.borders || [
        { name: "thin", width: "1px", style: "solid", color: ds.colors.muted || "#e5e7eb" },
        { name: "medium", width: "2px", style: "solid", color: ds.colors.muted || "#e5e7eb" },
        { name: "thick", width: "3px", style: "solid", color: ds.colors.primary || "#3b82f6" },
      ];
      ds.components = ds.components || {};
      ds.components.badgeHtml = ds.components.badgeHtml || '<span class="badge badge-primary">Primary</span> <span class="badge badge-success">Success</span> <span class="badge badge-warning">Warning</span>';
      ds.components.badgeCss = ds.components.badgeCss || '.badge{display:inline-flex;padding:2px 10px;border-radius:9999px;font-size:12px;font-weight:600;} .badge-primary{background:var(--color-primary);color:#fff;} .badge-success{background:var(--color-success);color:#fff;} .badge-warning{background:var(--color-warning);color:#fff;}';
      ds.components.alertHtml = ds.components.alertHtml || '<div class="alert alert-info">ℹ️ This is an informational alert.</div><div class="alert alert-error">⚠️ Something went wrong!</div>';
      ds.components.alertCss = ds.components.alertCss || '.alert{padding:12px 16px;border-radius:8px;margin-bottom:8px;font-size:14px;} .alert-info{background:var(--color-info);color:#fff;} .alert-error{background:var(--color-error);color:#fff;}';
      ds.components.avatarHtml = ds.components.avatarHtml || '<div class="avatar">JD</div><div class="avatar avatar-lg">AB</div>';
      ds.components.avatarCss = ds.components.avatarCss || '.avatar{width:40px;height:40px;border-radius:50%;background:var(--color-primary);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:600;font-size:14px;margin-right:8px;} .avatar-lg{width:56px;height:56px;font-size:18px;}';

      setDesignSystem(ds);

      await supabase.from("design_systems").insert({
        user_id: user.id,
        name: ds.name || "Untitled System",
        colors: ds.colors,
        typography: ds.typography,
        spacing: ds.spacing,
        components: ds.components,
      });

      toast({ title: "Design system generated!", description: "Complete with all tokens and export options." });
    } catch (error: any) {
      toast({ title: "Generation failed", description: error.message, variant: "destructive" });
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

  const downloadAll = () => {
    if (!designSystem) return;
    const slug = designSystem.name.toLowerCase().replace(/\s+/g, "-");
    downloadFile(generateCSS(designSystem), `${slug}-tokens.css`);
    downloadFile(generateFigmaTokens(designSystem), `${slug}-figma-tokens.json`);
    downloadFile(generateTailwindConfig(designSystem), `tailwind.config.ts`);
    downloadFile(generateSCSS(designSystem), `${slug}-tokens.scss`);
    downloadFile(generateStyleDictionary(designSystem), `${slug}-style-dictionary.json`);
    toast({ title: "All files downloaded!" });
  };

  const colorGroups = designSystem
    ? {
        Brand: ["primary", "primaryLight", "primaryDark", "secondary", "secondaryLight", "accent"],
        Neutral: ["background", "surface", "foreground", "muted"],
        Semantic: ["success", "warning", "error", "info"],
      }
    : {};

  const allComponents = designSystem
    ? [
        { key: "button", label: "Button", html: designSystem.components.buttonHtml, css: designSystem.components.buttonCss },
        { key: "card", label: "Card", html: designSystem.components.cardHtml, css: designSystem.components.cardCss },
        { key: "input", label: "Input", html: designSystem.components.inputHtml, css: designSystem.components.inputCss },
        { key: "badge", label: "Badge", html: designSystem.components.badgeHtml, css: designSystem.components.badgeCss },
        { key: "alert", label: "Alert", html: designSystem.components.alertHtml, css: designSystem.components.alertCss },
        { key: "avatar", label: "Avatar", html: designSystem.components.avatarHtml, css: designSystem.components.avatarCss },
      ]
    : [];

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Palette className="h-8 w-8 text-accent" />
            Design System Builder
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate a complete design system with all tokens, components & multi-format export
          </p>
        </motion.div>

        {/* Brand Prompt */}
        <Card className="shadow-card border-border/50">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Describe your brand</Label>
              <Textarea
                placeholder="e.g., 'A modern fintech startup with a professional yet approachable feel. Blue and teal palette, clean typography, rounded corners.'"
                value={brandPrompt}
                onChange={(e) => setBrandPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="flex gap-2">
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
              {designSystem && (
                <Button variant="outline" onClick={downloadAll}>
                  <Download className="h-4 w-4 mr-1" /> Download All
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        {generating && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center animate-pulse shadow-glow">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
            <p className="mt-4 text-muted-foreground">Generating your design system...</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Colors, typography, spacing, shadows, gradients, breakpoints, transitions & components</p>
          </div>
        )}

        {/* Generated Design System */}
        <AnimatePresence>
          {designSystem && !generating && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* System Name */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: designSystem.colors.primary }}>
                  <span className="text-lg font-bold" style={{ color: designSystem.colors.background }}>
                    {designSystem.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">{designSystem.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {Object.keys(designSystem.colors).length} colors · {designSystem.typography.scale.length} type sizes · {designSystem.spacing.length} spacing · {designSystem.breakpoints?.length || 0} breakpoints · {designSystem.transitions?.length || 0} transitions
                  </p>
                </div>
              </div>

              {/* Colors */}
              <Card className="shadow-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">🎨 Color Palette</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.entries(colorGroups).map(([group, keys]) => (
                    <div key={group}>
                      <p className="text-sm font-medium text-muted-foreground mb-3">{group}</p>
                      <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
                        {keys.map((key) => {
                          const val = designSystem.colors[key];
                          if (!val) return null;
                          return (
                            <button key={key} className="group/color space-y-1.5 text-left" onClick={() => copyText(val, key)}>
                              <div className="h-16 rounded-lg border border-border/50 shadow-sm group-hover/color:ring-2 ring-primary transition-all" style={{ backgroundColor: val }} />
                              <p className="text-xs font-medium capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                              <p className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                                {val}
                                {copiedKey === key && <Check className="h-3 w-3 text-accent" />}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Typography */}
              <Card className="shadow-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">🔤 Typography</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Heading</p>
                      <p className="text-2xl font-bold" style={{ fontFamily: `'${designSystem.typography.heading}', sans-serif` }}>
                        {designSystem.typography.heading}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Body</p>
                      <p className="text-lg" style={{ fontFamily: `'${designSystem.typography.body}', sans-serif` }}>
                        {designSystem.typography.body}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Mono</p>
                      <p className="text-lg font-mono">{designSystem.typography.mono}</p>
                    </div>
                  </div>

                  <div className="space-y-1 border-t border-border/50 pt-4">
                    <p className="text-sm font-medium text-muted-foreground mb-3">Type Scale</p>
                    {designSystem.typography.scale.map((s) => (
                      <div key={s.name} className="flex items-baseline gap-4 py-1">
                        <span className="text-xs text-muted-foreground font-mono w-12">{s.name}</span>
                        <span className="text-xs text-muted-foreground font-mono w-16">{s.size}</span>
                        <span style={{ fontSize: s.size, lineHeight: s.lineHeight, letterSpacing: s.letterSpacing }} className="truncate">
                          The quick brown fox
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1 border-t border-border/50 pt-4">
                    <p className="text-sm font-medium text-muted-foreground mb-3">Font Weights</p>
                    <div className="flex flex-wrap gap-4">
                      {designSystem.typography.weights.map((w) => (
                        <div key={w.name} className="text-center">
                          <p style={{ fontWeight: w.value }} className="text-lg">Aa</p>
                          <p className="text-xs text-muted-foreground capitalize">{w.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{w.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Spacing & Radius & Effects */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="shadow-card border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">📏 Spacing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {designSystem.spacing.map((s) => (
                        <div key={s.name} className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground font-mono w-8">{s.name}</span>
                          <div className="h-4 rounded bg-primary/20" style={{ width: s.value }} />
                          <span className="text-xs text-muted-foreground font-mono">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-card border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">✨ Effects</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-3">Border Radius</p>
                      <div className="flex flex-wrap gap-3">
                        {designSystem.borderRadius.map((r) => (
                          <div key={r.name} className="text-center">
                            <div className="w-12 h-12 border-2 border-primary/30 bg-primary/10" style={{ borderRadius: r.value }} />
                            <p className="text-[10px] text-muted-foreground mt-1">{r.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-3">Shadows</p>
                      <div className="flex flex-wrap gap-3">
                        {designSystem.shadows.map((s) => (
                          <div key={s.name} className="text-center">
                            <div className="w-14 h-14 rounded-lg bg-card border border-border/50" style={{ boxShadow: s.value }} />
                            <p className="text-[10px] text-muted-foreground mt-1">{s.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-3">Gradients</p>
                      <div className="grid grid-cols-3 gap-3">
                        {designSystem.gradients.map((g) => (
                          <div key={g.name}>
                            <div className="h-10 rounded-lg" style={{ background: g.value }} />
                            <p className="text-[10px] text-muted-foreground mt-1">{g.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Breakpoints, Opacity, Z-Index */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="shadow-card border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Grid3X3 className="h-4 w-4" /> Breakpoints
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(designSystem.breakpoints || []).map((b) => (
                        <div key={b.name} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
                          <span className="text-sm font-medium">{b.name}</span>
                          <span className="text-xs text-muted-foreground font-mono">{b.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-card border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Layers className="h-4 w-4" /> Opacity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(designSystem.opacity || []).map((o) => (
                        <div key={o.name} className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground font-mono w-8">{o.name}</span>
                          <div className="flex-1 h-6 rounded" style={{ backgroundColor: designSystem.colors.primary, opacity: o.value }} />
                          <span className="text-xs text-muted-foreground font-mono w-10">{o.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-card border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Move className="h-4 w-4" /> Z-Index
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(designSystem.zIndex || []).map((z) => (
                        <div key={z.name} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
                          <span className="text-sm font-medium capitalize">{z.name}</span>
                          <span className="text-xs text-muted-foreground font-mono">{z.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Transitions & Borders */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="shadow-card border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="h-4 w-4" /> Transitions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(designSystem.transitions || []).map((t) => (
                        <div key={t.name} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium capitalize">{t.name}</span>
                            <span className="text-xs text-muted-foreground font-mono">{t.duration}</span>
                          </div>
                          <div className="group/trans relative h-8 bg-muted/50 rounded overflow-hidden cursor-pointer">
                            <div
                              className="absolute left-0 top-0 h-full w-8 rounded bg-primary group-hover/trans:w-full"
                              style={{ transition: `width ${t.duration} ${t.easing}` }}
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground font-mono">{t.easing}</p>
                        </div>
                      ))}
                      <p className="text-[10px] text-muted-foreground italic">Hover to preview</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-card border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">🔲 Borders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(designSystem.borders || []).map((b) => (
                        <div key={b.name} className="flex items-center gap-4">
                          <span className="text-sm font-medium capitalize w-16">{b.name}</span>
                          <div
                            className="flex-1 h-0 rounded"
                            style={{ borderTop: `${b.width} ${b.style} ${b.color}` }}
                          />
                          <span className="text-xs text-muted-foreground font-mono">{b.width}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Component Previews */}
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
                            <pre className="rounded-lg bg-muted p-3 overflow-auto text-xs font-mono max-h-[200px]">
                              <code>{comp.html}</code>
                            </pre>
                            <Button size="icon" variant="ghost" className="absolute top-6 right-1 h-7 w-7" onClick={() => copyText(comp.html, `${comp.key}-html`)}>
                              {copiedKey === `${comp.key}-html` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            </Button>
                          </div>
                          <div className="relative">
                            <p className="text-xs font-medium text-muted-foreground mb-2">CSS</p>
                            <pre className="rounded-lg bg-muted p-3 overflow-auto text-xs font-mono max-h-[200px]">
                              <code>{comp.css}</code>
                            </pre>
                            <Button size="icon" variant="ghost" className="absolute top-6 right-1 h-7 w-7" onClick={() => copyText(comp.css, `${comp.key}-css`)}>
                              {copiedKey === `${comp.key}-css` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>

              {/* Export Formats */}
              <Card className="shadow-card border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Code className="h-4 w-4" /> Export
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={downloadAll}>
                      <Download className="h-4 w-4 mr-1" /> Download All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="figma">
                    <TabsList className="flex-wrap h-auto gap-1">
                      <TabsTrigger value="figma">Figma Tokens</TabsTrigger>
                      <TabsTrigger value="css">CSS Variables</TabsTrigger>
                      <TabsTrigger value="scss">SCSS</TabsTrigger>
                      <TabsTrigger value="tailwind">Tailwind</TabsTrigger>
                      <TabsTrigger value="style-dict">Style Dictionary</TabsTrigger>
                    </TabsList>
                    {[
                      { key: "figma", gen: () => generateFigmaTokens(designSystem), file: "figma-tokens.json", label: "Import into Figma using the Tokens Studio plugin" },
                      { key: "css", gen: () => generateCSS(designSystem), file: "design-system.css", label: "CSS custom properties for web projects" },
                      { key: "scss", gen: () => generateSCSS(designSystem), file: "design-system.scss", label: "SCSS variables with mixins" },
                      { key: "tailwind", gen: () => generateTailwindConfig(designSystem), file: "tailwind.config.ts", label: "Tailwind CSS configuration" },
                      { key: "style-dict", gen: () => generateStyleDictionary(designSystem), file: "tokens.json", label: "Style Dictionary format for multi-platform" },
                    ].map((fmt) => (
                      <TabsContent key={fmt.key} value={fmt.key} className="mt-4">
                        <p className="text-xs text-muted-foreground mb-2">{fmt.label}</p>
                        <div className="relative">
                          <pre className="rounded-lg bg-muted p-4 overflow-auto text-xs font-mono max-h-[400px]">
                            <code>{fmt.gen()}</code>
                          </pre>
                          <div className="absolute top-2 right-2 flex gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8 bg-card/80" onClick={() => copyText(fmt.gen(), fmt.key)}>
                              {copiedKey === fmt.key ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 bg-card/80" onClick={() => downloadFile(fmt.gen(), fmt.file)}>
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!designSystem && !generating && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Palette className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground">No design system yet</h3>
            <p className="text-sm text-muted-foreground/70 mt-1 max-w-md">
              Describe your brand above to generate colors, typography, spacing, shadows, gradients, breakpoints, transitions, borders, components & Figma tokens
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default DesignSystemBuilder;
