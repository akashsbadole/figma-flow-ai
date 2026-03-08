import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Sparkles, Download, Loader2, Copy } from "lucide-react";
import {
  generateCSS,
  generateSCSS,
  generateTailwindConfig,
  generateFigmaTokens,
  generateStyleDictionary,
} from "@/lib/design-system-export";
import { copyDesignSystemForFigma } from "@/lib/figma-svg-export";
import { useGenerationLimit } from "@/hooks/useGenerationLimit";

import {
  DesignSystemData,
  DEFAULT_GRID, DEFAULT_ICON_SIZES, DEFAULT_COMPONENT_SPECS,
  DEFAULT_ACCESSIBILITY, DEFAULT_AUTO_LAYOUT, DEFAULT_FILE_STRUCTURE, DEFAULT_TOKEN_NAMING,
} from "@/components/design-system/types";

import { LayoutSection } from "@/components/design-system/LayoutSection";
import { SpacingSection } from "@/components/design-system/SpacingSection";
import { TypographySection } from "@/components/design-system/TypographySection";
import { ColorSection } from "@/components/design-system/ColorSection";
import { ShadowsSection } from "@/components/design-system/ShadowsSection";
import { IconSystemSection } from "@/components/design-system/IconSystemSection";
import { ComponentParamsSection } from "@/components/design-system/ComponentParamsSection";
import { AnimationSection } from "@/components/design-system/AnimationSection";
import { FigmaSection } from "@/components/design-system/FigmaSection";
import { ExtrasSection } from "@/components/design-system/ExtrasSection";
import { ComponentPreviewsSection } from "@/components/design-system/ComponentPreviewsSection";
import { ExportPanel } from "@/components/design-system/ExportPanel";

// Re-export types for backward compatibility
export type { DesignSystemData, GridConfig, IconSize, ComponentSpec, AccessibilitySpec, AutoLayoutRule } from "@/components/design-system/types";

