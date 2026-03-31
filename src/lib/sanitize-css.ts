export function sanitizeCSS(css: string): string {
  const dangerous = [
    /@import/gi,
    /javascript:/gi,
    /expression\(/gi,
    /behavior:/gi,
    /-moz-binding/gi,
    /url\(['"]?https?:\/\//gi,
    /@font-face/gi,
  ];

  let sanitized = css;
  for (const pattern of dangerous) {
    sanitized = sanitized.replace(pattern, '/* removed */');
  }

  return sanitized;
}

export function sanitizeHTML(html: string): string {
  let sanitized = html;
  
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');
  sanitized = sanitized.replace(/on\w+='[^']*'/gi, '');
  
  sanitized = sanitized.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');
  
  sanitized = sanitized.replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '');
  sanitized = sanitized.replace(/<embed[^>]*>/gi, '');
  
  sanitized = sanitized.replace(/<form[^>]*>[\s\S]*?<\/form>/gi, '');
  
  return sanitized;
}

export function sanitizeSVG(svg: string): string {
  let sanitized = svg;
  
  sanitized = sanitized.replace(/<\?xml[^?]*\?>/g, '');
  
  sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, '');
  
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  sanitized = sanitized.replace(/<foreignObject\b[^<]*(?:(?!<\/foreignObject>)<[^<]*)*<\/foreignObject>/gi, '');
  
  sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');
  sanitized = sanitized.replace(/on\w+='[^']*'/gi, '');
  
  if (!sanitized.includes('xmlns=')) {
    sanitized = sanitized.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  
  return sanitized.trim();
}

export function validateSVGForFigma(svg: string): { valid: boolean; errors: string[]; warnings: string[] } {
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
