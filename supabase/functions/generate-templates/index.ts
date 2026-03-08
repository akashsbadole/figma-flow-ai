import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: claims, error: authError } = await sb.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (authError || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

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
            content: `You are an expert UI designer. Generate a template collection based on the user's prompt.

Generate templates in these categories (keep each template's HTML/CSS concise):

1. PAGE LAYOUTS (2 templates): Landing page and Dashboard. Each fills ${device.width}x${device.height}px.
2. FORM PATTERNS (2 templates): Login form and Contact form.
3. DATA DISPLAY (2 templates): Data table and Card grid.
4. NAVIGATION PATTERNS (2 templates): Top navbar and Sidebar nav.
5. REUSABLE COMPONENTS (2 templates): Modal dialog and Toast notification.

Viewport: ${device.width}x${device.height}px (${device.label})

Return ONLY valid JSON (no markdown, no code fences):
{
  "pageLayouts": [{ "name": "string", "category": "string", "html": "string", "css": "string" }],
  "formPatterns": [{ "name": "string", "category": "string", "html": "string", "css": "string" }],
  "dataDisplay": [{ "name": "string", "category": "string", "html": "string", "css": "string" }],
  "navigationPatterns": [{ "name": "string", "category": "string", "html": "string", "css": "string" }],
  "components": [{ "name": "string", "category": "string", "html": "string", "css": "string" }]
}

RULES:
- Keep HTML/CSS minimal but polished — no external dependencies
- Use consistent colors and typography matching the user's prompt
- Add realistic placeholder content
- Do NOT wrap in markdown code fences`,
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 8192,
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
      // Clean markdown fences if present
      let cleaned = content
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

      // Find JSON boundaries
      const jsonStart = cleaned.indexOf("{");
      const jsonEnd = cleaned.lastIndexOf("}");
      if (jsonStart === -1 || jsonEnd === -1) throw new Error("No JSON found");
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);

      try {
        parsed = JSON.parse(cleaned);
      } catch {
        // Fix trailing commas and control chars
        cleaned = cleaned
          .replace(/,\s*}/g, "}")
          .replace(/,\s*]/g, "]")
          .replace(/[\x00-\x1F\x7F]/g, " ");
        parsed = JSON.parse(cleaned);
      }
    } catch (parseErr) {
      console.error("Parse error. Content preview:", content.substring(0, 500));
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
