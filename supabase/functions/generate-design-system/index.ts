import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt } = await req.json();
    if (!prompt) throw new Error("Prompt is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const tokenArrayItem = (fields: Record<string, any>) => ({
      type: "object" as const,
      properties: fields,
      required: Object.keys(fields),
      additionalProperties: false,
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        tools: [
          {
            type: "function",
            function: {
              name: "create_design_system",
              description: "Create a comprehensive design system with all tokens needed for Figma and development.",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Name for this design system" },
                  colors: {
                    type: "object",
                    properties: {
                      primary: { type: "string" }, primaryLight: { type: "string" }, primaryDark: { type: "string" },
                      secondary: { type: "string" }, secondaryLight: { type: "string" }, accent: { type: "string" },
                      background: { type: "string" }, surface: { type: "string" }, foreground: { type: "string" },
                      muted: { type: "string" }, success: { type: "string" }, warning: { type: "string" },
                      error: { type: "string" }, info: { type: "string" },
                    },
                    required: ["primary", "primaryLight", "primaryDark", "secondary", "secondaryLight", "accent", "background", "surface", "foreground", "muted", "success", "warning", "error", "info"],
                    additionalProperties: false,
                  },
                  typography: {
                    type: "object",
                    properties: {
                      heading: { type: "string" }, body: { type: "string" }, mono: { type: "string" },
                      scale: { type: "array", items: tokenArrayItem({ name: { type: "string" }, size: { type: "string" }, lineHeight: { type: "string" }, letterSpacing: { type: "string" } }) },
                      weights: { type: "array", items: tokenArrayItem({ name: { type: "string" }, value: { type: "number" } }) },
                    },
                    required: ["heading", "body", "mono", "scale", "weights"],
                    additionalProperties: false,
                  },
                  spacing: { type: "array", items: tokenArrayItem({ name: { type: "string" }, value: { type: "string" } }) },
                  borderRadius: { type: "array", items: tokenArrayItem({ name: { type: "string" }, value: { type: "string" } }) },
                  shadows: { type: "array", items: tokenArrayItem({ name: { type: "string" }, value: { type: "string" } }) },
                  gradients: { type: "array", items: tokenArrayItem({ name: { type: "string" }, value: { type: "string" } }) },
                  breakpoints: { type: "array", items: tokenArrayItem({ name: { type: "string" }, value: { type: "string" } }) },
                  opacity: { type: "array", items: tokenArrayItem({ name: { type: "string" }, value: { type: "number" } }) },
                  zIndex: { type: "array", items: tokenArrayItem({ name: { type: "string" }, value: { type: "number" } }) },
                  transitions: { type: "array", items: tokenArrayItem({ name: { type: "string" }, duration: { type: "string" }, easing: { type: "string" } }) },
                  borders: { type: "array", items: tokenArrayItem({ name: { type: "string" }, width: { type: "string" }, style: { type: "string" }, color: { type: "string" } }) },
                  components: {
                    type: "object",
                    properties: {
                      buttonHtml: { type: "string" }, buttonCss: { type: "string" },
                      cardHtml: { type: "string" }, cardCss: { type: "string" },
                      inputHtml: { type: "string" }, inputCss: { type: "string" },
                      badgeHtml: { type: "string" }, badgeCss: { type: "string" },
                      alertHtml: { type: "string" }, alertCss: { type: "string" },
                      avatarHtml: { type: "string" }, avatarCss: { type: "string" },
                    },
                    required: ["buttonHtml", "buttonCss", "cardHtml", "cardCss", "inputHtml", "inputCss", "badgeHtml", "badgeCss", "alertHtml", "alertCss", "avatarHtml", "avatarCss"],
                    additionalProperties: false,
                  },
                },
                required: ["name", "colors", "typography", "spacing", "borderRadius", "shadows", "gradients", "breakpoints", "opacity", "zIndex", "transitions", "borders", "components"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_design_system" } },
        messages: [
          {
            role: "system",
            content: `You are an expert design system architect creating production-ready design systems for Figma and development.

Rules:
- All colors must be valid hex codes
- Choose Google Fonts that match the brand personality
- Create a harmonious, accessible color palette (check contrast ratios)
- Include semantic colors (success, warning, error, info)
- Provide a complete type scale from xs to 5xl
- Include multiple font weights (light, regular, medium, semibold, bold)
- Create practical shadows and gradients
- Include responsive breakpoints (sm, md, lg, xl, 2xl)
- Include opacity scale (0, 25, 50, 75, 100)
- Include z-index layers (base, dropdown, sticky, modal, popover, toast)
- Include transition presets (fast, normal, slow) with easing curves
- Include border definitions (thin, medium, thick)
- Component HTML/CSS should use CSS custom properties referencing the tokens
- Components should look polished and production-ready
- Generate badge, alert, and avatar components in addition to button, card, and input`,
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
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI generation failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) throw new Error("No design system generated");

    const designSystem = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ designSystem }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-design-system error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