const DesignSystemBuilder = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { checkAndIncrement } = useGenerationLimit();
  const [brandPrompt, setBrandPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [designSystem, setDesignSystem] = useState<DesignSystemData | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!brandPrompt.trim() || !user) return;
    const allowed = await checkAndIncrement();
    if (!allowed) return;
    setGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-design-system", {
        body: { prompt: brandPrompt.trim() },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const ds = data.designSystem;

      // Fill defaults for fields not returned by AI
      ds.breakpoints = ds.breakpoints || [
        { name: "mobile", value: "320px" }, { name: "tablet", value: "768px" },
        { name: "laptop", value: "1024px" }, { name: "desktop", value: "1280px" }, { name: "large", value: "1440px" },
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
        { name: "normal", duration: "300ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
        { name: "slow", duration: "500ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
      ];
      ds.borders = ds.borders || [
        { name: "thin", width: "1px", style: "solid", color: ds.colors.muted || "#e5e7eb" },
        { name: "medium", width: "2px", style: "solid", color: ds.colors.muted || "#e5e7eb" },
        { name: "thick", width: "3px", style: "solid", color: ds.colors.primary || "#3b82f6" },
      ];
      ds.neutralColors = ds.neutralColors || [
        { name: "Black", value: "#000000" }, { name: "Gray 900", value: "#111827" },
        { name: "Gray 700", value: "#374151" }, { name: "Gray 500", value: "#6B7280" },
        { name: "Gray 300", value: "#D1D5DB" }, { name: "Gray 100", value: "#F3F4F6" },
        { name: "White", value: "#FFFFFF" },
      ];
      ds.grid = ds.grid || DEFAULT_GRID;
      ds.iconSizes = ds.iconSizes || DEFAULT_ICON_SIZES;
      ds.componentSpecs = ds.componentSpecs || DEFAULT_COMPONENT_SPECS;
      ds.accessibility = ds.accessibility || DEFAULT_ACCESSIBILITY;
      ds.autoLayoutRules = ds.autoLayoutRules || DEFAULT_AUTO_LAYOUT;
      ds.figmaFileStructure = ds.figmaFileStructure || DEFAULT_FILE_STRUCTURE;
      ds.tokenNaming = ds.tokenNaming || DEFAULT_TOKEN_NAMING;

      ds.darkModeColors = ds.darkModeColors || {
        primary: ds.colors.primary, primaryLight: ds.colors.primaryLight, primaryDark: ds.colors.primaryDark,
        secondary: ds.colors.secondary, secondaryLight: ds.colors.secondaryLight, accent: ds.colors.accent,
        background: "#0f172a", surface: "#1e293b", foreground: "#f1f5f9",
        muted: "#334155", success: ds.colors.success, warning: ds.colors.warning,
        error: ds.colors.error, info: ds.colors.info,
      };

      ds.iconSystem = ds.iconSystem || {
        sizes: DEFAULT_ICON_SIZES,
        strokeWidth: "1.5px",
        gridSize: "24px",
        cornerRadius: "0px",
        recommendedLibraries: ["Lucide Icons", "Heroicons", "Material Icons"],
      };

      ds.motionTokens = ds.motionTokens || {
        easingCurves: [
          { name: "ease-out", value: "cubic-bezier(0.0, 0, 0.2, 1)", description: "Deceleration curve" },
          { name: "ease-in", value: "cubic-bezier(0.4, 0, 1, 1)", description: "Acceleration curve" },
          { name: "ease-in-out", value: "cubic-bezier(0.4, 0, 0.2, 1)", description: "Standard curve" },
          { name: "spring", value: "cubic-bezier(0.175, 0.885, 0.32, 1.275)", description: "Overshoot spring" },
        ],
        durations: [
          { name: "instant", value: "100ms", useCase: "Micro-interactions" },
          { name: "fast", value: "200ms", useCase: "Buttons, toggles" },
          { name: "normal", value: "300ms", useCase: "Panels, modals" },
          { name: "slow", value: "500ms", useCase: "Page transitions" },
        ],
        animations: [
          { name: "fadeIn", keyframes: "opacity: 0 → 1", duration: "300ms", easing: "ease-out" },
          { name: "slideUp", keyframes: "translateY(16px) → 0", duration: "300ms", easing: "ease-out" },
          { name: "scaleIn", keyframes: "scale(0.95) → 1", duration: "200ms", easing: "spring" },
          { name: "pulse", keyframes: "opacity: 1 → 0.5 → 1", duration: "2000ms", easing: "ease-in-out" },
        ],
      };

      // Fill component defaults
      ds.components = ds.components || {};
      ds.components.badgeHtml = ds.components.badgeHtml || '<span class="badge badge-primary">Primary</span> <span class="badge badge-success">Success</span> <span class="badge badge-warning">Warning</span>';
      ds.components.badgeCss = ds.components.badgeCss || '.badge{display:inline-flex;padding:2px 10px;border-radius:9999px;font-size:12px;font-weight:600;} .badge-primary{background:var(--color-primary);color:#fff;} .badge-success{background:var(--color-success);color:#fff;} .badge-warning{background:var(--color-warning);color:#fff;}';
      ds.components.alertHtml = ds.components.alertHtml || '<div class="alert alert-info">ℹ️ Informational alert</div><div class="alert alert-error">⚠️ Error alert</div>';
      ds.components.alertCss = ds.components.alertCss || '.alert{padding:12px 16px;border-radius:8px;margin-bottom:8px;font-size:14px;} .alert-info{background:var(--color-info);color:#fff;} .alert-error{background:var(--color-error);color:#fff;}';
      ds.components.avatarHtml = ds.components.avatarHtml || '<div class="avatar">JD</div><div class="avatar avatar-lg">AB</div>';
      ds.components.avatarCss = ds.components.avatarCss || '.avatar{width:40px;height:40px;border-radius:50%;background:var(--color-primary);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:600;font-size:14px;margin-right:8px;} .avatar-lg{width:56px;height:56px;font-size:18px;}';
      ds.components.tabsHtml = ds.components.tabsHtml || '<div class="tabs"><button class="tab active">Tab 1</button><button class="tab">Tab 2</button><button class="tab">Tab 3</button></div>';
      ds.components.tabsCss = ds.components.tabsCss || '.tabs{display:flex;gap:0;border-bottom:2px solid #e5e7eb;}.tab{padding:8px 16px;border:none;background:none;cursor:pointer;font-size:14px;color:#6b7280;border-bottom:2px solid transparent;margin-bottom:-2px;}.tab.active{color:var(--color-primary);border-bottom-color:var(--color-primary);font-weight:600;}';
      ds.components.modalHtml = ds.components.modalHtml || '<div class="modal-overlay"><div class="modal"><h3>Modal Title</h3><p>Modal content goes here.</p><div class="modal-actions"><button class="btn-secondary">Cancel</button><button class="btn-primary">Confirm</button></div></div></div>';
      ds.components.modalCss = ds.components.modalCss || '.modal-overlay{position:relative;background:rgba(0,0,0,0.3);border-radius:12px;padding:40px;display:flex;align-items:center;justify-content:center;}.modal{background:#fff;border-radius:12px;padding:24px;max-width:400px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.15);}h3{margin:0 0 8px;font-size:18px;}p{color:#6b7280;font-size:14px;margin:0 0 16px;}.modal-actions{display:flex;gap:8px;justify-content:flex-end;}.btn-primary{background:var(--color-primary,#3b82f6);color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:14px;}.btn-secondary{background:#f3f4f6;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:14px;}';
      ds.components.tooltipHtml = ds.components.tooltipHtml || '<div class="tooltip-demo"><button class="tooltip-trigger">Hover me</button><div class="tooltip">Tooltip text</div></div>';
      ds.components.tooltipCss = ds.components.tooltipCss || '.tooltip-demo{position:relative;display:inline-block;padding:20px;}.tooltip-trigger{padding:8px 16px;border:1px solid #e5e7eb;border-radius:6px;background:#fff;cursor:pointer;font-size:14px;}.tooltip{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);background:#1f2937;color:#fff;padding:6px 12px;border-radius:6px;font-size:12px;white-space:nowrap;margin-bottom:8px;}';
      ds.components.navbarHtml = ds.components.navbarHtml || '<nav class="navbar"><div class="nav-brand">Brand</div><div class="nav-links"><a href="#">Home</a><a href="#">About</a><a href="#">Contact</a></div><button class="nav-cta">Get Started</button></nav>';
      ds.components.navbarCss = ds.components.navbarCss || '.navbar{display:flex;align-items:center;justify-content:space-between;padding:12px 24px;background:#fff;border-bottom:1px solid #e5e7eb;}.nav-brand{font-weight:700;font-size:18px;}.nav-links{display:flex;gap:24px;}.nav-links a{text-decoration:none;color:#6b7280;font-size:14px;}.nav-links a:hover{color:var(--color-primary);}.nav-cta{background:var(--color-primary,#3b82f6);color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:14px;}';
      ds.components.toggleHtml = ds.components.toggleHtml || '<label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label>';
      ds.components.toggleCss = ds.components.toggleCss || '.toggle{position:relative;display:inline-block;width:44px;height:24px;}input{opacity:0;width:0;height:0;}.toggle-slider{position:absolute;cursor:pointer;inset:0;background:#d1d5db;border-radius:24px;transition:0.3s;}input:checked+.toggle-slider{background:var(--color-primary,#3b82f6);}.toggle-slider:before{content:"";position:absolute;height:18px;width:18px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:0.3s;}input:checked+.toggle-slider:before{transform:translateX(20px);}';
      ds.components.dropdownHtml = ds.components.dropdownHtml || '<div class="dropdown"><button class="dropdown-trigger">Options ▾</button><div class="dropdown-menu"><a href="#">Edit</a><a href="#">Duplicate</a><a href="#">Delete</a></div></div>';
      ds.components.dropdownCss = ds.components.dropdownCss || '.dropdown{position:relative;display:inline-block;}.dropdown-trigger{padding:8px 16px;border:1px solid #e5e7eb;border-radius:6px;background:#fff;cursor:pointer;font-size:14px;}.dropdown-menu{position:absolute;top:100%;left:0;margin-top:4px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.1);min-width:160px;overflow:hidden;}.dropdown-menu a{display:block;padding:8px 16px;text-decoration:none;color:#374151;font-size:14px;}.dropdown-menu a:hover{background:#f3f4f6;}';

      setDesignSystem(ds);

      await supabase.from("design_systems").insert({
        user_id: user.id,
        name: ds.name || "Untitled System",
        colors: ds.colors,
        typography: ds.typography,
        spacing: ds.spacing,
        components: ds.components,
      });

      toast({ title: "Design system generated!", description: "Complete with all Figma parameters." });
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

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Palette className="h-8 w-8 text-accent" />
            Design System Builder
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate a complete Figma-ready design system with 13+ parameter categories
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
                <>
                  <Button onClick={() => copyDesignSystemForFigma(designSystem, toast)}>
                    <Copy className="h-4 w-4 mr-1" /> Copy for Figma
                  </Button>
                  <Button variant="outline" onClick={downloadAll}>
                    <Download className="h-4 w-4 mr-1" /> Download All
                  </Button>
                </>
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
            <p className="mt-4 text-muted-foreground">Generating your complete design system...</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Layout, colors, typography, spacing, shadows, components, accessibility & more</p>
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
                    {Object.keys(designSystem.colors).length + (designSystem.neutralColors?.length || 0)} colors · {designSystem.typography.scale.length} type sizes · {designSystem.spacing.length} spacing · {designSystem.componentSpecs?.length || 0} component specs
                  </p>
                </div>
              </div>

              <LayoutSection designSystem={designSystem} />
              <SpacingSection designSystem={designSystem} />
              <TypographySection designSystem={designSystem} />
              <ColorSection designSystem={designSystem} copiedKey={copiedKey} onCopy={copyText} />
              <ShadowsSection designSystem={designSystem} />
              <IconSystemSection designSystem={designSystem} />
              <ComponentParamsSection designSystem={designSystem} />
              <AnimationSection designSystem={designSystem} />
              <FigmaSection designSystem={designSystem} onCopy={copyText} />
              <ExtrasSection designSystem={designSystem} />
              <ComponentPreviewsSection designSystem={designSystem} copiedKey={copiedKey} onCopy={copyText} />
              <ExportPanel designSystem={designSystem} copiedKey={copiedKey} onCopy={copyText} onDownloadAll={downloadAll} onDownloadFile={downloadFile} />
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
            <p className="text-sm text-muted-foreground/70 mt-1 max-w-lg">
              Describe your brand to generate a complete Figma-ready system: layout grids, colors, typography, spacing, shadows, components, accessibility, auto layout rules & 5 export formats
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default DesignSystemBuilder;
