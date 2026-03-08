import { DesignSystemData } from "@/pages/DesignSystemBuilder";

export function generateFigmaTokens(ds: DesignSystemData): string {
  const tokens: any = {
    global: {
      colors: {} as any,
      typography: {} as any,
      spacing: {} as any,
      borderRadius: {} as any,
      shadows: {} as any,
    },
  };

  // Colors
  Object.entries(ds.colors).forEach(([key, val]) => {
    tokens.global.colors[key] = { value: val, type: "color" };
  });

  // Typography
  ds.typography.scale.forEach((s) => {
    tokens.global.typography[s.name] = {
      value: {
        fontSize: s.size,
        lineHeight: s.lineHeight,
        letterSpacing: s.letterSpacing,
        fontFamily: ds.typography.heading,
      },
      type: "typography",
    };
  });

  // Spacing
  ds.spacing.forEach((s) => {
    tokens.global.spacing[s.name] = { value: s.value, type: "spacing" };
  });

  // Border radius
  ds.borderRadius.forEach((r) => {
    tokens.global.borderRadius[r.name] = { value: r.value, type: "borderRadius" };
  });

  // Shadows
  ds.shadows.forEach((s) => {
    tokens.global.shadows[s.name] = { value: s.value, type: "boxShadow" };
  });

  return JSON.stringify(tokens, null, 2);
}

export function generateCSS(ds: DesignSystemData): string {
  const colorVars = Object.entries(ds.colors)
    .map(([key, val]) => `  --color-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${val};`)
    .join("\n");

  const typographyVars = ds.typography.scale
    .map((s) => `  --font-size-${s.name}: ${s.size};\n  --line-height-${s.name}: ${s.lineHeight};\n  --letter-spacing-${s.name}: ${s.letterSpacing};`)
    .join("\n");

  const spacingVars = ds.spacing
    .map((s) => `  --space-${s.name}: ${s.value};`)
    .join("\n");

  const radiusVars = ds.borderRadius
    .map((r) => `  --radius-${r.name}: ${r.value};`)
    .join("\n");

  const shadowVars = ds.shadows
    .map((s) => `  --shadow-${s.name}: ${s.value};`)
    .join("\n");

  const gradientVars = ds.gradients
    .map((g) => `  --gradient-${g.name}: ${g.value};`)
    .join("\n");

  return `/* ${ds.name} Design System */
@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(ds.typography.heading)}:wght@300;400;500;600;700&family=${encodeURIComponent(ds.typography.body)}:wght@300;400;500;600;700&display=swap');

:root {
  /* Colors */
${colorVars}

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
}`;
}

export function generateSCSS(ds: DesignSystemData): string {
  const colorVars = Object.entries(ds.colors)
    .map(([key, val]) => `$color-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${val};`)
    .join("\n");

  const typographyVars = ds.typography.scale
    .map((s) => `$font-size-${s.name}: ${s.size};\n$line-height-${s.name}: ${s.lineHeight};`)
    .join("\n");

  const spacingVars = ds.spacing
    .map((s) => `$space-${s.name}: ${s.value};`)
    .join("\n");

  return `// ${ds.name} Design System (SCSS)

// Colors
${colorVars}

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
}`;
}

export function generateTailwindConfig(ds: DesignSystemData): string {
  const colorEntries = Object.entries(ds.colors)
    .map(([key, val]) => `        '${key.replace(/([A-Z])/g, "-$1").toLowerCase()}': '${val}',`)
    .join("\n");

  return `// ${ds.name} - Tailwind Configuration
import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      colors: {
${colorEntries}
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
    },
  },
} satisfies Config;`;
}

export function generateStyleDictionary(ds: DesignSystemData): string {
  const tokens: any = {
    color: {} as any,
    size: { font: {} as any, spacing: {} as any, radius: {} as any },
    font: { family: {} as any, weight: {} as any },
    shadow: {} as any,
  };

  Object.entries(ds.colors).forEach(([key, val]) => {
    tokens.color[key] = { value: val };
  });

  tokens.font.family.heading = { value: ds.typography.heading };
  tokens.font.family.body = { value: ds.typography.body };
  tokens.font.family.mono = { value: ds.typography.mono };

  ds.typography.weights.forEach((w) => {
    tokens.font.weight[w.name] = { value: w.value };
  });

  ds.typography.scale.forEach((s) => {
    tokens.size.font[s.name] = { value: s.size };
  });

  ds.spacing.forEach((s) => {
    tokens.size.spacing[s.name] = { value: s.value };
  });

  ds.borderRadius.forEach((r) => {
    tokens.size.radius[r.name] = { value: r.value };
  });

  ds.shadows.forEach((s) => {
    tokens.shadow[s.name] = { value: s.value };
  });

  return JSON.stringify(tokens, null, 2);
}
