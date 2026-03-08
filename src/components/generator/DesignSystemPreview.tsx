import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2, Palette, Copy, Check, Download, Grid3X3, Type, Move, Layers,
  Zap, Monitor, Accessibility, FolderTree, MousePointerClick, Eye, Code
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { copyDesignSystemForFigma } from "@/lib/figma-svg-export";

interface DesignSystemData {
  name: string;
  colors: Record<string, string>;
  typography: { heading: string; body: string; mono: string; scale?: any[]; weights?: any[] };
  spacing: { name: string; value: string }[];
  borderRadius: { name: string; value: string }[];
  shadows: { name: string; value: string }[];
  gradients?: { name: string; value: string }[];
  breakpoints?: { name: string; value: string }[];
  opacity?: { name: string; value: number }[];
  zIndex?: { name: string; value: number }[];
  transitions?: { name: string; duration: string; easing: string }[];
  borders?: { name: string; width: string; style: string; color: string }[];
  components?: Record<string, string>;
  [key: string]: any;
}

interface DesignSystemPreviewProps {
  data: DesignSystemData | null;
  loading: boolean;
  error?: string | null;
}

function SectionHeader({ icon: Icon, title, count }: { icon: any; title: string; count?: number }) {
  return (
    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-foreground">
      <Icon className="h-4 w-4 text-primary" />
      {title}
      {count !== undefined && <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{count}</span>}
    </h4>
  );
}

