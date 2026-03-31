# Figma Integration Guide

**Purpose:** Complete guide for SVG generation and Figma paste workflow  
**Last Updated:** March 19, 2026

---

## Implementation Status ✅

All features implemented and tested.

| Feature | Status | File |
|---------|--------|------|
| SVG Validation Function | ✅ Implemented & Tested | `src/lib/figma-svg-export.ts` |
| Clean SVG Function | ✅ Implemented & Tested | `src/lib/figma-svg-export.ts` |
| Copy to Clipboard | ✅ Implemented | `src/lib/figma-svg-export.ts` |
| CSS/HTML Sanitization | ✅ Implemented & Tested | `src/lib/sanitize-css.ts` |
| SVG Validation Tests | ✅ 23 tests passing | `src/test/svg-validation.test.ts` |
| VariantCard Integration | ✅ Implemented | `src/components/generator/VariantCard.tsx` |

---

## 🎯 Overview

This guide explains how the AI Design Studio generates SVG designs that can be pasted directly into Figma as editable vector objects.

---

## 🔧 How It Works

### 1. SVG Generation Flow

```
User Prompt → AI Model → HTML/CSS + SVG → Validation → Copy to Clipboard → Paste in Figma
```

**Key Requirements:**
- SVG must use native elements only (no `<foreignObject>`)
- Must include `viewBox` attribute
- All text must use `<text>` elements
- All shapes must use `<rect>`, `<circle>`, `<path>`, etc.
- No embedded HTML or scripts

---

## 📝 SVG Structure

### Valid SVG Example

```xml
<svg viewBox="0 0 390 844" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="390" height="844" fill="#F3F4F6"/>
  
  <!-- Card -->
  <g id="card">
    <rect x="20" y="100" width="350" height="200" rx="12" fill="#FFFFFF"/>
    <text x="40" y="140" font-family="Arial" font-size="24" font-weight="700" fill="#111827">
      Welcome
    </text>
    <text x="40" y="170" font-family="Arial" font-size="16" fill="#6B7280">
      This is a card component
    </text>
  </g>
  
  <!-- Button -->
  <g id="button">
    <rect x="40" y="250" width="120" height="44" rx="8" fill="#3B82F6"/>
    <text x="100" y="277" font-family="Arial" font-size="16" font-weight="600" 
          fill="#FFFFFF" text-anchor="middle">
      Click Me
    </text>
  </g>
</svg>
```

### Invalid SVG (Won't Work in Figma)

```xml
<!-- ❌ BAD: Uses foreignObject -->
<svg viewBox="0 0 390 844">
  <foreignObject width="390" height="844">
    <div xmlns="http://www.w3.org/1999/xhtml">
      <h1>This won't work</h1>
    </div>
  </foreignObject>
</svg>

<!-- ❌ BAD: Missing viewBox -->
<svg width="390" height="844">
  <rect width="390" height="844" fill="#FFF"/>
</svg>

<!-- ❌ BAD: Has script tags -->
<svg viewBox="0 0 390 844">
  <script>alert('bad')</script>
  <rect width="390" height="844" fill="#FFF"/>
</svg>
```

---

## 🛠️ Implementation Details

### AI Prompt for SVG Generation

**File:** `supabase/functions/generate-design/index.ts`

```typescript
const systemPrompt = `You are an expert UI designer creating ${variantCount} different design variants.

For each variant, generate:
1. Clean, modern HTML and CSS for a complete self-contained screen
2. A native SVG version using pure SVG elements (rect, text, circle, path, g, etc.) — NO foreignObject, NO embedded HTML

IMPORTANT SVG RULES:
- The SVG must be a complete standalone SVG with viewBox="0 0 ${device.width} ${device.height}"
- Use native SVG elements only: <text>, <rect>, <circle>, <line>, <path>, <g>, <linearGradient>
- The SVG should visually match the HTML version as closely as possible
- Use <text> for all text content with proper font-family, font-size, font-weight
- Use <rect> for boxes/cards/buttons with rx/ry for rounded corners
- Use <g> to group related elements
- Use <linearGradient> or <radialGradient> for gradients
- All colors should be hex codes
- Text positioning: use x, y attributes and text-anchor for alignment`;
```

