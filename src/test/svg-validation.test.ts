import { describe, it, expect } from "vitest";
import { validateSVGForFigma, cleanSVGForFigma } from "@/lib/figma-svg-export";

describe("SVG Validation", () => {
  it("should validate correct SVG", () => {
    const svg = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#000"/></svg>';
    const result = validateSVGForFigma(svg);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should reject SVG with foreignObject", () => {
    const svg = '<svg viewBox="0 0 100 100"><foreignObject><div>Bad</div></foreignObject></svg>';
    const result = validateSVGForFigma(svg);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Contains <foreignObject> - not supported in Figma");
  });

  it("should reject SVG without viewBox", () => {
    const svg = '<svg width="100" height="100"><rect width="100" height="100"/></svg>';
    const result = validateSVGForFigma(svg);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Missing viewBox attribute - required for Figma");
  });

  it("should reject SVG with script tags", () => {
    const svg = '<svg viewBox="0 0 100 100"><script>alert("bad")</script><rect width="100" height="100"/></svg>';
    const result = validateSVGForFigma(svg);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Contains <script> tag - not allowed");
  });

  it("should reject SVG with HTML tags", () => {
    const svg = '<svg viewBox="0 0 100 100"><html><body><div>Bad</div></body></html></svg>';
    const result = validateSVGForFigma(svg);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes("HTML tags"))).toBe(true);
  });

  it("should reject SVG with div tags", () => {
    const svg = '<svg viewBox="0 0 100 100"><div>Bad</div></svg>';
    const result = validateSVGForFigma(svg);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Contains <div> tag - use <g> or <rect> instead");
  });

  it("should reject SVG with style tags", () => {
    const svg = '<svg viewBox="0 0 100 100"><style>.test { color: red; }</style><rect width="100" height="100"/></svg>';
    const result = validateSVGForFigma(svg);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Contains <style> tag - use inline styles");
  });

  it("should warn about missing xmlns", () => {
    const svg = '<svg viewBox="0 0 100 100"><rect width="100" height="100"/></svg>';
    const result = validateSVGForFigma(svg);
    expect(result.valid).toBe(true);
    expect(result.warnings).toContain("Missing xmlns attribute - may cause issues");
  });

  it("should warn about percentage dimensions", () => {
    const svg = '<svg viewBox="0 0 100 100" width="100%" height="100%"><rect width="100" height="100"/></svg>';
    const result = validateSVGForFigma(svg);
    expect(result.warnings).toContain("Percentage dimensions found - use fixed viewBox instead");
  });

  it("should warn about text elements missing font-family", () => {
    const svg = '<svg viewBox="0 0 100 100"><text>Hello</text></svg>';
    const result = validateSVGForFigma(svg);
    expect(result.warnings.some(w => w.includes("missing font-family"))).toBe(true);
  });

  it("should warn about text elements missing font-size", () => {
    const svg = '<svg viewBox="0 0 100 100"><text font-family="Arial">Hello</text></svg>';
    const result = validateSVGForFigma(svg);
    expect(result.warnings.some(w => w.includes("missing font-size"))).toBe(true);
  });

  it("should validate SVG with proper text elements", () => {
    const svg = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><text x="50" y="50" font-family="Arial" font-size="16" fill="#000">Hello</text></svg>';
    const result = validateSVGForFigma(svg);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});

describe("SVG Cleaning", () => {
  it("should remove XML declaration", () => {
    const svg = '<?xml version="1.0"?><svg viewBox="0 0 100 100"><rect/></svg>';
    const cleaned = cleanSVGForFigma(svg);
    expect(cleaned).not.toContain("<?xml");
  });

  it("should remove XML declaration with attributes", () => {
    const svg = '<?xml version="1.0" encoding="UTF-8"?><svg viewBox="0 0 100 100"><rect/></svg>';
    const cleaned = cleanSVGForFigma(svg);
    expect(cleaned).not.toContain("<?xml");
  });

  it("should add xmlns if missing", () => {
    const svg = '<svg viewBox="0 0 100 100"><rect/></svg>';
    const cleaned = cleanSVGForFigma(svg);
    expect(cleaned).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it("should not duplicate xmlns if already present", () => {
    const svg = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect/></svg>';
    const cleaned = cleanSVGForFigma(svg);
    expect(cleaned.match(/xmlns=/g)).toHaveLength(1);
  });

  it("should remove comments", () => {
    const svg = '<svg viewBox="0 0 100 100"><!-- Comment --><rect/></svg>';
    const cleaned = cleanSVGForFigma(svg);
    expect(cleaned).not.toContain("<!-- Comment -->");
  });

  it("should remove multi-line comments", () => {
    const svg = '<svg viewBox="0 0 100 100"><!-- Multi\nline\ncomment --><rect/></svg>';
    const cleaned = cleanSVGForFigma(svg);
    expect(cleaned).not.toContain("<!--");
    expect(cleaned).not.toContain("-->");
  });

  it("should remove script tags", () => {
    const svg = '<svg viewBox="0 0 100 100"><script>alert("bad")</script><rect/></svg>';
    const cleaned = cleanSVGForFigma(svg);
    expect(cleaned).not.toContain("<script>");
    expect(cleaned).not.toContain("</script>");
  });

  it("should remove foreignObject tags", () => {
    const svg = '<svg viewBox="0 0 100 100"><foreignObject><div>Bad</div></foreignObject><rect/></svg>';
    const cleaned = cleanSVGForFigma(svg);
    expect(cleaned).not.toContain("foreignObject");
  });

  it("should normalize whitespace", () => {
    const svg = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">  <rect/>   <rect/>  </svg>';
    const cleaned = cleanSVGForFigma(svg);
    expect(cleaned).toBe('<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"> <rect/> <rect/> </svg>');
  });

  it("should trim the output", () => {
    const svg = '   <svg viewBox="0 0 100 100"><rect/></svg>   ';
    const cleaned = cleanSVGForFigma(svg);
    expect(cleaned).not.toMatch(/^\s+|\s+$/);
  });

  it("should preserve valid SVG elements", () => {
    const svg = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="80" height="80" rx="8" fill="#3B82F6"/><circle cx="50" cy="50" r="20" fill="#EF4444"/><text x="50" y="50" font-family="Arial" font-size="14" fill="#000">Hello</text><g id="group"><path d="M10,10 L90,90" stroke="#000"/></g></svg>';
    const cleaned = cleanSVGForFigma(svg);
    expect(cleaned).toContain("<rect");
    expect(cleaned).toContain("<circle");
    expect(cleaned).toContain("<text");
    expect(cleaned).toContain("<g");
    expect(cleaned).toContain("<path");
  });
});
