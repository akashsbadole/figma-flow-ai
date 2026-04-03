import { parse } from 'node-html-parser';

/**
 * Cleans SVG code for Figma compatibility
 * Removes scripts, foreignObjects, and other unsupported tags
 */
export function cleanSVGForFigma(svgCode) {
  if (!svgCode) return '';

  // Basic string cleaning
  let clean = svgCode.trim();

  // Remove scripts
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove foreignObjects
  clean = clean.replace(/<foreignObject\b[^<]*(?:(?!<\/foreignObject>)<[^<]*)*<\/foreignObject>/gi, '');

  // Ensure xmlns is present
  if (!clean.includes('xmlns="http://www.w3.org/2000/svg"')) {
    clean = clean.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  return clean;
}

/**
 * Processes SVG to add frame boundaries and metadata
 */
export function processSVG(svgCode, name = 'Design Variant') {
  const clean = cleanSVGForFigma(svgCode);
  const root = parse(clean);
  const svg = root.querySelector('svg');

  if (!svg) return clean;

  const width = svg.getAttribute('width') || '100%';
  const height = svg.getAttribute('height') || '100%';
  const viewBox = svg.getAttribute('viewBox');

  let vbWidth = width;
  let vbHeight = height;

  if (viewBox) {
    const parts = viewBox.split(/\s+/);
    if (parts.length === 4) {
      vbWidth = parts[2];
      vbHeight = parts[3];
    }
  }

  // Add a background rect to act as a frame in Figma
  const frameRect = `<rect id="Frame-Boundary" width="${vbWidth}" height="${vbHeight}" fill="none" pointer-events="none" />`;

  // Wrap existing content in a group
  const originalContent = svg.innerHTML;
  svg.set_content(`
    <g id="${name.replace(/\s+/g, '-')}">
      ${frameRect}
      ${originalContent}
    </g>
  `);

  return root.toString();
}

/**
 * Extracts design tokens from SVG (colors, fonts)
 */
export function extractTokensFromSVG(svgCode) {
  const tokens = {
    colors: new Set(),
    fonts: new Set(),
    fontSizes: new Set()
  };

  // Simple regex-based extraction
  const hexColors = svgCode.match(/#[a-fA-F0-9]{3,6}/g) || [];
  hexColors.forEach(c => tokens.colors.add(c.toUpperCase()));

  const rgbColors = svgCode.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/g) || [];
  rgbColors.forEach(c => tokens.colors.add(c));

  const fonts = svgCode.match(/font-family="([^"]+)"/g) || [];
  fonts.forEach(f => tokens.fonts.add(f.replace('font-family=', '').replace(/"/g, '')));

  const fontSizes = svgCode.match(/font-size="([^"]+)"/g) || [];
  fontSizes.forEach(s => tokens.fontSizes.add(s.replace('font-size=', '').replace(/"/g, '')));

  return {
    colors: Array.from(tokens.colors),
    fonts: Array.from(tokens.fonts),
    fontSizes: Array.from(tokens.fontSizes)
  };
}
