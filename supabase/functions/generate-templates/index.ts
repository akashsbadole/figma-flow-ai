import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, deviceType = "mobile" } = await req.json();
    if (!prompt) throw new Error("Prompt is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const deviceDimensions: Record<string, { width: number; height: number; label: string }> = {
      mobile: { width: 390, height: 844, label: "iPhone 15 Pro" },
      tablet: { width: 820, height: 1180, label: "iPad Air" },
      desktop: { width: 1440, height: 900, label: "Desktop" },
    };
    const device = deviceDimensions[deviceType] || deviceDimensions.mobile;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert UI designer. Generate a comprehensive template collection based on the user's prompt.

Generate FIVE categories of templates:

1. PAGE LAYOUTS (4 templates): Full page designs — Landing/Hero, Dashboard, Settings/Profile, Detail/Content page. Each must fill ${device.width}x${device.height}px.

2. FORM PATTERNS (3 templates): Login/Signup form, Contact/Feedback form, Multi-step wizard form. Show complete, styled, realistic forms with labels, inputs, buttons, and validation states.

3. DATA DISPLAY (3 templates): Data table with sorting headers, Card grid/list view, Detail/Stats view with charts or metrics.

4. NAVIGATION PATTERNS (3 templates): Top navbar with dropdowns, Sidebar navigation, Bottom tab bar (mobile) or breadcrumb bar (desktop).

5. REUSABLE COMPONENTS (4 templates): Modal/Dialog, Toast/Notification, Empty state, Loading skeleton.

Each template must have its own HTML and CSS. Viewport: ${device.width}x${device.height}px (${device.label})

Return ONLY valid JSON:
{
  "pageLayouts": [
    { "name": "Template Name", "category": "landing|dashboard|settings|detail", "html": "<html>", "css": "<css>" }
  ],
  "formPatterns": [
    { "name": "Form Name", "category": "auth|contact|wizard", "html": "<html>", "css": "<css>" }
  ],
  "dataDisplay": [
    { "name": "Display Name", "category": "table|cards|stats", "html": "<html>", "css": "<css>" }
  ],
  "navigationPatterns": [
    { "name": "Nav Name", "category": "topnav|sidebar|bottomtab", "html": "<html>", "css": "<css>" }
  ],
  "components": [
    { "name": "Component Name", "category": "modal|toast|empty|skeleton", "html": "<html>", "css": "<css>" }
  ]
}

RULES:
- Page layouts should be complete self-contained pages filling ${device.width}x${device.height}px
- Form patterns should be centered on a ${device.width}x${device.height}px container
- Data display should fill ${device.width}x${device.height}px
- Navigation patterns: show the nav element on a ${device.width}x400px container
- Components: show centered on a ${device.width}x400px container
- Use consistent colors, fonts, and spacing across ALL templates
- Make them visually polished and production-ready
- Add realistic placeholder content (names, dates, stats, etc.)
- Do not include markdown, explanation, or code fences. Just the JSON.`,
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI error:", errText);
      throw new Error("AI generation failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      parsed = JSON.parse(jsonMatch[1].trim());
    } catch {
      throw new Error("Failed to parse AI response");
    }

    const addIds = (items: any[], fallbackCategory: string) =>
      (items || []).map((s: any, i: number) => ({
        id: crypto.randomUUID(),
        name: s.name || `Item ${i + 1}`,
        category: s.category || fallbackCategory,
        html: s.html || "",
        css: s.css || "",
      }));

    // Support both old format (screens/components) and new format
    const pageLayouts = addIds(parsed.pageLayouts || parsed.screens || [], "page");
    const formPatterns = addIds(parsed.formPatterns || [], "form");
    const dataDisplay = addIds(parsed.dataDisplay || [], "data");
    const navigationPatterns = addIds(parsed.navigationPatterns || [], "nav");
    const components = addIds(parsed.components || [], "component");

    return new Response(
      JSON.stringify({
        // New expanded format
        pageLayouts,
        formPatterns,
        dataDisplay,
        navigationPatterns,
        components,
        // Legacy compatibility
        screens: pageLayouts,
        deviceType,
        deviceWidth: device.width,
        deviceHeight: device.height,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-templates error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