---

## 🎨 SVG Element Mapping

### HTML/CSS → SVG Translation

| HTML/CSS | SVG Equivalent |
|----------|----------------|
| `<div>` with background | `<rect fill="..."/>` |
| `<h1>`, `<p>`, text | `<text>` with font attributes |
| `border-radius` | `<rect rx="..." ry="..."/>` |
| `box-shadow` | `<filter>` with `<feDropShadow>` |
| `linear-gradient` | `<linearGradient>` + `<rect fill="url(#grad)"/>` |
| `<img>` | `<image href="..."/>` or `<circle>` placeholder |
| `<button>` | `<g>` with `<rect>` + `<text>` |
| Container div | `<g id="container">` |

---

## 🔍 SVG Validation

### Validation Function

**File:** `src/lib/figma-svg-export.ts`

```typescript
export interface SVGValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateSVGForFigma(svg: string): SVGValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for forbidden elements
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
  
  // Check for required attributes
  if (!svg.includes('viewBox')) {
    errors.push('Missing viewBox attribute - required for Figma');
  }
  
  if (!svg.includes('xmlns')) {
    warnings.push('Missing xmlns attribute - may cause issues');
  }
  
  // Check for common issues
  if (svg.includes('width="100%"') || svg.includes('height="100%"')) {
    warnings.push('Percentage dimensions found - use fixed viewBox instead');
  }
  
  // Check text elements
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
```

---

## 📋 Copy to Clipboard Implementation

### Multi-Format Clipboard

**File:** `src/lib/figma-svg-export.ts`

```typescript
export async function copySVGToClipboard(svg: string): Promise<boolean> {
  try {
    // Validate first
    const validation = validateSVGForFigma(svg);
    if (!validation.valid) {
      console.error('SVG validation failed:', validation.errors);
      throw new Error(validation.errors.join(', '));
    }
    
    // Clean the SVG
    const cleaned = cleanSVGForFigma(svg);
    
    // Try modern Clipboard API with multiple formats
    const svgBlob = new Blob([cleaned], { type: 'image/svg+xml' });
    const textBlob = new Blob([cleaned], { type: 'text/plain' });
    const htmlBlob = new Blob([cleaned], { type: 'text/html' });
    
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/svg+xml': svgBlob,
        'text/html': htmlBlob,
        'text/plain': textBlob,
      })
    ]);
    
    return true;
  } catch (error) {
    console.error('Clipboard API failed, trying fallback:', error);
    
    // Fallback: copy as plain text
    try {
      await navigator.clipboard.writeText(svg);
      return true;
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError);
      return false;
    }
  }
}

export function cleanSVGForFigma(svg: string): string {
  // Remove XML declaration
  svg = svg.replace(/<\?xml[^?]*\?>/g, '');
  
  // Remove comments
  svg = svg.replace(/<!--[\s\S]*?-->/g, '');
  
  // Ensure xmlns is present
  if (!svg.includes('xmlns=')) {
    svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  
  // Remove any script tags (safety)
  svg = svg.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove foreignObject
  svg = svg.replace(/<foreignObject\b[^<]*(?:(?!<\/foreignObject>)<[^<]*)*<\/foreignObject>/gi, '');
  
  // Normalize whitespace
  svg = svg.replace(/\s+/g, ' ').trim();
  
  return svg;
}
```

---

## 🎯 User Workflow

### Step-by-Step Process

**1. Generate Design**
```
User enters prompt → AI generates HTML/CSS + SVG → Display in UI
```

