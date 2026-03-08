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
            content: `You are an expert UI designer. Generate template designs based on the user's prompt.

Generate TWO categories of templates:

1. SCREEN TEMPLATES (3 screens): Full page layouts like Login, Dashboard, Settings, Profile, etc. that match the design brief.
2. COMPONENT TEMPLATES (4 components): Reusable UI components like Navbar, Card, Form, Modal, Table, Footer, Sidebar, etc.

Each template must have its own HTML and CSS. The CSS should use modern design: gradients, shadows, rounded corners, good typography.

Viewport: ${device.width}x${device.height}px (${device.label})

Return ONLY valid JSON:
{
  "screens": [
    { "name": "Screen Name", "category": "screen type", "html": "<html>", "css": "<css>" }
  ],
  "components": [
    { "name": "Component Name", "category": "component type", "html": "<html>", "css": "<css>" }
  ]
}

RULES:
- Screen HTML should be a complete self-contained page filling ${device.width}x${device.height}px
- Component HTML should show the component centered on a ${device.width}x400px container
- Use consistent colors, fonts, and spacing across all templates
- Make them visually polished and production-ready
- Add realistic placeholder content
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

    const screens = (parsed.screens || []).map((s: any, i: number) => ({
      id: crypto.randomUUID(),
      name: s.name || `Screen ${i + 1}`,
      category: s.category || "screen",
      html: s.html || "",
      css: s.css || "",
    }));

    const components = (parsed.components || []).map((c: any, i: number) => ({
      id: crypto.randomUUID(),
      name: c.name || `Component ${i + 1}`,
      category: c.category || "component",
      html: c.html || "",
      css: c.css || "",
    }));

    return new Response(
      JSON.stringify({ screens, components, deviceType, deviceWidth: device.width, deviceHeight: device.height }),
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
