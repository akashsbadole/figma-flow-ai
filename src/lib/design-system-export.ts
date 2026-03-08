import { DesignSystemData } from "@/components/design-system/types";

export function generateFigmaTokens(ds: DesignSystemData): string {
  const tokens: any = {
    global: {
      colors: {} as any,
      neutralColors: {} as any,
      typography: {} as any,
      spacing: {} as any,
      borderRadius: {} as any,
      shadows: {} as any,
      opacity: {} as any,
      breakpoints: {} as any,
      zIndex: {} as any,
      grid: {} as any,
      iconSizes: {} as any,
    },
  };

  Object.entries(ds.colors).forEach(([key, val]) => {
    tokens.global.colors[key] = { value: val, type: "color" };
  });

  (ds.neutralColors || []).forEach((c) => {
    tokens.global.neutralColors[c.name.toLowerCase().replace(/\s+/g, "-")] = { value: c.value, type: "color" };
  });

  ds.typography.scale.forEach((s) => {
    tokens.global.typography[s.name] = {
      value: { fontSize: s.size, lineHeight: s.lineHeight, letterSpacing: s.letterSpacing, fontFamily: ds.typography.heading },
      type: "typography",
    };
  });

  ds.spacing.forEach((s) => { tokens.global.spacing[s.name] = { value: s.value, type: "spacing" }; });
  ds.borderRadius.forEach((r) => { tokens.global.borderRadius[r.name] = { value: r.value, type: "borderRadius" }; });
  ds.shadows.forEach((s) => { tokens.global.shadows[s.name] = { value: s.value, type: "boxShadow" }; });
  (ds.opacity || []).forEach((o) => { tokens.global.opacity[o.name] = { value: o.value, type: "opacity" }; });
  (ds.breakpoints || []).forEach((b) => { tokens.global.breakpoints[b.name] = { value: b.value, type: "dimension" }; });
  (ds.zIndex || []).forEach((z) => { tokens.global.zIndex[z.name] = { value: z.value, type: "other" }; });
  (ds.iconSizes || []).forEach((ic) => { tokens.global.iconSizes[ic.name] = { value: ic.value, type: "sizing" }; });

  if (ds.grid) {
    ["desktop", "tablet", "mobile"].forEach((device) => {
      const g = (ds.grid as any)[device];
      if (g) {
        tokens.global.grid[device] = {
          columns: { value: g.columns, type: "other" },
          gutter: { value: g.gutter, type: "spacing" },
          margin: { value: g.margin, type: "spacing" },
        };
      }
    });
  }

  return JSON.stringify(tokens, null, 2);
}

export function generateCSS(ds: DesignSystemData): string {
  const colorVars = Object.entries(ds.colors)
    .map(([key, val]) => `  --color-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${val};`)
    .join("\n");

  const neutralVars = (ds.neutralColors || [])
    .map((c) => `  --color-${c.name.toLowerCase().replace(/\s+/g, "-")}: ${c.value};`)
    .join("\n");

  const typographyVars = ds.typography.scale
    .map((s) => `  --font-size-${s.name}: ${s.size};\n  --line-height-${s.name}: ${s.lineHeight};\n  --letter-spacing-${s.name}: ${s.letterSpacing};`)
    .join("\n");

  const spacingVars = ds.spacing.map((s) => `  --space-${s.name}: ${s.value};`).join("\n");
  const radiusVars = ds.borderRadius.map((r) => `  --radius-${r.name}: ${r.value};`).join("\n");
  const shadowVars = ds.shadows.map((s) => `  --shadow-${s.name}: ${s.value};`).join("\n");
  const gradientVars = ds.gradients.map((g) => `  --gradient-${g.name}: ${g.value};`).join("\n");
  const opacityVars = (ds.opacity || []).map((o) => `  --opacity-${o.name}: ${o.value};`).join("\n");
  const zIndexVars = (ds.zIndex || []).map((z) => `  --z-${z.name}: ${z.value};`).join("\n");
  const breakpointVars = (ds.breakpoints || []).map((b) => `  --breakpoint-${b.name}: ${b.value};`).join("\n");
  const transitionVars = (ds.transitions || []).map((t) => `  --transition-${t.name}: ${t.duration} ${t.easing};`).join("\n");
  const borderVars = (ds.borders || []).map((b) => `  --border-${b.name}: ${b.width} ${b.style} ${b.color};`).join("\n");
  const iconVars = (ds.iconSizes || []).map((ic) => `  --icon-${ic.name}: ${ic.value};`).join("\n");

  let gridVars = "";
  if (ds.grid) {
    ["desktop", "tablet", "mobile"].forEach((device) => {
      const g = (ds.grid as any)[device];
      if (g) {
        gridVars += `  --grid-${device}-columns: ${g.columns};\n  --grid-${device}-gutter: ${g.gutter};\n  --grid-${device}-margin: ${g.margin};\n`;
      }
    });
  }

  const a11y = ds.accessibility;
  const a11yVars = a11y ? `  /* Accessibility */\n  --focus-ring-width: ${a11y.focusRingWidth};\n  --focus-ring-color: ${a11y.focusRingColor};\n  --touch-target-min: ${a11y.touchTargetMin};` : "";

  return `/* ${ds.name} Design System */
@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(ds.typography.heading)}:wght@300;400;500;600;700&family=${encodeURIComponent(ds.typography.body)}:wght@300;400;500;600;700&display=swap');

:root {
  /* Colors */
${colorVars}

  /* Neutral Colors */
${neutralVars}

  /* Typography */
  --font-heading: '${ds.typography.heading}', sans-serif;
  --font-body: '${ds.typography.body}', sans-serif;
  --font-mono: '${ds.typography.mono}', monospace;
${typographyVars}

  /* Font Weights */
${ds.typography.weights.map((w) => `  --font-weight-${w.name}: ${w.value};`).join("\n")}

  /* Spacing */
${spacingVars}

  /* Border Radius */
${radiusVars}

  /* Shadows */
${shadowVars}

  /* Gradients */
${gradientVars}

  /* Opacity */
${opacityVars}

  /* Z-Index */
${zIndexVars}

  /* Breakpoints */
${breakpointVars}

  /* Transitions */
${transitionVars}

  /* Borders */
${borderVars}

  /* Icon Sizes */
${iconVars}

  /* Grid */
${gridVars}
${a11yVars}
}`;
}