**2. Copy to Figma**
```typescript
// In VariantCard.tsx
const handleCopyToFigma = async () => {
  if (!variant.svg) {
    toast({
      title: "No SVG available",
      description: "This variant doesn't have an SVG version",
      variant: "destructive",
    });
    return;
  }
  
  const success = await copySVGToClipboard(variant.svg);
  
  if (success) {
    toast({
      title: "Copied to clipboard! 🎨",
      description: "Open Figma and paste (Cmd/Ctrl + V)",
    });
  } else {
    toast({
      title: "Copy failed",
      description: "Please try again or download as SVG file",
      variant: "destructive",
    });
  }
};
```

**3. Paste in Figma**
```
1. Open Figma
2. Select a frame or canvas
3. Press Cmd+V (Mac) or Ctrl+V (Windows)
4. SVG appears as editable vector layers
```

---

## 🐛 Common Issues & Solutions

### Issue 1: SVG Not Pasting in Figma

**Symptoms:**
- Nothing happens when pasting
- Figma shows error message
- Only text is pasted

**Solutions:**
```typescript
// Check validation
const validation = validateSVGForFigma(svg);
console.log('Validation:', validation);

// If errors, regenerate with stricter prompt
// Ensure AI knows to avoid foreignObject
```

### Issue 2: Text Not Editable in Figma

**Cause:** Text not using `<text>` elements

**Fix:**
```xml
<!-- ❌ Wrong -->
<foreignObject>
  <div>Text here</div>
</foreignObject>

<!-- ✅ Correct -->
<text x="10" y="20" font-family="Arial" font-size="16" fill="#000">
  Text here
</text>
```

### Issue 3: Gradients Not Showing

**Cause:** Gradient not defined or referenced incorrectly

**Fix:**
```xml
<svg viewBox="0 0 390 844">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <rect width="390" height="844" fill="url(#grad1)"/>
</svg>
```

### Issue 4: Layout Broken in Figma

**Cause:** Missing viewBox or incorrect dimensions

**Fix:**
```xml
<!-- ❌ Wrong -->
<svg width="390" height="844">

<!-- ✅ Correct -->
<svg viewBox="0 0 390 844" width="390" height="844">
```

---

## 🧪 Testing SVG Output

### Manual Test

```typescript
// Test in browser console
const svg = `<svg viewBox="0 0 390 844" xmlns="http://www.w3.org/2000/svg">
  <rect width="390" height="844" fill="#F3F4F6"/>
  <text x="195" y="422" font-family="Arial" font-size="24" fill="#000" text-anchor="middle">
    Test
  </text>
</svg>`;

// Validate
const validation = validateSVGForFigma(svg);
console.log(validation);

// Copy
await copySVGToClipboard(svg);

// Then paste in Figma
```

### Automated Test

**File:** `src/test/svg-validation.test.ts` ✅

Contains 23 test cases covering:
- SVG validation (forbidden elements, viewBox, xmlns, text attributes)
- SVG cleaning (XML declarations, comments, scripts, whitespace)

**Run tests:**
```bash
npm test -- src/test/svg-validation.test.ts
```

---

## 📚 Best Practices

### For AI Prompts

1. **Always specify SVG requirements explicitly**
   ```
   "Generate native SVG using only <rect>, <text>, <circle>, <path>, <g> elements"
   ```

2. **Emphasize no foreignObject**
   ```
   "NO foreignObject, NO embedded HTML, pure SVG only"
   ```

3. **Request proper text elements**
   ```
   "Use <text> elements with font-family, font-size, and fill attributes"
   ```

### For Code

1. **Always validate before copying**
2. **Provide clear error messages**
3. **Offer fallback options (download as file)**
4. **Log validation results for debugging**

### For Users

1. **Show preview of SVG before copying**
2. **Provide instructions for Figma paste**
3. **Offer alternative: download as .svg file**
4. **Show validation warnings if any**

---

## 🔗 Resources

- [Figma SVG Import Documentation](https://help.figma.com/hc/en-us/articles/360040028034)
- [MDN SVG Reference](https://developer.mozilla.org/en-US/docs/Web/SVG)
- [SVG Specification](https://www.w3.org/TR/SVG2/)

---

**Last Updated:** March 19, 2026
