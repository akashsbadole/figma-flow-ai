/**
 * Generates a comprehensive SVG of the entire design system for direct Figma paste.
 * Covers all 13 categories: Layout, Spacing, Typography, Colors, Radius, Shadows,
 * Gradients, Breakpoints, Opacity, Z-Index, Transitions, Borders, Components.
 */

interface DesignSystemForSVG {
  name: string;
  colors: Record<string, string>;
  neutralColors?: { name: string; value: string }[];
  typography: {
    heading: string;
    body: string;
    mono: string;
    scale?: { name: string; size: string; lineHeight: string; letterSpacing: string }[];
    weights?: { name: string; value: number }[];
  };
  spacing?: { name: string; value: string }[];
  borderRadius?: { name: string; value: string }[];
  shadows?: { name: string; value: string }[];
  gradients?: { name: string; value: string }[];
  breakpoints?: { name: string; value: string }[];
  opacity?: { name: string; value: number }[];
  zIndex?: { name: string; value: number }[];
  transitions?: { name: string; duration: string; easing: string }[];
  borders?: { name: string; width: string; style: string; color: string }[];
  grid?: {
    desktop: { columns: number; gutter: string; margin: string };
    tablet: { columns: number; gutter: string; margin: string };
    mobile: { columns: number; gutter: string; margin: string };
  };
  iconSizes?: { name: string; value: string }[];
  componentSpecs?: { name: string; sizes: { name: string; height: string; padding: string; fontSize: string }[]; states: string[]; borderRadius: string; border: string }[];
  accessibility?: { contrastNormal: string; contrastLarge: string; touchTargetMin: string; focusRingWidth: string; focusRingColor: string };
  autoLayoutRules?: { name: string; direction: string; spacing: string; padding: string; alignment: string }[];
  figmaFileStructure?: string[];
  tokenNaming?: { category: string; examples: string[] }[];
  components?: Record<string, string>;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function generateDesignSystemSVG(data: DesignSystemForSVG): string {
  const pad = 48;
  const W = 960;
  let y = pad;
  const parts: string[] = [];
  const defs: string[] = [];
  const primary = data.colors?.primary || "#6366f1";

  const sectionTitle = (num: number, text: string) => {
    y += 16;
    parts.push(
      `<rect x="${pad - 8}" y="${y - 18}" width="${W - pad * 2 + 16}" height="32" rx="6" fill="${primary}" opacity="0.08"/>` +
      `<text x="${pad}" y="${y}" font-size="15" font-weight="700" font-family="Inter,system-ui,sans-serif" fill="${primary}">${num}. ${esc(text)}</text>`
    );
    y += 28;
  };

  const label = (x: number, yy: number, text: string, size = 10) =>
    `<text x="${x}" y="${yy}" font-size="${size}" font-family="Inter,system-ui,sans-serif" fill="#666">${esc(text)}</text>`;

  const mono = (x: number, yy: number, text: string, size = 9) =>
    `<text x="${x}" y="${yy}" font-size="${size}" font-family="monospace" fill="#999">${esc(text)}</text>`;

  const colorEntries = Object.entries(data.colors || {});
  const neutralColors = data.neutralColors || [];
  const typeScale = data.typography?.scale || [];
  const typeWeights = data.typography?.weights || [];
  const spacingItems = data.spacing || [];
  const radiusItems = data.borderRadius || [];
  const shadowItems = data.shadows || [];
  const gradients = data.gradients || [];
  const breakpoints = data.breakpoints || [];
  const opacityItems = data.opacity || [];
  const zIndexItems = data.zIndex || [];
  const transitions = data.transitions || [];
  const borders = data.borders || [];
  const grid = data.grid;
  const componentSpecs = data.componentSpecs || [];
  const accessibility = data.accessibility;
  const autoLayout = data.autoLayoutRules || [];
  const fileStructure = data.figmaFileStructure || [];
  const tokenNaming = data.tokenNaming || [];

  // ── Title ──
  parts.push(`<text x="${pad}" y="${y}" font-size="32" font-weight="800" font-family="Inter,system-ui,sans-serif" fill="#111">${esc(data.name)}</text>`);
  y += 22;
  parts.push(`<text x="${pad}" y="${y}" font-size="12" font-family="Inter,system-ui,sans-serif" fill="#888">Complete Design System · ${colorEntries.length + neutralColors.length} colors · ${typeScale.length} type sizes · ${spacingItems.length} spacing tokens</text>`);
  y += 12;
  parts.push(`<line x1="${pad}" y1="${y}" x2="${W - pad}" y2="${y}" stroke="#e5e7eb" stroke-width="1"/>`);
  y += 8;

  // ── 1. Layout / Grid ──
  if (grid) {
    sectionTitle(1, "Layout System");
    const configs = [
      { label: "Desktop", ...grid.desktop },
      { label: "Tablet", ...grid.tablet },
      { label: "Mobile", ...grid.mobile },
    ];
    configs.forEach((g, i) => {
      const sx = pad + i * 280;
      parts.push(
        `<rect x="${sx}" y="${y}" width="250" height="60" rx="8" fill="#f9fafb" stroke="#e5e7eb" stroke-width="1"/>` +
        `<text x="${sx + 125}" y="${y + 20}" font-size="11" font-weight="600" font-family="Inter,system-ui,sans-serif" fill="#333" text-anchor="middle">${g.label}</text>` +
        `<text x="${sx + 125}" y="${y + 36}" font-size="22" font-weight="700" font-family="Inter,system-ui,sans-serif" fill="${primary}" text-anchor="middle">${g.columns}</text>` +
        `<text x="${sx + 125}" y="${y + 52}" font-size="9" font-family="Inter,system-ui,sans-serif" fill="#999" text-anchor="middle">G: ${g.gutter} · M: ${g.margin}</text>`
      );
    });
    y += 74;
  }

  // ── 2. Spacing ──
  if (spacingItems.length) {
    sectionTitle(2, "Spacing System");
    spacingItems.forEach((s) => {
      const w = Math.min(parseFloat(s.value) * 16 || parseInt(s.value) || 8, 400);
      parts.push(
        mono(pad, y + 10, `${s.name}`) +
        `<rect x="${pad + 60}" y="${y}" width="${w}" height="14" rx="3" fill="${primary}" opacity="0.25"/>` +
        mono(pad + 68 + w, y + 10, s.value)
      );
      y += 20;
    });
    y += 10;
  }

  // ── 3. Typography ──
  sectionTitle(3, "Typography");
  parts.push(label(pad, y, `Heading: ${data.typography.heading} · Body: ${data.typography.body} · Mono: ${data.typography.mono}`, 11));
  y += 20;
  if (typeScale.length) {
    typeScale.forEach((t) => {
      const fs = Math.min(parseInt(t.size) || 14, 42);
      parts.push(
        `<text x="${pad}" y="${y}" font-size="${fs}" font-family="${esc(data.typography.heading)},system-ui,sans-serif" fill="#222">${esc(t.name)}</text>` +
        mono(pad + 200, y, `${t.size} / ${t.lineHeight}`)
      );
      y += fs + 10;
    });
  }
  if (typeWeights.length) {
    y += 6;
    typeWeights.forEach((w, i) => {
      const sx = pad + i * 90;
      parts.push(`<text x="${sx}" y="${y}" font-size="12" font-weight="${w.value}" font-family="Inter,system-ui,sans-serif" fill="#444">${esc(w.name)} (${w.value})</text>`);
    });
    y += 20;
  }

  // ── 4. Colors ──
  sectionTitle(4, "Color System");
  const allColors = [...colorEntries, ...neutralColors.map(c => [c.name, c.value] as [string, string])];
  const swS = 52, swG = 10, swC = 10;
  allColors.forEach(([name, hex], i) => {
    const col = i % swC;
    const row = Math.floor(i / swC);
    const sx = pad + col * (swS + swG);
    const sy = y + row * (swS + 26);
    parts.push(
      `<rect x="${sx}" y="${sy}" width="${swS}" height="${swS}" rx="6" fill="${hex}" stroke="#e5e5e5" stroke-width="1"/>` +
      `<text x="${sx + swS / 2}" y="${sy + swS + 12}" font-size="8" font-family="Inter,system-ui,sans-serif" fill="#666" text-anchor="middle">${esc(name)}</text>` +
      `<text x="${sx + swS / 2}" y="${sy + swS + 22}" font-size="7" font-family="monospace" fill="#aaa" text-anchor="middle">${esc(hex)}</text>`
    );
  });
  y += Math.ceil(allColors.length / swC) * (swS + 26) + 10;

  // ── 5. Border Radius ──
  if (radiusItems.length) {
    sectionTitle(5, "Border Radius");
    radiusItems.forEach((r, i) => {
      const sx = pad + i * 76;
      const rv = parseInt(r.value) || 4;
      parts.push(
        `<rect x="${sx}" y="${y}" width="48" height="48" rx="${rv}" fill="none" stroke="${primary}" stroke-width="2"/>` +
        label(sx + 24, y + 62, r.name, 9) +
        mono(sx + 24, y + 72, r.value)
      );
    });
    y += 82;
  }

  // ── 6. Shadows ──
  if (shadowItems.length) {
    sectionTitle(6, "Shadow System");
    shadowItems.forEach((s, i) => {
      const sx = pad + i * 110;
      parts.push(
        `<rect x="${sx}" y="${y}" width="80" height="60" rx="8" fill="#fff" stroke="#eee" stroke-width="1" style="filter:drop-shadow(2px 4px 6px rgba(0,0,0,0.12))"/>` +
        `<text x="${sx + 40}" y="${y + 76}" font-size="9" font-family="Inter,system-ui,sans-serif" fill="#666" text-anchor="middle">${esc(s.name)}</text>`
      );
    });
    y += 90;
  }

  // ── 7. Gradients ──
  if (gradients.length) {
    sectionTitle(7, "Gradients");
    gradients.forEach((g, i) => {
      const sx = pad + i * 180;
      const gid = `g${i}`;
      const colors = g.value.match(/#[0-9a-fA-F]{3,8}/g) || [primary, "#a855f7"];
      defs.push(`<linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">${colors.map((c, ci) => `<stop offset="${ci / Math.max(colors.length - 1, 1)}" stop-color="${c}"/>`).join("")}</linearGradient>`);
      parts.push(
        `<rect x="${sx}" y="${y}" width="160" height="36" rx="8" fill="url(#${gid})"/>` +
        `<text x="${sx + 80}" y="${y + 50}" font-size="9" font-family="Inter,system-ui,sans-serif" fill="#666" text-anchor="middle">${esc(g.name)}</text>`
      );
    });
    y += 62;
  }

  // ── 8. Breakpoints ──
  if (breakpoints.length) {
    sectionTitle(8, "Breakpoints");
    breakpoints.forEach((b, i) => {
      const sx = pad + i * 120;
      const bw = Math.min(parseInt(b.value) / 16, 100);
      parts.push(
        `<rect x="${sx}" y="${y}" width="${bw}" height="20" rx="4" fill="${primary}" opacity="0.15"/>` +
        `<text x="${sx + bw / 2}" y="${y + 14}" font-size="9" font-weight="600" font-family="Inter,system-ui,sans-serif" fill="${primary}" text-anchor="middle">${esc(b.name)}</text>` +
        mono(sx + bw / 2, y + 34, b.value)
      );
    });
    y += 46;
  }

  // ── 9. Opacity ──
  if (opacityItems.length) {
    sectionTitle(9, "Opacity Scale");
    opacityItems.forEach((o, i) => {
      const sx = pad + i * 70;
      parts.push(
        `<rect x="${sx}" y="${y}" width="50" height="40" rx="6" fill="${primary}" opacity="${o.value}"/>` +
        label(sx + 25, y + 54, o.name, 9) +
        mono(sx + 25, y + 64, `${o.value}`)
      );
    });
    y += 74;
  }

  // ── 10. Z-Index ──
  if (zIndexItems.length) {
    sectionTitle(10, "Z-Index Layers");
    const reversed = [...zIndexItems].reverse();
    reversed.forEach((z, i) => {
      const offset = i * 4;
      parts.push(
        `<rect x="${pad + offset}" y="${y}" width="${300 - offset * 2}" height="22" rx="4" fill="${primary}" opacity="${0.1 + i * 0.12}" stroke="#e5e7eb" stroke-width="0.5"/>` +
        `<text x="${pad + offset + 8}" y="${y + 15}" font-size="10" font-family="Inter,system-ui,sans-serif" fill="#333">${esc(z.name)}</text>` +
        mono(pad + 260, y + 15, `${z.value}`)
      );
      y += 26;
    });
    y += 10;
  }

  // ── 11. Transitions ──
  if (transitions.length) {
    sectionTitle(11, "Animations / Transitions");
    transitions.forEach((t) => {
      const dur = parseInt(t.duration) || 300;
      const barW = Math.min(dur / 2, 250);
      parts.push(
        label(pad, y + 10, t.name, 11) +
        `<rect x="${pad + 80}" y="${y + 2}" width="${barW}" height="10" rx="5" fill="${primary}" opacity="0.3"/>` +
        mono(pad + 88 + barW, y + 10, `${t.duration} · ${t.easing}`)
      );
      y += 22;
    });
    y += 10;
  }

  // ── 12. Borders ──
  if (borders.length) {
    sectionTitle(12, "Borders");
    borders.forEach((b) => {
      parts.push(
        label(pad, y + 10, b.name, 11) +
        `<line x1="${pad + 80}" y1="${y + 6}" x2="${pad + 400}" y2="${y + 6}" stroke="${b.color}" stroke-width="${parseInt(b.width) || 1}"/>` +
        mono(pad + 410, y + 10, `${b.width} ${b.style} ${b.color}`)
      );
      y += 20;
    });
    y += 10;
  }

  // ── 13. Component Specs ──
  if (componentSpecs.length) {
    sectionTitle(13, "Component Specifications");
    componentSpecs.forEach((comp) => {
      parts.push(`<text x="${pad}" y="${y}" font-size="12" font-weight="600" font-family="Inter,system-ui,sans-serif" fill="#333">${esc(comp.name)}</text>`);
      y += 16;
      // Sizes table
      comp.sizes.forEach((sz) => {
        parts.push(
          mono(pad + 12, y + 10, `${sz.name}: h=${sz.height}, p=${sz.padding}, fs=${sz.fontSize}`)
        );
        y += 16;
      });
      // States
      parts.push(label(pad + 12, y + 10, `States: ${comp.states.join(", ")}`, 9));
      y += 16;
      parts.push(label(pad + 12, y + 10, `Radius: ${comp.borderRadius} · Border: ${comp.border}`, 9));
      y += 22;
    });
  }

  // ── Accessibility ──
  if (accessibility) {
    y += 8;
    parts.push(
      `<rect x="${pad - 8}" y="${y - 18}" width="${W - pad * 2 + 16}" height="32" rx="6" fill="#10b981" opacity="0.08"/>` +
      `<text x="${pad}" y="${y}" font-size="15" font-weight="700" font-family="Inter,system-ui,sans-serif" fill="#10b981">Accessibility</text>`
    );
    y += 24;
    const items = [
      `WCAG Normal: ${accessibility.contrastNormal}`,
      `WCAG Large: ${accessibility.contrastLarge}`,
      `Touch Target: ${accessibility.touchTargetMin}`,
      `Focus Ring: ${accessibility.focusRingWidth} ${accessibility.focusRingColor}`,
    ];
    items.forEach((item) => {
      parts.push(label(pad + 12, y, item, 10));
      y += 16;
    });
    y += 10;
  }

  // ── Auto Layout Rules ──
  if (autoLayout.length) {
    y += 8;
    parts.push(
      `<rect x="${pad - 8}" y="${y - 18}" width="${W - pad * 2 + 16}" height="32" rx="6" fill="${primary}" opacity="0.08"/>` +
      `<text x="${pad}" y="${y}" font-size="15" font-weight="700" font-family="Inter,system-ui,sans-serif" fill="${primary}">Auto Layout Rules</text>`
    );
    y += 24;
    autoLayout.forEach((r) => {
      parts.push(mono(pad + 12, y, `${r.name}: ${r.direction} · spacing=${r.spacing} · pad=${r.padding} · align=${r.alignment}`));
      y += 16;
    });
    y += 10;
  }

  // ── Token Naming ──
  if (tokenNaming.length) {
    y += 8;
    parts.push(
      `<rect x="${pad - 8}" y="${y - 18}" width="${W - pad * 2 + 16}" height="32" rx="6" fill="${primary}" opacity="0.08"/>` +
      `<text x="${pad}" y="${y}" font-size="15" font-weight="700" font-family="Inter,system-ui,sans-serif" fill="${primary}">Token Naming Convention</text>`
    );
    y += 24;
    tokenNaming.forEach((tn) => {
      parts.push(label(pad + 12, y, `${tn.category}: ${tn.examples.join(", ")}`, 9));
      y += 16;
    });
    y += 10;
  }

  // ── Figma File Structure ──
  if (fileStructure.length) {
    y += 8;
    parts.push(
      `<rect x="${pad - 8}" y="${y - 18}" width="${W - pad * 2 + 16}" height="32" rx="6" fill="${primary}" opacity="0.08"/>` +
      `<text x="${pad}" y="${y}" font-size="15" font-weight="700" font-family="Inter,system-ui,sans-serif" fill="${primary}">Figma File Structure</text>`
    );
    y += 24;
    fileStructure.forEach((f) => {
      const depth = (f.match(/\//g) || []).length;
      parts.push(label(pad + 12 + depth * 16, y, f, 9));
      y += 14;
    });
    y += 10;
  }

  const totalH = y + pad;
  const defsStr = defs.length ? `<defs>${defs.join("")}</defs>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${totalH}" viewBox="0 0 ${W} ${totalH}"><rect width="${W}" height="${totalH}" fill="#fafafa" rx="16"/>${defsStr}${parts.join("")}</svg>`;
}

export async function copyDesignSystemForFigma(data: DesignSystemForSVG, toast: (opts: any) => void) {
  const svg = generateDesignSystemSVG(data);
  try {
    const item = new ClipboardItem({
      "text/plain": new Blob([svg], { type: "text/plain" }),
      "text/html": new Blob([svg], { type: "text/html" }),
    });
    await navigator.clipboard.write([item]);
    toast({ title: "Copied full design system!", description: "Paste directly in Figma (Ctrl/Cmd+V) — all 13+ sections included" });
  } catch {
    await navigator.clipboard.writeText(svg);
    toast({ title: "Copied as SVG!", description: "Paste in Figma (Ctrl/Cmd+V)" });
  }
}

export interface SVGValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateSVGForFigma(svg: string): SVGValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const forbidden = [
    { pattern: /<foreignObject/i, message: 'Contains <foreignObject> - not supported in Figma' },
    { pattern: /<html/i, message: 'Contains HTML tags - use native SVG only' },
    { pattern: /<body/i, message: 'Contains <body> tag - use native SVG only' },
    { pattern: /<div/i, message: 'Contains <div> tag - use <g> or <rect> instead' },
    { pattern: /<script/i, message: 'Contains <script> tag - not allowed' },
    { pattern: /<style/i, message: 'Contains <style> tag - use inline styles' },
  ];
  
  for (const { pattern, message } of forbidden) {
    if (pattern.test(svg)) {
      errors.push(message);
    }
  }
  
  if (!svg.includes('viewBox')) {
    errors.push('Missing viewBox attribute - required for Figma');
  }
  
  if (!svg.includes('xmlns')) {
    warnings.push('Missing xmlns attribute - may cause issues');
  }
  
  if (svg.includes('width="100%"') || svg.includes('height="100%"')) {
    warnings.push('Percentage dimensions found - use fixed viewBox instead');
  }
  
  const textMatches = svg.match(/<text[^>]*>/g);
  if (textMatches) {
    textMatches.forEach((match, i) => {
      if (!match.includes('font-family')) {
        warnings.push(`Text element ${i + 1} missing font-family`);
      }
      if (!match.includes('font-size')) {
        warnings.push(`Text element ${i + 1} missing font-size`);
      }
    });
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function cleanSVGForFigma(svg: string): string {
  let cleaned = svg;
  
  cleaned = cleaned.replace(/<\?xml[^?]*\?>/g, '');
  
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
  
  if (!cleaned.includes('xmlns=')) {
    cleaned = cleaned.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  cleaned = cleaned.replace(/<foreignObject\b[^<]*(?:(?!<\/foreignObject>)<[^<]*)*<\/foreignObject>/gi, '');
  
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

export async function copySVGToFigma(svg: string, toast: (opts: any) => void): Promise<boolean> {
  try {
    const validation = validateSVGForFigma(svg);
    
    if (!validation.valid) {
      console.error('SVG validation failed:', validation.errors);
      toast({
        title: "SVG validation failed",
        description: validation.errors.join(', '),
        variant: "destructive",
      });
      return false;
    }
    
    if (validation.warnings.length > 0) {
      console.warn('SVG validation warnings:', validation.warnings);
    }
    
    const cleaned = cleanSVGForFigma(svg);
    
    const svgBlob = new Blob([cleaned], { type: 'image/svg+xml' });
    const textBlob = new Blob([cleaned], { type: 'text/plain' });
    const htmlBlob = new Blob([cleaned], { type: 'text/html' });
    
    try {
      const item = new ClipboardItem({
        'image/svg+xml': svgBlob,
        'text/html': htmlBlob,
        'text/plain': textBlob,
      });
      await navigator.clipboard.write([item]);
    } catch {
      await navigator.clipboard.writeText(cleaned);
    }
    
    toast({
      title: "Copied to clipboard!",
      description: "Paste directly in Figma (Cmd/Ctrl + V)",
    });
    
    return true;
  } catch (error) {
    console.error('Failed to copy SVG:', error);
    toast({
      title: "Copy failed",
      description: "Please try again or download as SVG file",
      variant: "destructive",
    });
    return false;
  }
}

export function downloadSVG(svg: string, filename: string = 'design.svg'): void {
  const cleaned = cleanSVGForFigma(svg);
  const blob = new Blob([cleaned], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