export function generateSCSS(ds: DesignSystemData): string {
  const colorVars = Object.entries(ds.colors)
    .map(([key, val]) => `$color-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${val};`)
    .join("\n");

  const typographyVars = ds.typography.scale
    .map((s) => `$font-size-${s.name}: ${s.size};\n$line-height-${s.name}: ${s.lineHeight};`)
    .join("\n");

  const spacingVars = ds.spacing.map((s) => `$space-${s.name}: ${s.value};`).join("\n");

  return `// ${ds.name} Design System (SCSS)

// Colors
${colorVars}

// Neutral Colors
${(ds.neutralColors || []).map((c) => `$color-${c.name.toLowerCase().replace(/\s+/g, "-")}: ${c.value};`).join("\n")}

// Typography
$font-heading: '${ds.typography.heading}', sans-serif;
$font-body: '${ds.typography.body}', sans-serif;
$font-mono: '${ds.typography.mono}', monospace;
${typographyVars}

// Spacing
${spacingVars}

// Border Radius
${ds.borderRadius.map((r) => `$radius-${r.name}: ${r.value};`).join("\n")}

// Shadows
${ds.shadows.map((s) => `$shadow-${s.name}: ${s.value};`).join("\n")}

// Gradients
${ds.gradients.map((g) => `$gradient-${g.name}: ${g.value};`).join("\n")}

// Opacity
${(ds.opacity || []).map((o) => `$opacity-${o.name}: ${o.value};`).join("\n")}

// Z-Index
${(ds.zIndex || []).map((z) => `$z-${z.name}: ${z.value};`).join("\n")}

// Breakpoints
${(ds.breakpoints || []).map((b) => `$breakpoint-${b.name}: ${b.value};`).join("\n")}

// Transitions
${(ds.transitions || []).map((t) => `$transition-${t.name}: ${t.duration} ${t.easing};`).join("\n")}

// Borders
${(ds.borders || []).map((b) => `$border-${b.name}: ${b.width} ${b.style} ${b.color};`).join("\n")}

// Icon Sizes
${(ds.iconSizes || []).map((ic) => `$icon-${ic.name}: ${ic.value};`).join("\n")}

// Grid
${ds.grid ? ["desktop", "tablet", "mobile"].map((d) => {
  const g = (ds.grid as any)[d];
  return g ? `$grid-${d}-columns: ${g.columns};\n$grid-${d}-gutter: ${g.gutter};\n$grid-${d}-margin: ${g.margin};` : "";
}).join("\n") : ""}

// Mixins
@mixin heading($size: '2xl') {
  font-family: $font-heading;
  font-size: var(--font-size-#{$size});
  line-height: var(--line-height-#{$size});
}

@mixin body-text($size: 'base') {
  font-family: $font-body;
  font-size: var(--font-size-#{$size});
  line-height: var(--line-height-#{$size});
}

@mixin respond-to($breakpoint) {
  @media (min-width: #{$breakpoint}) {
    @content;
  }
}

@mixin focus-ring {
  outline: ${ds.accessibility?.focusRingWidth || "2px"} solid ${ds.accessibility?.focusRingColor || "#2563EB"};
  outline-offset: 2px;
}`;
}