export function DesignSystemPreview({ data, loading, error }: DesignSystemPreviewProps) {
  const { toast } = useToast();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Generating design system...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <Palette className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">Design system will appear here</p>
      </div>
    );
  }

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast({ title: "Copied!" });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const colorEntries = Object.entries(data.colors || {});
  const spacingItems = data.spacing || [];
  const radiusItems = data.borderRadius || [];
  const shadowItems = data.shadows || [];
  const gradients = data.gradients || [];
  const breakpoints = data.breakpoints || [];
  const opacityItems = data.opacity || [];
  const zIndexItems = data.zIndex || [];
  const transitions = data.transitions || [];
  const borders = data.borders || [];
  const typeScale = data.typography?.scale || [];
  const typeWeights = data.typography?.weights || [];

  // Component previews
  const componentEntries = data.components ? [
    { key: "button", label: "Button", html: data.components.buttonHtml, css: data.components.buttonCss },
    { key: "card", label: "Card", html: data.components.cardHtml, css: data.components.cardCss },
    { key: "input", label: "Input", html: data.components.inputHtml, css: data.components.inputCss },
    { key: "badge", label: "Badge", html: data.components.badgeHtml, css: data.components.badgeCss },
    { key: "alert", label: "Alert", html: data.components.alertHtml, css: data.components.alertCss },
    { key: "avatar", label: "Avatar", html: data.components.avatarHtml, css: data.components.avatarCss },
  ].filter(c => c.html && c.css) : [];

  const generateFigmaSVG = () => {
    const pad = 40;
    const colW = 800;
    let y = pad;

    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const sections: string[] = [];

    const heading = (text: string, yPos: number) =>
      `<text x="${pad}" y="${yPos}" font-size="20" font-weight="700" font-family="Inter,system-ui,sans-serif" fill="#111">${esc(text)}</text>`;

    // Title
    sections.push(`<text x="${pad}" y="${y}" font-size="28" font-weight="800" font-family="Inter,system-ui,sans-serif" fill="#111">${esc(data.name)} — Design System</text>`);
    y += 50;

    // Colors
    sections.push(heading("Color Palette", y));
    y += 30;
    const swatchSize = 56;
    const swatchGap = 12;
    const swatchCols = 7;
    colorEntries.forEach(([name, hex], i) => {
      const col = i % swatchCols;
      const row = Math.floor(i / swatchCols);
      const sx = pad + col * (swatchSize + swatchGap);
      const sy = y + row * (swatchSize + 28);
      sections.push(
        `<rect x="${sx}" y="${sy}" width="${swatchSize}" height="${swatchSize}" rx="8" fill="${hex}" stroke="#e5e5e5" stroke-width="1"/>` +
        `<text x="${sx + swatchSize / 2}" y="${sy + swatchSize + 14}" font-size="9" font-family="Inter,system-ui,sans-serif" fill="#666" text-anchor="middle">${esc(name)}</text>` +
        `<text x="${sx + swatchSize / 2}" y="${sy + swatchSize + 24}" font-size="8" font-family="monospace" fill="#999" text-anchor="middle">${esc(hex)}</text>`
      );
    });
    const colorRows = Math.ceil(colorEntries.length / swatchCols);
    y += colorRows * (swatchSize + 28) + 30;

    // Typography
    sections.push(heading("Typography", y));
    y += 30;
    sections.push(`<text x="${pad}" y="${y}" font-size="12" font-family="Inter,system-ui,sans-serif" fill="#666">Heading: ${esc(data.typography.heading)} · Body: ${esc(data.typography.body)} · Mono: ${esc(data.typography.mono)}</text>`);
    y += 24;
    typeScale.forEach((t: any) => {
      const fs = Math.min(parseInt(t.size) || 14, 48);
      sections.push(`<text x="${pad}" y="${y}" font-size="${fs}" font-family="${esc(data.typography.heading)},system-ui,sans-serif" fill="#222">${esc(t.name)} — ${esc(t.size)}</text>`);
      y += fs + 12;
    });
    y += 20;

    // Spacing
    if (spacingItems.length) {
      sections.push(heading("Spacing", y));
      y += 28;
      spacingItems.forEach((s) => {
        const w = Math.min(parseInt(s.value) || 8, 300);
        sections.push(
          `<text x="${pad}" y="${y + 10}" font-size="10" font-family="monospace" fill="#666">${esc(s.name)} (${esc(s.value)})</text>` +
          `<rect x="${pad + 120}" y="${y}" width="${w}" height="14" rx="3" fill="#6366f1" opacity="0.3"/>`
        );
        y += 22;
      });
      y += 20;
    }

    // Border Radius
    if (radiusItems.length) {
      sections.push(heading("Border Radius", y));
      y += 28;
      radiusItems.forEach((r, i) => {
        const sx = pad + i * 80;
        const rv = parseInt(r.value) || 4;
        sections.push(
          `<rect x="${sx}" y="${y}" width="50" height="50" rx="${rv}" fill="none" stroke="#6366f1" stroke-width="2"/>` +
          `<text x="${sx + 25}" y="${y + 68}" font-size="9" font-family="Inter,system-ui,sans-serif" fill="#666" text-anchor="middle">${esc(r.name)}</text>` +
          `<text x="${sx + 25}" y="${y + 78}" font-size="8" font-family="monospace" fill="#999" text-anchor="middle">${esc(r.value)}</text>`
        );
      });
      y += 90;
    }

    // Shadows (shown as labeled rectangles)
    if (shadowItems.length) {
      sections.push(heading("Shadows", y));
      y += 28;
      shadowItems.forEach((s, i) => {
        const sx = pad + i * 100;
        sections.push(
          `<rect x="${sx}" y="${y}" width="70" height="70" rx="8" fill="#fff" stroke="#e5e5e5" stroke-width="1" style="filter:drop-shadow(2px 2px 4px rgba(0,0,0,0.15))"/>` +
          `<text x="${sx + 35}" y="${y + 86}" font-size="9" font-family="Inter,system-ui,sans-serif" fill="#666" text-anchor="middle">${esc(s.name)}</text>`
        );
      });
      y += 100;
    }

    // Gradients
    if (gradients.length) {
      sections.push(heading("Gradients", y));
      y += 28;
      const defs: string[] = [];
      gradients.forEach((g, i) => {
        const sx = pad + i * 160;
        const gid = `grad-${i}`;
        // Parse simple linear-gradient to SVG
        const colors = g.value.match(/#[0-9a-fA-F]{3,8}/g) || [data.colors?.primary || "#6366f1", "#a855f7"];
        defs.push(`<linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">${colors.map((c: string, ci: number) => `<stop offset="${ci / Math.max(colors.length - 1, 1)}" stop-color="${c}"/>`).join("")}</linearGradient>`);
        sections.push(
          `<rect x="${sx}" y="${y}" width="140" height="40" rx="8" fill="url(#${gid})"/>` +
          `<text x="${sx + 70}" y="${y + 56}" font-size="9" font-family="Inter,system-ui,sans-serif" fill="#666" text-anchor="middle">${esc(g.name)}</text>`
        );
      });
      sections.unshift(`<defs>${defs.join("")}</defs>`);
      y += 70;
    }

    // Components
    if (componentEntries.length) {
      sections.push(heading("Components", y));
      y += 24;
      sections.push(`<text x="${pad}" y="${y}" font-size="11" font-family="Inter,system-ui,sans-serif" fill="#999">Component HTML/CSS exported in code — see tokens above for styling</text>`);
      y += 20;
      componentEntries.forEach((c) => {
        sections.push(`<text x="${pad + 8}" y="${y}" font-size="11" font-family="Inter,system-ui,sans-serif" fill="#444">• ${esc(c.label)}</text>`);
        y += 18;
      });
      y += 10;
    }

    const totalH = y + pad;
    const totalW = colW + pad * 2;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}"><rect width="${totalW}" height="${totalH}" fill="#fafafa" rx="12"/>${sections.join("")}</svg>`;
  };

  const copyEntireDesignForFigma = async () => {
    const svg = generateFigmaSVG();
    try {
      // Try to copy as both SVG text and image for maximum Figma compatibility
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const item = new ClipboardItem({
        "text/plain": new Blob([svg], { type: "text/plain" }),
        "text/html": new Blob([svg], { type: "text/html" }),
      });
      await navigator.clipboard.write([item]);
      toast({ title: "Copied entire design system!", description: "Paste directly in Figma (Ctrl/Cmd+V)" });
    } catch {
      // Fallback: copy as text
      await navigator.clipboard.writeText(svg);
      toast({ title: "Copied as SVG!", description: "Paste in Figma (Ctrl/Cmd+V)" });
    }
  };

  const generateFigmaTokensJSON = () => {
    const tokens: any = { global: { colors: {}, typography: {}, spacing: {}, borderRadius: {}, shadows: {}, opacity: {}, zIndex: {}, breakpoints: {} } };
    colorEntries.forEach(([k, v]) => { tokens.global.colors[k] = { value: v, type: "color" }; });
    typeScale.forEach((s: any) => { tokens.global.typography[s.name] = { value: { fontSize: s.size, lineHeight: s.lineHeight, letterSpacing: s.letterSpacing, fontFamily: data.typography.heading }, type: "typography" }; });
    spacingItems.forEach((s) => { tokens.global.spacing[s.name] = { value: s.value, type: "spacing" }; });
    radiusItems.forEach((r) => { tokens.global.borderRadius[r.name] = { value: r.value, type: "borderRadius" }; });
    shadowItems.forEach((s) => { tokens.global.shadows[s.name] = { value: s.value, type: "boxShadow" }; });
    opacityItems.forEach((o) => { tokens.global.opacity[o.name] = { value: o.value, type: "opacity" }; });
    zIndexItems.forEach((z) => { tokens.global.zIndex[z.name] = { value: z.value, type: "other" }; });
    breakpoints.forEach((b) => { tokens.global.breakpoints[b.name] = { value: b.value, type: "dimension" }; });
    return JSON.stringify(tokens, null, 2);
  };

  const generateCSSVars = () => {
    let css = `/* ${data.name} Design System */\n:root {\n`;
    css += `  /* Colors */\n`;
    colorEntries.forEach(([k, v]) => { css += `  --color-${k.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${v};\n`; });
    css += `\n  /* Typography */\n  --font-heading: '${data.typography.heading}', sans-serif;\n  --font-body: '${data.typography.body}', sans-serif;\n  --font-mono: '${data.typography.mono}', monospace;\n`;
    typeScale.forEach((s: any) => { css += `  --font-size-${s.name}: ${s.size};\n  --line-height-${s.name}: ${s.lineHeight};\n`; });
    css += `\n  /* Spacing */\n`;
    spacingItems.forEach((s) => { css += `  --space-${s.name}: ${s.value};\n`; });
    css += `\n  /* Border Radius */\n`;
    radiusItems.forEach((r) => { css += `  --radius-${r.name}: ${r.value};\n`; });
    css += `\n  /* Shadows */\n`;
    shadowItems.forEach((s) => { css += `  --shadow-${s.name}: ${s.value};\n`; });
    if (gradients.length) { css += `\n  /* Gradients */\n`; gradients.forEach((g) => { css += `  --gradient-${g.name}: ${g.value};\n`; }); }
    if (transitions.length) { css += `\n  /* Transitions */\n`; transitions.forEach((t) => { css += `  --transition-${t.name}: ${t.duration} ${t.easing};\n`; }); }
    css += `}`;
    return css;
  };

  const generateTailwindCfg = () => {
    const cfg: any = { theme: { extend: { colors: {}, fontFamily: {}, fontSize: {}, spacing: {}, borderRadius: {}, boxShadow: {} } } };
    colorEntries.forEach(([k, v]) => { cfg.theme.extend.colors[k.replace(/([A-Z])/g, "-$1").toLowerCase()] = v; });
    cfg.theme.extend.fontFamily = { heading: [data.typography.heading, "sans-serif"], body: [data.typography.body, "sans-serif"], mono: [data.typography.mono, "monospace"] };
    typeScale.forEach((s: any) => { cfg.theme.extend.fontSize[s.name] = [s.size, { lineHeight: s.lineHeight, letterSpacing: s.letterSpacing }]; });
    spacingItems.forEach((s) => { cfg.theme.extend.spacing[s.name] = s.value; });
    radiusItems.forEach((r) => { cfg.theme.extend.borderRadius[r.name] = r.value; });
    shadowItems.forEach((s) => { cfg.theme.extend.boxShadow[s.name] = s.value; });
    return `// ${data.name} - Tailwind Configuration\nexport default ${JSON.stringify(cfg, null, 2)} satisfies Config;`;
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    toast({ title: `Downloaded ${filename}` });
  };

  return (
    <div className="space-y-6">
      {/* Header + Export Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: data.colors?.primary || "hsl(var(--primary))" }}>
            <span className="text-lg font-bold text-primary-foreground">{data.name?.charAt(0) || "D"}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold">{data.name}</h3>
            <p className="text-[10px] text-muted-foreground">
              {colorEntries.length} colors · {typeScale.length} type sizes · {spacingItems.length} spacing tokens
            </p>
          </div>
        </div>
        <div className="flex gap-1 flex-wrap justify-end">
          <Button size="sm" className="text-xs h-8 gap-1.5 font-semibold" onClick={copyEntireDesignForFigma}>
            <Copy className="h-3.5 w-3.5" /> Copy for Figma
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={() => { navigator.clipboard.writeText(generateCSSVars()); toast({ title: "CSS Variables copied!" }); }}>
            <Code className="h-3 w-3" /> CSS
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={() => { navigator.clipboard.writeText(generateTailwindCfg()); toast({ title: "Tailwind config copied!" }); }}>
            <Code className="h-3 w-3" /> Tailwind
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={() => downloadFile(generateFigmaTokensJSON(), `${data.name}-figma-tokens.json`)}>
            <Download className="h-3 w-3" /> JSON
          </Button>
        </div>
      </div>

      {/* 1. Layout / Grid */}
      <Card className="p-4 border-border/50">
        <SectionHeader icon={Grid3X3} title="1. Layout System" />
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Desktop", cols: 12, gutter: "24px", margin: "120px" },
            { label: "Tablet", cols: 8, gutter: "16px", margin: "64px" },
            { label: "Mobile", cols: 4, gutter: "16px", margin: "16px" },
          ].map((g) => (
            <div key={g.label} className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-xs font-medium mb-1">{g.label}</p>
              <p className="text-lg font-bold text-primary">{g.cols}</p>
              <p className="text-[10px] text-muted-foreground">columns</p>
              <div className="flex justify-center gap-2 mt-1 text-[9px] text-muted-foreground">
                <span>G: {g.gutter}</span>
                <span>M: {g.margin}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 2. Spacing */}
      {spacingItems.length > 0 && (
        <Card className="p-4 border-border/50">
          <SectionHeader icon={Move} title="2. Spacing System" count={spacingItems.length} />
          <div className="space-y-1.5">
            {spacingItems.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-muted-foreground w-8">{s.name}</span>
                <div className="h-3 rounded bg-primary/30" style={{ width: s.value }} />
                <span className="text-[10px] text-muted-foreground">{s.value}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 3. Typography */}
      <Card className="p-4 border-border/50">
        <SectionHeader icon={Type} title="3. Typography" />
        <div className="space-y-2 text-sm mb-3">
          <p><span className="text-muted-foreground">Heading:</span> {data.typography.heading}</p>
          <p><span className="text-muted-foreground">Body:</span> {data.typography.body}</p>
          <p><span className="text-muted-foreground">Mono:</span> {data.typography.mono}</p>
        </div>
        {typeScale.length > 0 && (
          <div className="space-y-1 border-t border-border/50 pt-3">
            <p className="text-[10px] text-muted-foreground mb-2">Type Scale</p>
            {typeScale.map((t: any) => (
              <div key={t.name} className="flex items-baseline gap-3">
                <span className="text-[10px] font-mono text-muted-foreground w-10">{t.name}</span>
                <span style={{ fontSize: t.size, lineHeight: t.lineHeight }} className="truncate">{t.size}</span>
              </div>
            ))}
          </div>
        )}
        {typeWeights.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-border/50 pt-3 mt-3">
            {typeWeights.map((w: any) => (
              <span key={w.name} className="text-xs bg-muted px-2 py-1 rounded" style={{ fontWeight: w.value }}>
                {w.name} ({w.value})
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* 4. Colors */}
      <Card className="p-4 border-border/50">
        <SectionHeader icon={Palette} title="4. Color System" count={colorEntries.length} />
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {colorEntries.map(([name, hex]) => (
            <button
              key={name}
              className="text-center group cursor-pointer"
              onClick={() => copyText(hex, `color-${name}`)}
              title={`${name}: ${hex}`}
            >
              <div className="w-full aspect-square rounded-lg border border-border/50 shadow-sm transition-transform group-hover:scale-105" style={{ backgroundColor: hex }} />
              <p className="text-[9px] text-muted-foreground mt-1 truncate">{name}</p>
              <p className="text-[8px] font-mono text-muted-foreground/70">{hex}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* 5. Border Radius */}
      {radiusItems.length > 0 && (
        <Card className="p-4 border-border/50">
          <SectionHeader icon={Layers} title="5. Border Radius" count={radiusItems.length} />
          <div className="flex flex-wrap gap-3">
            {radiusItems.map((r) => (
              <div key={r.name} className="text-center">
                <div className="w-12 h-12 bg-primary/20 border-2 border-primary/40" style={{ borderRadius: r.value }} />
                <p className="text-[10px] text-muted-foreground mt-1">{r.name}</p>
                <p className="text-[9px] font-mono text-muted-foreground/60">{r.value}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 6. Shadows */}
      {shadowItems.length > 0 && (
        <Card className="p-4 border-border/50">
          <SectionHeader icon={Layers} title="6. Shadow System" count={shadowItems.length} />
          <div className="flex flex-wrap gap-4">
            {shadowItems.map((s) => (
              <div key={s.name} className="text-center">
                <div className="w-16 h-16 bg-card rounded-lg border border-border/30" style={{ boxShadow: s.value }} />
                <p className="text-[10px] text-muted-foreground mt-1">{s.name}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 7. Gradients */}
      {gradients.length > 0 && (
        <Card className="p-4 border-border/50">
          <SectionHeader icon={Palette} title="7. Gradients" count={gradients.length} />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {gradients.map((g) => (
              <div key={g.name} className="text-center">
                <div className="h-12 rounded-lg" style={{ background: g.value }} />
                <p className="text-[10px] text-muted-foreground mt-1">{g.name}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 8. Breakpoints */}
      {breakpoints.length > 0 && (
        <Card className="p-4 border-border/50">
          <SectionHeader icon={Monitor} title="8. Breakpoints" count={breakpoints.length} />
          <div className="flex flex-wrap gap-2">
            {breakpoints.map((b) => (
              <div key={b.name} className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded text-xs">
                <span className="font-mono text-muted-foreground">{b.name}</span>
                <span className="font-semibold">{b.value}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 9. Opacity */}
      {opacityItems.length > 0 && (
        <Card className="p-4 border-border/50">
          <SectionHeader icon={Eye} title="9. Opacity Scale" count={opacityItems.length} />
          <div className="flex flex-wrap gap-3">
            {opacityItems.map((o) => (
              <div key={o.name} className="text-center">
                <div className="w-10 h-10 rounded bg-primary" style={{ opacity: o.value }} />
                <p className="text-[10px] text-muted-foreground mt-1">{o.name}</p>
                <p className="text-[9px] font-mono text-muted-foreground/60">{o.value}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 10. Z-Index */}
      {zIndexItems.length > 0 && (
        <Card className="p-4 border-border/50">
          <SectionHeader icon={Layers} title="10. Z-Index Layers" count={zIndexItems.length} />
          <div className="flex flex-wrap gap-2">
            {zIndexItems.map((z) => (
              <div key={z.name} className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded text-xs">
                <span className="text-muted-foreground">{z.name}</span>
                <span className="font-mono font-semibold">{z.value}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 11. Transitions / Animations */}
      {transitions.length > 0 && (
        <Card className="p-4 border-border/50">
          <SectionHeader icon={Zap} title="11. Animation / Transitions" count={transitions.length} />
          <div className="space-y-2">
            {transitions.map((t) => (
              <div key={t.name} className="flex items-center gap-3">
                <span className="text-xs font-medium w-14">{t.name}</span>
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${Math.min(parseInt(t.duration) / 5, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">{t.duration}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 12. Borders */}
      {borders.length > 0 && (
        <Card className="p-4 border-border/50">
          <SectionHeader icon={Layers} title="12. Borders" count={borders.length} />
          <div className="space-y-2">
            {borders.map((b) => (
              <div key={b.name} className="flex items-center gap-3">
                <span className="text-xs font-medium w-14">{b.name}</span>
                <div className="flex-1 rounded" style={{ borderBottom: `${b.width} ${b.style} ${b.color}` }} />
                <span className="text-[10px] font-mono text-muted-foreground">{b.width} {b.style}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 13. Components */}
      {componentEntries.length > 0 && (
        <Card className="p-4 border-border/50">
          <SectionHeader icon={MousePointerClick} title="13. Components" count={componentEntries.length} />
          <Tabs defaultValue={componentEntries[0]?.key} className="space-y-3">
            <TabsList className="bg-muted/50 flex-wrap h-auto gap-1">
              {componentEntries.map((c) => (
                <TabsTrigger key={c.key} value={c.key} className="text-xs">{c.label}</TabsTrigger>
              ))}
            </TabsList>
            {componentEntries.map((c) => (
              <TabsContent key={c.key} value={c.key} className="mt-0">
                <div className="bg-muted/30 rounded-lg p-4 mb-2">
                  <iframe
                    srcDoc={`<style>*{margin:0;padding:0;box-sizing:border-box;font-family:system-ui,sans-serif;}body{padding:16px;}${c.css}</style>${c.html}`}
                    className="w-full border-0 rounded"
                    style={{ height: 120 }}
                    title={c.label}
                    sandbox="allow-scripts"
                  />
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => copyText(`${c.html}\n\n/* CSS */\n${c.css}`, c.key)}
                  >
                    {copiedKey === c.key ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                    Copy
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      )}
    </div>
  );
}
