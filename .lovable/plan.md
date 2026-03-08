

## Plan: SVG-based "Copy for Figma" with Editable Elements

### Problem
Current `copyToFigma` uses `html2canvas` which produces a flat PNG — just a rasterized screenshot. In Figma, this pastes as a single image layer that cannot be edited. The user wants editable vector content.

### Solution
Replace the PNG clipboard approach with an **SVG using `<foreignObject>`** that wraps the full HTML/CSS. When pasted into Figma, this preserves structure as editable objects rather than a flat bitmap.

Both `VariantCard.tsx` and `ExpandedPreview.tsx` will be updated.

### How it works

1. Build an SVG string with the design's dimensions containing:
   - A `<foreignObject>` element wrapping the HTML + inline `<style>` block
   - Proper XML namespace declarations so Figma recognizes it

2. Copy to clipboard as **both** `image/svg+xml` and `text/html` MIME types using `ClipboardItem` — Figma reads SVG from clipboard natively

3. Fallback: if the multi-MIME clipboard write fails, copy just the SVG as text

### Code structure (both files)

```typescript
const copyToFigma = async () => {
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <foreignObject width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml">
        <style>${css}</style>
        ${html}
      </div>
    </foreignObject>
  </svg>`;

  const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
  const htmlBlob = new Blob([svgString], { type: "text/html" });

  await navigator.clipboard.write([
    new ClipboardItem({
      "image/svg+xml": svgBlob,
      "text/html": htmlBlob,
    }),
  ]);
};
```

### Files changed
- `src/components/generator/VariantCard.tsx` — update `copyToFigma` function
- `src/components/generator/ExpandedPreview.tsx` — update `copyToFigma` function

### What stays the same
- "Copy Code" button still copies raw HTML
- Download buttons unchanged
- `html2canvas` import can be removed from both files since it's no longer needed

