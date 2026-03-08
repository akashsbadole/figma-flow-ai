/**
 * Generates an SVG representation of a design system that can be pasted directly into Figma.
 * Figma natively accepts SVG from clipboard as editable objects — no plugin needed.
 */

interface DesignSystemForSVG {
  name: string;
  colors: Record<string, string>;
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
  components?: Record<string, string>;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function generateDesignSystemSVG(data: DesignSystemForSVG): string {
  const pad = 40;
  const colW = 800;
  let y = pad;
  const sections: string[] = [];
  const defs: string[] = [];

  const heading = (text: string, yPos: number) =>
    `<text x="${pad}" y="${yPos}" font-size="20" font-weight="700" font-family="Inter,system-ui,sans-serif" fill="#111">${esc(text)}</text>`;

  const colorEntries = Object.entries(data.colors || {});
  const typeScale = data.typography?.scale || [];
  const spacingItems = data.spacing || [];
  const radiusItems = data.borderRadius || [];
  const shadowItems = data.shadows || [];
  const gradients = data.gradients || [];

  // Title
  sections.push(`<text x="${pad}" y="${y}" font-size="28" font-weight="800" font-family="Inter,system-ui,sans-serif" fill="#111">${esc(data.name)} — Design System</text>`);
  y += 50;

  // Colors
  if (colorEntries.length) {
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
  }

  // Typography
  sections.push(heading("Typography", y));
  y += 30;
  sections.push(`<text x="${pad}" y="${y}" font-size="12" font-family="Inter,system-ui,sans-serif" fill="#666">Heading: ${esc(data.typography.heading)} · Body: ${esc(data.typography.body)} · Mono: ${esc(data.typography.mono)}</text>`);
  y += 24;
  typeScale.forEach((t) => {
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

  // Shadows
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
    gradients.forEach((g, i) => {
      const sx = pad + i * 160;
      const gid = `grad-${i}`;
      const colors = g.value.match(/#[0-9a-fA-F]{3,8}/g) || [data.colors?.primary || "#6366f1", "#a855f7"];
      defs.push(`<linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">${colors.map((c: string, ci: number) => `<stop offset="${ci / Math.max(colors.length - 1, 1)}" stop-color="${c}"/>`).join("")}</linearGradient>`);
      sections.push(
        `<rect x="${sx}" y="${y}" width="140" height="40" rx="8" fill="url(#${gid})"/>` +
        `<text x="${sx + 70}" y="${y + 56}" font-size="9" font-family="Inter,system-ui,sans-serif" fill="#666" text-anchor="middle">${esc(g.name)}</text>`
      );
    });
    y += 70;
  }

  const totalH = y + pad;
  const totalW = colW + pad * 2;
  const defsStr = defs.length ? `<defs>${defs.join("")}</defs>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}"><rect width="${totalW}" height="${totalH}" fill="#fafafa" rx="12"/>${defsStr}${sections.join("")}</svg>`;
}

export async function copyDesignSystemForFigma(data: DesignSystemForSVG, toast: (opts: any) => void) {
  const svg = generateDesignSystemSVG(data);
  try {
    const item = new ClipboardItem({
      "text/plain": new Blob([svg], { type: "text/plain" }),
      "text/html": new Blob([svg], { type: "text/html" }),
    });
    await navigator.clipboard.write([item]);
    toast({ title: "Copied entire design system!", description: "Paste directly in Figma (Ctrl/Cmd+V)" });
  } catch {
    await navigator.clipboard.writeText(svg);
    toast({ title: "Copied as SVG!", description: "Paste in Figma (Ctrl/Cmd+V)" });
  }
}
