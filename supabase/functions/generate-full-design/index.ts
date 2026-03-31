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
    const { data: { user }, error: authError } = await sb.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { prompt, deviceType = "mobile", variantCount = 4, referenceImage } = await req.json();
    if (!prompt) throw new Error("Prompt is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const deviceDimensions = {
      mobile: { width: 390, height: 844, label: "iPhone 15 Pro" },
      tablet: { width: 820, height: 1180, label: "iPad Air" },
      desktop: { width: 1440, height: 900, label: "Desktop" },
    };
    const device = deviceDimensions[deviceType as keyof typeof deviceDimensions] || deviceDimensions.mobile;

    const tokenArrayItem = (fields: Record<string, any>) => ({
      type: "object" as const,
      properties: fields,
      required: Object.keys(fields),
      additionalProperties: false,
    });

    // Build messages
    const messages: any[] = [
      {
        role: "system",
        content: `You are an expert UI/UX designer and architect. Generate a complete design package.

        1. VARIANTS: Generate ${variantCount} distinct design variants for a ${device.label} (${device.width}x${device.height}px).
        - Each needs HTML, CSS, and a native FIGMA-COMPATIBLE SVG (no foreignObject).
        - The SVG must use ONLY native SVG elements: <rect>, <text>, <circle>, <path>, <g>, <defs>, <linearGradient>, etc.
        - The SVG is for direct pasting into Figma. Use absolute positioning and pixel values.

        2. DESIGN SYSTEM: Create a production-ready system with tokens for colors (light/dark), typography, spacing, and 12 base components.

        3. TEMPLATES: Create a collection of page layouts, forms, data displays, and navigation patterns.

        Maintain visual consistency across all parts based on the user's prompt.`,
      }
    ];

    if (referenceImage) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: referenceImage } },
        ],
      });
    } else {
      messages.push({ role: "user", content: prompt });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-1.5-flash",
        tools: [
          {
            type: "function",
            function: {
              name: "generate_complete_design_package",
              description: "Generate design variants, a comprehensive design system, and a template collection in one request.",
              parameters: {
                type: "object",
                properties: {
                  variants: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        html: { type: "string" },
                        css: { type: "string" },
                        svg: { type: "string", description: "Native SVG version for Figma. NO foreignObject. Include viewBox." },
                      },
                      required: ["name", "html", "css", "svg"],
                      additionalProperties: false,
                    },
                  },
                  designSystem: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      colors: { type: "object" },
                      darkModeColors: { type: "object" },
                      typography: { type: "object" },
                      spacing: { type: "array" },
                      borderRadius: { type: "array" },
                      shadows: { type: "array" },
                      gradients: { type: "array" },
                      breakpoints: { type: "array" },
                      opacity: { type: "array" },
                      zIndex: { type: "array" },
                      transitions: { type: "array" },
                      borders: { type: "array" },
                      iconSystem: { type: "object" },
                      motionTokens: { type: "object" },
                      components: { type: "object" },
                    },
                    required: ["name", "colors", "typography", "components"],
                  },
                  templates: {
                    type: "object",
                    properties: {
                      pageLayouts: { type: "array" },
                      formPatterns: { type: "array" },
                      dataDisplay: { type: "array" },
                      navigationPatterns: { type: "array" },
                      components: { type: "array" },
                    },
                  },
                },
                required: ["variants", "designSystem", "templates"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_complete_design_package" } },
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI generation failed: ${errText}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call returned");

    const result = JSON.parse(toolCall.function.arguments);

    // Process result to match frontend expectations
    result.variants = (result.variants || []).map((v: any) => ({ ...v, id: crypto.randomUUID() }));

    const addIds = (items: any[], cat: string) => (items || []).map((item: any) => ({
      ...item,
      id: crypto.randomUUID(),
      category: item.category || cat
    }));

    result.templates.pageLayouts = addIds(result.templates.pageLayouts, "page");
    result.templates.formPatterns = addIds(result.templates.formPatterns, "form");
    result.templates.dataDisplay = addIds(result.templates.dataDisplay, "data");
    result.templates.navigationPatterns = addIds(result.templates.navigationPatterns, "nav");
    result.templates.components = addIds(result.templates.components, "component");

    return new Response(
      JSON.stringify({
        ...result,
        deviceType,
        deviceWidth: device.width,
        deviceHeight: device.height,
        deviceLabel: device.label,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-full-design error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
