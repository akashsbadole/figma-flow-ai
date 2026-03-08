import JSZip from "jszip";

/**
 * Convert raw HTML + CSS into a basic React functional component string.
 */
export function htmlCssToReactComponent(
  name: string,
  html: string,
  css: string
): string {
  // Sanitise component name to PascalCase
  const componentName = name
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

  // Convert class="" to className=""
  const reactHtml = html
    .replace(/\bclass="/g, 'className="')
    .replace(/\bfor="/g, 'htmlFor="')
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\btabindex="/g, 'tabIndex="');

  return `import React from "react";

const styles = \`
${css}
\`;

export default function ${componentName || "GeneratedComponent"}() {
  return (
    <>
      <style>{styles}</style>
      ${reactHtml}
    </>
  );
}
`;
}

interface ExportVariant {
  id: string;
  name: string;
  html: string;
  css: string;
  svg?: string;
}

/**
 * Bundle all variants into a ZIP with HTML, CSS, SVG, and React files.
 */
export async function exportVariantsAsZip(
  variants: ExportVariant[],
  projectName: string
): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder(projectName) || zip;

  variants.forEach((v) => {
    const slug = v.name.replace(/\s+/g, "-").toLowerCase();
    const dir = folder.folder(slug) || folder;

    // Full HTML page
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${v.name}</title>
<style>
${v.css}
</style>
</head>
<body>
${v.html}
</body>
</html>`;

    dir.file(`${slug}.html`, fullHtml);
    dir.file(`${slug}.css`, v.css);

    if (v.svg) {
      dir.file(`${slug}.svg`, v.svg);
    }

    // React component
    dir.file(`${slug}.tsx`, htmlCssToReactComponent(v.name, v.html, v.css));
  });

  return zip.generateAsync({ type: "blob" });
}
