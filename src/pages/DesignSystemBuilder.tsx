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
import {
  Palette, Sparkles, Download, Loader2, Copy, Check, Eye, Code,
  Layers, Grid3X3, Move, Zap, Monitor, Tablet, Smartphone,
  Accessibility, FolderTree, MousePointerClick, Type
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  generateCSS,
  generateSCSS,
  generateTailwindConfig,
  generateFigmaTokens,
  generateStyleDictionary,
} from "@/lib/design-system-export";
import { copyDesignSystemForFigma } from "@/lib/figma-svg-export";
import { useGenerationLimit } from "@/hooks/useGenerationLimit";

export interface GridConfig {
  desktop: { columns: number; gutter: string; margin: string };
  tablet: { columns: number; gutter: string; margin: string };
  mobile: { columns: number; gutter: string; margin: string };
}

export interface IconSize {
  name: string;
  value: string;
}

export interface ComponentSpec {
  name: string;
  sizes: { name: string; height: string; padding: string; fontSize: string }[];
  states: string[];
  borderRadius: string;
  border: string;
}

export interface AccessibilitySpec {
  contrastNormal: string;
  contrastLarge: string;
  touchTargetMin: string;
  focusRingWidth: string;
  focusRingColor: string;
}

export interface AutoLayoutRule {
  name: string;
  direction: string;
  spacing: string;
  padding: string;
  alignment: string;
}

export interface DesignSystemData {
  name: string;
  colors: Record<string, string>;
  darkModeColors?: Record<string, string>;
  neutralColors: { name: string; value: string }[];
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
  grid: GridConfig;
  iconSizes: IconSize[];
  iconSystem?: {
    sizes: { name: string; value: string }[];
    strokeWidth: string;
    gridSize: string;
    cornerRadius: string;
    recommendedLibraries: string[];
  };
  motionTokens?: {
    easingCurves: { name: string; value: string; description: string }[];
    durations: { name: string; value: string; useCase: string }[];
    animations: { name: string; keyframes: string; duration: string; easing: string }[];
  };
  componentSpecs: ComponentSpec[];
  accessibility: AccessibilitySpec;
  autoLayoutRules: AutoLayoutRule[];
  figmaFileStructure: string[];
  tokenNaming: { category: string; examples: string[] }[];
  components: Record<string, string>;
}

// Default values for all new fields
const DEFAULT_GRID: GridConfig = {
  desktop: { columns: 12, gutter: "24px", margin: "120px" },
  tablet: { columns: 8, gutter: "16px", margin: "64px" },
  mobile: { columns: 4, gutter: "16px", margin: "16px" },
};

const DEFAULT_ICON_SIZES: IconSize[] = [
  { name: "xs", value: "12px" }, { name: "sm", value: "16px" },
  { name: "md", value: "20px" }, { name: "lg", value: "24px" }, { name: "xl", value: "32px" },
];

const DEFAULT_COMPONENT_SPECS: ComponentSpec[] = [
  {
    name: "Button",
    sizes: [
      { name: "Small", height: "32px", padding: "8px 12px", fontSize: "14px" },
      { name: "Medium", height: "40px", padding: "10px 16px", fontSize: "14px" },
      { name: "Large", height: "48px", padding: "12px 24px", fontSize: "16px" },
    ],
    states: ["Default", "Hover", "Active", "Disabled", "Loading"],
    borderRadius: "8px",
    border: "none",
  },
  {
    name: "Input",
    sizes: [
      { name: "Small", height: "32px", padding: "6px 12px", fontSize: "14px" },
      { name: "Medium", height: "40px", padding: "10px 12px", fontSize: "14px" },
      { name: "Large", height: "48px", padding: "12px 16px", fontSize: "16px" },
    ],
    states: ["Default", "Focus", "Error", "Disabled"],
    borderRadius: "6px",
    border: "1px solid",
  },
  {
    name: "Card",
    sizes: [
      { name: "Compact", height: "auto", padding: "16px", fontSize: "14px" },
      { name: "Default", height: "auto", padding: "24px", fontSize: "16px" },
      { name: "Spacious", height: "auto", padding: "32px", fontSize: "16px" },
    ],
    states: ["Default", "Hover", "Selected"],
    borderRadius: "12px",
    border: "1px solid",
  },
];