export function generateTailwindConfig(ds: DesignSystemData): string {
  const colorEntries = Object.entries(ds.colors)
    .map(([key, val]) => `        '${key.replace(/([A-Z])/g, "-$1").toLowerCase()}': '${val}',`)
    .join("\n");

  const neutralEntries = (ds.neutralColors || [])
    .map((c) => `        '${c.name.toLowerCase().replace(/\s+/g, "-")}': '${c.value}',`)
    .join("\n");

  return `// ${ds.name} - Tailwind Configuration
import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      colors: {
${colorEntries}
${neutralEntries}
      },
      fontFamily: {
        heading: ['${ds.typography.heading}', 'sans-serif'],
        body: ['${ds.typography.body}', 'sans-serif'],
        mono: ['${ds.typography.mono}', 'monospace'],
      },
      fontSize: {
${ds.typography.scale.map((s) => `        '${s.name}': ['${s.size}', { lineHeight: '${s.lineHeight}', letterSpacing: '${s.letterSpacing}' }],`).join("\n")}
      },
      spacing: {
${ds.spacing.map((s) => `        '${s.name}': '${s.value}',`).join("\n")}
      },
      borderRadius: {
${ds.borderRadius.map((r) => `        '${r.name}': '${r.value}',`).join("\n")}
      },
      boxShadow: {
${ds.shadows.map((s) => `        '${s.name}': '${s.value}',`).join("\n")}
      },
      opacity: {
${(ds.opacity || []).map((o) => `        '${o.name}': '${o.value}',`).join("\n")}
      },
      zIndex: {
${(ds.zIndex || []).map((z) => `        '${z.name}': '${z.value}',`).join("\n")}
      },
      screens: {
${(ds.breakpoints || []).map((b) => `        '${b.name}': '${b.value}',`).join("\n")}
      },
      transitionDuration: {
${(ds.transitions || []).map((t) => `        '${t.name}': '${t.duration}',`).join("\n")}
      },
      transitionTimingFunction: {
${(ds.transitions || []).map((t) => `        '${t.name}': '${t.easing}',`).join("\n")}
      },
      borderWidth: {
${(ds.borders || []).map((b) => `        '${b.name}': '${b.width}',`).join("\n")}
      },
    },
  },
} satisfies Config;`;
}

export function generateStyleDictionary(ds: DesignSystemData): string {
  const tokens: any = {
    color: {} as any,
    neutral: {} as any,
    size: { font: {} as any, spacing: {} as any, radius: {} as any, icon: {} as any },
    font: { family: {} as any, weight: {} as any },
    shadow: {} as any,
    opacity: {} as any,
    zIndex: {} as any,
    breakpoint: {} as any,
    transition: {} as any,
    border: {} as any,
    grid: {} as any,
  };

  Object.entries(ds.colors).forEach(([key, val]) => { tokens.color[key] = { value: val }; });
  (ds.neutralColors || []).forEach((c) => { tokens.neutral[c.name.toLowerCase().replace(/\s+/g, "-")] = { value: c.value }; });

  tokens.font.family.heading = { value: ds.typography.heading };
  tokens.font.family.body = { value: ds.typography.body };
  tokens.font.family.mono = { value: ds.typography.mono };

  ds.typography.weights.forEach((w) => { tokens.font.weight[w.name] = { value: w.value }; });
  ds.typography.scale.forEach((s) => { tokens.size.font[s.name] = { value: s.size }; });
  ds.spacing.forEach((s) => { tokens.size.spacing[s.name] = { value: s.value }; });
  ds.borderRadius.forEach((r) => { tokens.size.radius[r.name] = { value: r.value }; });
  ds.shadows.forEach((s) => { tokens.shadow[s.name] = { value: s.value }; });
  (ds.opacity || []).forEach((o) => { tokens.opacity[o.name] = { value: o.value }; });
  (ds.zIndex || []).forEach((z) => { tokens.zIndex[z.name] = { value: z.value }; });
  (ds.breakpoints || []).forEach((b) => { tokens.breakpoint[b.name] = { value: b.value }; });
  (ds.transitions || []).forEach((t) => { tokens.transition[t.name] = { value: { duration: t.duration, easing: t.easing } }; });
  (ds.borders || []).forEach((b) => { tokens.border[b.name] = { value: { width: b.width, style: b.style, color: b.color } }; });
  (ds.iconSizes || []).forEach((ic) => { tokens.size.icon[ic.name] = { value: ic.value }; });

  if (ds.grid) {
    ["desktop", "tablet", "mobile"].forEach((device) => {
      const g = (ds.grid as any)[device];
      if (g) tokens.grid[device] = { columns: { value: g.columns }, gutter: { value: g.gutter }, margin: { value: g.margin } };
    });
  }

  return JSON.stringify(tokens, null, 2);
}
