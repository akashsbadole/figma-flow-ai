export interface SVGValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DesignVariant {
  id: string;
  name: string;
  html: string;
  css: string;
  svg?: string;
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
  svg = svg.replace(/<\?xml[^?]*\?>/g, '');
  svg = svg.replace(/<!--[\s\S]*?-->/g, '');

  if (!svg.includes('xmlns=')) {
    svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  svg = svg.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  svg = svg.replace(/<foreignObject\b[^<]*(?:(?!<\/foreignObject>)<[^<]*)*<\/foreignObject>/gi, '');
  svg = svg.replace(/\s+/g, ' ').trim();

  return svg;
}

export async function copySVGToClipboard(svg: string): Promise<boolean> {
  try {
    const validation = validateSVGForFigma(svg);
    if (!validation.valid) {
      console.error('SVG validation failed:', validation.errors);
    }

    const cleaned = cleanSVGForFigma(svg);

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
    try {
      await navigator.clipboard.writeText(svg);
      return true;
    } catch (fallbackError) {
      return false;
    }
  }
}

export function generateVariantSVG(
  variant: DesignVariant,
  deviceWidth: number,
  deviceHeight: number
): string {
  const escapedCSS = variant.css
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${deviceWidth} ${deviceHeight}" width="${deviceWidth}" height="${deviceHeight}">
  <style><![CDATA[${variant.css}]]></style>
  <foreignObject width="${deviceWidth}" height="${deviceHeight}">
    <div xmlns="http://www.w3.org/1999/xhtml">
      ${variant.html}
    </div>
  </foreignObject>
</svg>`;
}

export function generatePureSVG(
  html: string,
  css: string,
  width: number,
  height: number
): string {
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <style><![CDATA[${css}]]></style>
  </defs>
`;

  const bodyContent = html
    .replace(/<\/?div[^>]*>/g, '')
    .replace(/<\/?span[^>]*>/g, '')
    .replace(/<\/?p[^>]*>/g, '\n')
    .replace(/<\/?br\s*\/?>/gi, '\n')
    .trim();

  svg += `  <rect width="${width}" height="${height}" fill="#ffffff"/>
  <foreignObject width="${width}" height="${height}">
    <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;font-family:system-ui,sans-serif;">
      ${bodyContent}
    </div>
  </foreignObject>
</svg>`;

  return svg;
}

export async function copyVariantToFigma(
  variant: DesignVariant,
  deviceWidth: number,
  deviceHeight: number,
  toast: (opts: { title: string; description?: string; variant?: string }) => void
): Promise<void> {
  try {
    let svgToCopy = variant.svg;

    if (!svgToCopy) {
      svgToCopy = generateVariantSVG(variant, deviceWidth, deviceHeight);
    }

    const validation = validateSVGForFigma(svgToCopy);

    if (!validation.valid) {
      toast({
        title: "SVG validation failed",
        description: validation.errors.join(', '),
        variant: "destructive",
      });
      return;
    }

    const success = await copySVGToClipboard(svgToCopy);

    if (success) {
      toast({
        title: "Copied to clipboard!",
        description: validation.warnings.length > 0
          ? `Warnings: ${validation.warnings.join(', ')}`
          : "Paste directly in Figma (Ctrl/Cmd+V)",
      });
    } else {
      toast({
        title: "Copy failed",
        description: "Please try again or download as SVG file",
        variant: "destructive",
      });
    }
  } catch (error) {
    toast({
      title: "Copy failed",
      description: error instanceof Error ? error.message : "Unknown error",
      variant: "destructive",
    });
  }
}

export function downloadSVG(svg: string, filename: string): void {
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadVariantsAsSVG(variants: DesignVariant[]): void {
  variants.forEach((variant, index) => {
    const svg = variant.svg || generatePureSVG(variant.html, variant.css, 390, 844);
    const filename = variant.name
      ? variant.name.replace(/\s+/g, '-').toLowerCase()
      : `variant-${index + 1}`;
    downloadSVG(svg, `${filename}.svg`);
  });
}