const DEFAULT_ACCESSIBILITY: AccessibilitySpec = {
  contrastNormal: "4.5:1",
  contrastLarge: "3:1",
  touchTargetMin: "44px × 44px",
  focusRingWidth: "2px",
  focusRingColor: "#2563EB",
};

const DEFAULT_AUTO_LAYOUT: AutoLayoutRule[] = [
  { name: "Stack", direction: "Vertical", spacing: "16px", padding: "0px", alignment: "Stretch" },
  { name: "Row", direction: "Horizontal", spacing: "12px", padding: "0px", alignment: "Center" },
  { name: "Card Content", direction: "Vertical", spacing: "12px", padding: "24px", alignment: "Start" },
  { name: "Nav Bar", direction: "Horizontal", spacing: "8px", padding: "12px 24px", alignment: "Center" },
  { name: "Form Group", direction: "Vertical", spacing: "8px", padding: "0px", alignment: "Stretch" },
];

const DEFAULT_FILE_STRUCTURE = [
  "01 Foundations / Colors",
  "01 Foundations / Typography",
  "01 Foundations / Spacing",
  "01 Foundations / Grid",
  "01 Foundations / Icons",
  "02 Components / Buttons",
  "02 Components / Inputs",
  "02 Components / Cards",
  "02 Components / Modals",
  "02 Components / Tables",
  "02 Components / Badges",
  "02 Components / Avatars",
  "02 Components / Alerts",
  "03 Patterns / Forms",
  "03 Patterns / Navigation",
  "03 Patterns / Dashboards",
  "03 Patterns / Data Tables",
  "04 Screens / Landing Page",
  "04 Screens / Dashboard",
  "04 Screens / Settings",
  "04 Screens / Auth Flows",
];

