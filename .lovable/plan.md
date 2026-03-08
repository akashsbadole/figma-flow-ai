

## Problem

The "Copy for Figma" feature doesn't work because:

1. **Browsers don't support `image/svg+xml` in ClipboardItem** — Chrome/Edge only allow `text/plain`, `text/html`, and `image/png`. The `write()` call throws, falling through to the `writeText` fallback.
2. **Figma reads SVG from `text/html` clipboard**, not from `image/svg+xml`. When you paste `text/html` containing valid SVG, Figma converts it to editable vectors.

### Fix

Change the clipboard strategy to copy the SVG as **`text/html`** (which Figma reads) + **`text/plain`** (as fallback). Remove the unsupported `image/svg+xml` MIME type entirely.

### Files to change

**`src/components/generator/VariantCard.tsx`** — update `copyToFigma`:
```typescript
// Use text/html (Figma reads this) + text/plain fallback
const htmlBlob = new Blob([svgContent], { type: "text/html" });
const textBlob = new Blob([svgContent], { type: "text/plain" });
await navigator.clipboard.write([
  new ClipboardItem({ "text/html": htmlBlob, "text/plain": textBlob })
]);
```

**`src/components/generator/ExpandedPreview.tsx`** — same clipboard fix.

Both files: remove the `image/svg+xml` blob entirely since no browser supports it in the Clipboard API.

