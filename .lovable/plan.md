

## Add "Download SVG" Button

### About Testing
I cannot test the Figma paste externally — that requires pasting into the actual Figma desktop app. The clipboard logic is already implemented correctly using `text/html` + `text/plain` MIME types. You should test this yourself by: generating a design, clicking the Copy for Figma button, then pasting (Ctrl+V / Cmd+V) into a Figma canvas.

### Download SVG Button

Add a `downloadSvg` function and button in both files:

**`src/components/generator/ExpandedPreview.tsx`**
- Add `FileDown` icon import from lucide-react
- Add `downloadSvg` function (same pattern as `downloadHtml`/`downloadCss` but uses `variant.svg` content with `.svg` extension and `image/svg+xml` MIME type)
- Add a new button between the CSS and close buttons: `<Button variant="outline" size="sm" onClick={downloadSvg}><FileDown /> SVG</Button>`
- Disable button if `variant.svg` is not available

**`src/components/generator/VariantCard.tsx`**
- Add `FileDown` icon import
- Add `downloadSvg` function
- Add a new icon button in the hover actions bar (between Copy Code and Expand buttons)