const DEFAULT_TOKEN_NAMING = [
  { category: "Color", examples: ["color.primary.500", "color.primary.100", "color.gray.200", "color.semantic.success"] },
  { category: "Spacing", examples: ["spacing.xs", "spacing.sm", "spacing.md", "spacing.lg"] },
  { category: "Radius", examples: ["radius.sm", "radius.md", "radius.lg", "radius.pill"] },
  { category: "Font", examples: ["font.heading.h1", "font.heading.h2", "font.body.base", "font.body.sm"] },
  { category: "Shadow", examples: ["shadow.sm", "shadow.md", "shadow.lg", "shadow.xl"] },
  { category: "Z-Index", examples: ["z.base", "z.dropdown", "z.modal", "z.toast"] },
];

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

      // Dark mode defaults
      ds.darkModeColors = ds.darkModeColors || {
        primary: ds.colors.primary, primaryLight: ds.colors.primaryLight, primaryDark: ds.colors.primaryDark,
        secondary: ds.colors.secondary, secondaryLight: ds.colors.secondaryLight, accent: ds.colors.accent,
        background: "#0f172a", surface: "#1e293b", foreground: "#f1f5f9",
        muted: "#334155", success: ds.colors.success, warning: ds.colors.warning,
        error: ds.colors.error, info: ds.colors.info,
      };

      // Icon system defaults
      ds.iconSystem = ds.iconSystem || {
        sizes: DEFAULT_ICON_SIZES,
        strokeWidth: "1.5px",
        gridSize: "24px",
        cornerRadius: "0px",
        recommendedLibraries: ["Lucide Icons", "Heroicons", "Material Icons"],
      };

      // Motion tokens defaults
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
        { key: "tabs", label: "Tabs", html: designSystem.components.tabsHtml, css: designSystem.components.tabsCss },
        { key: "modal", label: "Modal", html: designSystem.components.modalHtml, css: designSystem.components.modalCss },
        { key: "tooltip", label: "Tooltip", html: designSystem.components.tooltipHtml, css: designSystem.components.tooltipCss },
        { key: "navbar", label: "Navbar", html: designSystem.components.navbarHtml, css: designSystem.components.navbarCss },
        { key: "toggle", label: "Toggle", html: designSystem.components.toggleHtml, css: designSystem.components.toggleCss },
        { key: "dropdown", label: "Dropdown", html: designSystem.components.dropdownHtml, css: designSystem.components.dropdownCss },
      ].filter(c => c.html && c.css)
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

              {/* ===== SECTION 1: LAYOUT SYSTEM ===== */}
              <Card className="shadow-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Grid3X3 className="h-5 w-5" /> 1. Layout System
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Grid System */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-3">Grid System</p>
                    <div className="grid md:grid-cols-3 gap-4">
                      {[
                        { label: "Desktop", icon: <Monitor className="h-4 w-4" />, conf: designSystem.grid?.desktop || DEFAULT_GRID.desktop },
                        { label: "Tablet", icon: <Tablet className="h-4 w-4" />, conf: designSystem.grid?.tablet || DEFAULT_GRID.tablet },
                        { label: "Mobile", icon: <Smartphone className="h-4 w-4" />, conf: designSystem.grid?.mobile || DEFAULT_GRID.mobile },
                      ].map((d) => (
                        <div key={d.label} className="rounded-lg border border-border/50 p-4 space-y-2">
                          <div className="flex items-center gap-2 font-medium text-sm">{d.icon} {d.label}</div>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex justify-between"><span>Columns</span><span className="font-mono">{d.conf.columns}</span></div>
                            <div className="flex justify-between"><span>Gutter</span><span className="font-mono">{d.conf.gutter}</span></div>
                            <div className="flex justify-between"><span>Margin</span><span className="font-mono">{d.conf.margin}</span></div>
                          </div>
                          {/* Visual grid preview */}
                          <div className="flex gap-[2px] pt-2">
                            {Array.from({ length: d.conf.columns }).map((_, i) => (
                              <div key={i} className="flex-1 h-6 bg-primary/15 rounded-sm" />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Breakpoints */}
                  <div className="border-t border-border/50 pt-4">
                    <p className="text-sm font-medium text-muted-foreground mb-3">Breakpoints</p>
                    <div className="flex flex-wrap gap-3">
                      {(designSystem.breakpoints || []).map((b) => (
                        <div key={b.name} className="flex items-center gap-2 rounded-lg border border-border/50 px-3 py-2">
                          <span className="text-sm font-medium capitalize">{b.name}</span>
                          <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">{b.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ===== SECTION 2: SPACING ===== */}
              <Card className="shadow-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">📏 2. Spacing System</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">Based on 8px scale</p>
                  <div className="space-y-2">
                    {designSystem.spacing.map((s) => (
                      <div key={s.name} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground font-mono w-10">{s.name}</span>
                        <div className="h-5 rounded bg-primary/20 transition-all" style={{ width: `calc(${s.value} * 2)` }} />
                        <span className="text-xs text-muted-foreground font-mono">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* ===== SECTION 3: TYPOGRAPHY ===== */}
              <Card className="shadow-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Type className="h-5 w-5" /> 3. Typography System
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {[
                      { label: "Heading", font: designSystem.typography.heading },
                      { label: "Body", font: designSystem.typography.body },
                      { label: "Mono", font: designSystem.typography.mono },
                    ].map((f) => (
                      <div key={f.label} className="space-y-1">
                        <p className="text-xs text-muted-foreground">{f.label}</p>
                        <p className="text-2xl font-bold" style={{ fontFamily: `'${f.font}', sans-serif` }}>{f.font}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border/50 pt-4">
                    <p className="text-sm font-medium text-muted-foreground mb-3">Type Scale</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="text-xs text-muted-foreground border-b border-border/50">
                          <th className="text-left py-2 w-16">Token</th>
                          <th className="text-left py-2 w-16">Size</th>
                          <th className="text-left py-2 w-16">Line H.</th>
                          <th className="text-left py-2">Preview</th>
                        </tr></thead>
                        <tbody>
                          {designSystem.typography.scale.map((s) => (
                            <tr key={s.name} className="border-b border-border/20">
                              <td className="py-2 font-mono text-xs text-muted-foreground">{s.name}</td>
                              <td className="py-2 font-mono text-xs text-muted-foreground">{s.size}</td>
                              <td className="py-2 font-mono text-xs text-muted-foreground">{s.lineHeight}</td>
                              <td className="py-2">
                                <span style={{ fontSize: s.size, lineHeight: s.lineHeight, letterSpacing: s.letterSpacing }} className="truncate block max-w-xs">
                                  The quick brown fox
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4">
                    <p className="text-sm font-medium text-muted-foreground mb-3">Font Weights</p>
                    <div className="flex flex-wrap gap-6">
                      {designSystem.typography.weights.map((w) => (
                        <div key={w.name} className="text-center">
                          <p style={{ fontWeight: w.value }} className="text-2xl">Aa</p>
                          <p className="text-xs text-muted-foreground capitalize">{w.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{w.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ===== SECTION 4: COLOR SYSTEM ===== */}
              <Card className="shadow-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">🎨 4. Color System</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.entries(colorGroups).map(([group, keys]) => (
                    <div key={group}>
                      <p className="text-sm font-medium text-muted-foreground mb-3">{group} Colors</p>
                      <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
                        {keys.map((key) => {
                          const val = designSystem.colors[key];
                          if (!val) return null;
                          return (
                            <button key={key} className="group/color space-y-1.5 text-left" onClick={() => copyText(val, key)}>
                              <div className="h-16 rounded-lg border border-border/50 shadow-sm group-hover/color:ring-2 ring-primary transition-all" style={{ backgroundColor: val }} />
                              <p className="text-xs font-medium capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                              <p className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                                {val} {copiedKey === key && <Check className="h-3 w-3 text-accent" />}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Neutral Colors */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-3">Neutral Scale</p>
                    <div className="flex gap-1 rounded-lg overflow-hidden border border-border/50">
                      {(designSystem.neutralColors || []).map((c) => (
                        <button key={c.name} className="flex-1 group/nc" onClick={() => copyText(c.value, `neutral-${c.name}`)}>
                          <div className="h-12" style={{ backgroundColor: c.value }} />
                          <div className="p-1.5 bg-card">
                            <p className="text-[9px] text-muted-foreground truncate">{c.name}</p>
                            <p className="text-[9px] font-mono text-muted-foreground">{c.value}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ===== DARK MODE COLORS ===== */}
              {designSystem.darkModeColors && Object.keys(designSystem.darkModeColors).length > 0 && (
                <Card className="shadow-card border-border/50 bg-muted/20">
                  <CardHeader>
                    <CardTitle className="text-lg">🌙 4b. Dark Mode Colors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
                      {Object.entries(designSystem.darkModeColors).map(([key, val]) => (
                        <button key={`dark-${key}`} className="group/color space-y-1.5 text-left" onClick={() => copyText(val, `dark-${key}`)}>
                          <div className="h-16 rounded-lg border border-border/50 shadow-sm group-hover/color:ring-2 ring-primary transition-all" style={{ backgroundColor: val }} />
                          <p className="text-xs font-medium capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                          <p className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                            {val} {copiedKey === `dark-${key}` && <Check className="h-3 w-3 text-accent" />}
                          </p>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="shadow-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">◻️ 5. Border Radius</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    {designSystem.borderRadius.map((r) => (
                      <div key={r.name} className="text-center">
                        <div className="w-16 h-16 border-2 border-primary/30 bg-primary/10" style={{ borderRadius: r.value }} />
                        <p className="text-xs font-medium mt-1.5">{r.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{r.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* ===== SECTION 6: SHADOWS ===== */}
              <Card className="shadow-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">🌑 6. Shadow System</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-6">
                    {designSystem.shadows.map((s) => (
                      <div key={s.name} className="text-center">
                        <div className="w-20 h-20 rounded-lg bg-card border border-border/30" style={{ boxShadow: s.value }} />
                        <p className="text-xs font-medium mt-2">{s.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono max-w-[120px] truncate">{s.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* ===== SECTION 7: ICON SYSTEM ===== */}
              <Card className="shadow-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">🔷 7. Icon System</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-6 items-end">
                    {(designSystem.iconSystem?.sizes || designSystem.iconSizes || DEFAULT_ICON_SIZES).map((ic) => (
                      <div key={ic.name} className="text-center">
                        <div className="flex items-center justify-center" style={{ width: ic.value, height: ic.value }}>
                          <Sparkles className="text-primary" style={{ width: ic.value, height: ic.value }} />
                        </div>
                        <p className="text-xs font-medium mt-1">{ic.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{ic.value}</p>
                      </div>
                    ))}
                  </div>
                  {designSystem.iconSystem && (
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground border-t border-border/50 pt-3">
                      <span>Stroke: <strong className="text-foreground">{designSystem.iconSystem.strokeWidth}</strong></span>
                      <span>Grid: <strong className="text-foreground">{designSystem.iconSystem.gridSize}</strong></span>
                      <span>Corner: <strong className="text-foreground">{designSystem.iconSystem.cornerRadius}</strong></span>
                    </div>
                  )}
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Recommended: {(designSystem.iconSystem?.recommendedLibraries || ["Lucide Icons", "Heroicons", "Material Icons"]).map((lib, i, arr) => (
                      <span key={lib} className="font-medium text-foreground">{lib}{i < arr.length - 1 ? " · " : ""}</span>
                    ))}</p>
                  </div>
                </CardContent>
              </Card>

              {/* ===== SECTION 8: COMPONENT PARAMETERS ===== */}
              <Card className="shadow-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MousePointerClick className="h-5 w-5" /> 8. Component Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue={(designSystem.componentSpecs || DEFAULT_COMPONENT_SPECS)[0]?.name?.toLowerCase()}>
                    <TabsList className="flex-wrap h-auto gap-1">
                      {(designSystem.componentSpecs || DEFAULT_COMPONENT_SPECS).map((cs) => (
                        <TabsTrigger key={cs.name} value={cs.name.toLowerCase()}>{cs.name}</TabsTrigger>
                      ))}
                    </TabsList>
                    {(designSystem.componentSpecs || DEFAULT_COMPONENT_SPECS).map((cs) => (
                      <TabsContent key={cs.name} value={cs.name.toLowerCase()} className="mt-4 space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Sizes table */}
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Sizes</p>
                            <table className="w-full text-xs">
                              <thead><tr className="border-b border-border/50 text-muted-foreground">
                                <th className="text-left py-1.5">Size</th>
                                <th className="text-left py-1.5">Height</th>
                                <th className="text-left py-1.5">Padding</th>
                                <th className="text-left py-1.5">Font</th>
                              </tr></thead>
                              <tbody>
                                {cs.sizes.map((sz) => (
                                  <tr key={sz.name} className="border-b border-border/20">
                                    <td className="py-1.5 font-medium">{sz.name}</td>
                                    <td className="py-1.5 font-mono text-muted-foreground">{sz.height}</td>
                                    <td className="py-1.5 font-mono text-muted-foreground">{sz.padding}</td>
                                    <td className="py-1.5 font-mono text-muted-foreground">{sz.fontSize}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {/* States & properties */}
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-2">States</p>
                              <div className="flex flex-wrap gap-2">
                                {cs.states.map((st) => (
                                  <span key={st} className="px-2.5 py-1 rounded-full text-xs bg-muted font-medium">{st}</span>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Border Radius</span>
                                <span className="font-mono">{cs.borderRadius}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Border</span>
                                <span className="font-mono">{cs.border}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>

              {/* ===== SECTION 9: ANIMATIONS ===== */}
              <Card className="shadow-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5" /> 9. Animation Parameters
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
                    <p className="text-[10px] text-muted-foreground italic">Hover bars to preview easing</p>
                  </div>
                </CardContent>
              </Card>

              {/* ===== SECTION 9b: MOTION TOKENS ===== */}
              {designSystem.motionTokens && (
                <Card className="shadow-card border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="h-5 w-5" /> 9b. Motion & Animation Tokens
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Easing Curves */}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-3">Easing Curves</p>
                      <div className="space-y-2">
                        {designSystem.motionTokens.easingCurves.map((e) => (
                          <div key={e.name} className="flex items-center gap-3">
                            <span className="text-xs font-medium w-24">{e.name}</span>
                            <div className="group/ease relative flex-1 h-6 bg-muted/50 rounded overflow-hidden cursor-pointer">
                              <div className="absolute left-0 top-0 h-full w-6 rounded bg-primary group-hover/ease:w-full" style={{ transition: `width 600ms ${e.value}` }} />
                            </div>
                            <span className="text-[9px] font-mono text-muted-foreground max-w-[160px] truncate">{e.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Duration Scale */}
                    <div className="border-t border-border/50 pt-3">
                      <p className="text-sm font-medium text-muted-foreground mb-3">Duration Scale</p>
                      <div className="flex flex-wrap gap-3">
                        {designSystem.motionTokens.durations.map((d) => (
                          <div key={d.name} className="bg-muted rounded-lg px-4 py-3 text-center">
                            <p className="text-xs font-medium">{d.name}</p>
                            <p className="text-lg font-mono font-bold text-primary">{d.value}</p>
                            <p className="text-[9px] text-muted-foreground">{d.useCase}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Named Animations */}
                    <div className="border-t border-border/50 pt-3">
                      <p className="text-sm font-medium text-muted-foreground mb-3">Named Animations</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {designSystem.motionTokens.animations.map((a) => (
                          <div key={a.name} className="rounded-lg border border-border/50 p-3">
                            <p className="text-sm font-medium">{a.name}</p>
                            <p className="text-[10px] text-muted-foreground">{a.duration} · {a.easing}</p>
                            <p className="text-[9px] font-mono text-muted-foreground/70 mt-1">{a.keyframes}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="shadow-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">🏷️ 10. Design Token Naming</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {(designSystem.tokenNaming || DEFAULT_TOKEN_NAMING).map((tn) => (
                      <div key={tn.category} className="rounded-lg border border-border/50 p-3">
                        <p className="text-sm font-medium mb-2">{tn.category}</p>
                        <div className="space-y-1">
                          {tn.examples.map((ex) => (
                            <button key={ex} onClick={() => copyText(ex, `token-${ex}`)} className="block w-full text-left">
                              <code className="text-xs font-mono text-primary/80 hover:text-primary transition-colors">{ex}</code>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* ===== SECTION 11: AUTO LAYOUT ===== */}
              <Card className="shadow-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Layers className="h-5 w-5" /> 11. Auto Layout Rules (Figma)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="text-xs text-muted-foreground border-b border-border/50">
                        <th className="text-left py-2">Pattern</th>
                        <th className="text-left py-2">Direction</th>
                        <th className="text-left py-2">Spacing</th>
                        <th className="text-left py-2">Padding</th>
                        <th className="text-left py-2">Alignment</th>
                      </tr></thead>
                      <tbody>
                        {(designSystem.autoLayoutRules || DEFAULT_AUTO_LAYOUT).map((r) => (
                          <tr key={r.name} className="border-b border-border/20">
                            <td className="py-2 font-medium">{r.name}</td>
                            <td className="py-2 font-mono text-xs text-muted-foreground">{r.direction}</td>
                            <td className="py-2 font-mono text-xs text-muted-foreground">{r.spacing}</td>
                            <td className="py-2 font-mono text-xs text-muted-foreground">{r.padding}</td>
                            <td className="py-2 font-mono text-xs text-muted-foreground">{r.alignment}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* ===== SECTION 12: ACCESSIBILITY ===== */}
              <Card className="shadow-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Accessibility className="h-5 w-5" /> 12. Accessibility Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-muted-foreground">Contrast Ratios</p>
                      {[
                        { label: "Normal text", value: (designSystem.accessibility || DEFAULT_ACCESSIBILITY).contrastNormal, pass: true },
                        { label: "Large text", value: (designSystem.accessibility || DEFAULT_ACCESSIBILITY).contrastLarge, pass: true },
                      ].map((c) => (
                        <div key={c.label} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                          <span className="text-sm">{c.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-medium">{c.value}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground">WCAG AA</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-muted-foreground">Interaction</p>
                      {[
                        { label: "Touch target min", value: (designSystem.accessibility || DEFAULT_ACCESSIBILITY).touchTargetMin },
                        { label: "Focus ring width", value: (designSystem.accessibility || DEFAULT_ACCESSIBILITY).focusRingWidth },
                        { label: "Focus ring color", value: (designSystem.accessibility || DEFAULT_ACCESSIBILITY).focusRingColor },
                      ].map((a) => (
                        <div key={a.label} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{a.label}</span>
                          <span className="font-mono">{a.value}</span>
                        </div>
                      ))}
                      {/* Touch target visual */}
                      <div className="flex items-center gap-3 pt-2">
                        <div className="w-[44px] h-[44px] rounded-lg border-2 border-dashed border-primary/40 flex items-center justify-center">
                          <span className="text-[9px] text-muted-foreground">44×44</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Minimum touch target</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ===== SECTION 13: FIGMA FILE STRUCTURE ===== */}
              <Card className="shadow-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FolderTree className="h-5 w-5" /> 13. Figma File Structure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-x-8 gap-y-1">
                    {(designSystem.figmaFileStructure || DEFAULT_FILE_STRUCTURE).map((item, i) => {
                      const parts = item.split(" / ");
                      const isSection = parts.length === 1 || (i === 0 || !((designSystem.figmaFileStructure || DEFAULT_FILE_STRUCTURE)[i - 1] || "").startsWith(parts[0]));
                      return (
                        <div key={i} className="flex items-center gap-2 py-1">
                          {parts.length > 1 ? (
                            <>
                              <span className="text-[10px] text-muted-foreground font-mono w-28 truncate">{parts[0]}</span>
                              <span className="text-muted-foreground/30">/</span>
                              <span className="text-sm">{parts[1]}</span>
                            </>
                          ) : (
                            <span className="text-sm font-medium">{item}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* ===== EXTRA: GRADIENTS, OPACITY, Z-INDEX, BORDERS ===== */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="shadow-card border-border/50">
                  <CardHeader><CardTitle className="text-lg">🌈 Gradients</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {designSystem.gradients.map((g) => (
                        <div key={g.name}>
                          <div className="h-12 rounded-lg" style={{ background: g.value }} />
                          <p className="text-[10px] text-muted-foreground mt-1">{g.name}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-card border-border/50">
                  <CardHeader><CardTitle className="text-lg">🔲 Borders</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(designSystem.borders || []).map((b) => (
                        <div key={b.name} className="flex items-center gap-4">
                          <span className="text-sm font-medium capitalize w-16">{b.name}</span>
                          <div className="flex-1 h-0" style={{ borderTop: `${b.width} ${b.style} ${b.color}` }} />
                          <span className="text-xs text-muted-foreground font-mono">{b.width}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="shadow-card border-border/50">
                  <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Layers className="h-4 w-4" /> Opacity</CardTitle></CardHeader>
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
                  <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Move className="h-4 w-4" /> Z-Index</CardTitle></CardHeader>
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

              {/* ===== COMPONENT PREVIEWS ===== */}
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
                            <pre className="rounded-lg bg-muted p-3 overflow-auto text-xs font-mono max-h-[200px]"><code>{comp.html}</code></pre>
                            <Button size="icon" variant="ghost" className="absolute top-6 right-1 h-7 w-7" onClick={() => copyText(comp.html, `${comp.key}-html`)}>
                              {copiedKey === `${comp.key}-html` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            </Button>
                          </div>
                          <div className="relative">
                            <p className="text-xs font-medium text-muted-foreground mb-2">CSS</p>
                            <pre className="rounded-lg bg-muted p-3 overflow-auto text-xs font-mono max-h-[200px]"><code>{comp.css}</code></pre>
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

              {/* ===== EXPORT ===== */}
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
                          <pre className="rounded-lg bg-muted p-4 overflow-auto text-xs font-mono max-h-[400px]"><code>{fmt.gen()}</code></pre>
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
