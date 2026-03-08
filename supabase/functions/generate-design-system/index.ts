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
                      primary: { type: "string", description: "Primary brand color as hex" },
                      primaryLight: { type: "string", description: "Light variant of primary" },
                      primaryDark: { type: "string", description: "Dark variant of primary" },
                      secondary: { type: "string", description: "Secondary color as hex" },
                      secondaryLight: { type: "string", description: "Light variant of secondary" },
                      accent: { type: "string", description: "Accent/highlight color as hex" },
                      background: { type: "string", description: "Background color as hex" },
                      surface: { type: "string", description: "Surface/card color as hex" },
                      foreground: { type: "string", description: "Text/foreground color as hex" },
                      muted: { type: "string", description: "Muted/subtle color as hex" },
                      success: { type: "string", description: "Success state color as hex" },
                      warning: { type: "string", description: "Warning state color as hex" },
                      error: { type: "string", description: "Error/destructive color as hex" },
                      info: { type: "string", description: "Info state color as hex" },
                    },
                    required: ["primary", "primaryLight", "primaryDark", "secondary", "secondaryLight", "accent", "background", "surface", "foreground", "muted", "success", "warning", "error", "info"],
                    additionalProperties: false,
                  },
                  typography: {
                    type: "object",
                    properties: {
                      heading: { type: "string", description: "Heading font family name (Google Font)" },
                      body: { type: "string", description: "Body font family name (Google Font)" },
                      mono: { type: "string", description: "Monospace font family name" },
                      scale: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string", description: "Token name like xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl" },
                            size: { type: "string", description: "Font size in rem" },
                            lineHeight: { type: "string", description: "Line height value" },
                            letterSpacing: { type: "string", description: "Letter spacing value" },
                          },
                          required: ["name", "size", "lineHeight", "letterSpacing"],
                          additionalProperties: false,
                        },
                      },
                      weights: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string", description: "Weight name like light, regular, medium, semibold, bold" },
                            value: { type: "number", description: "CSS font-weight value" },
                          },
                          required: ["name", "value"],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: ["heading", "body", "mono", "scale", "weights"],
                    additionalProperties: false,
                  },
                  spacing: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Token name like xs, sm, md, lg, xl, 2xl, 3xl" },
                        value: { type: "string", description: "Spacing value in rem" },
                      },
                      required: ["name", "value"],
                      additionalProperties: false,
                    },
                  },
                  borderRadius: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Token name like none, sm, md, lg, xl, full" },
                        value: { type: "string", description: "Border radius value" },
                      },
                      required: ["name", "value"],
                      additionalProperties: false,
                    },
                  },
                  shadows: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Shadow name like sm, md, lg, xl" },
                        value: { type: "string", description: "CSS box-shadow value" },
                      },
                      required: ["name", "value"],
                      additionalProperties: false,
                    },
                  },
                  gradients: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Gradient name like primary, accent, warm" },
                        value: { type: "string", description: "CSS linear-gradient value" },
                      },
                      required: ["name", "value"],
                      additionalProperties: false,
                    },
                  },
                  components: {
                    type: "object",
                    properties: {
                      buttonHtml: { type: "string", description: "Sample button component HTML with primary, secondary, outline variants" },
                      buttonCss: { type: "string", description: "CSS for the button component using design tokens" },
                      cardHtml: { type: "string", description: "Sample card component HTML" },
                      cardCss: { type: "string", description: "CSS for the card component using design tokens" },
                      inputHtml: { type: "string", description: "Sample input component HTML with label" },
                      inputCss: { type: "string", description: "CSS for the input component using design tokens" },
                    },
                    required: ["buttonHtml", "buttonCss", "cardHtml", "cardCss", "inputHtml", "inputCss"],
                    additionalProperties: false,
                  },
                },
                required: ["name", "colors", "typography", "spacing", "borderRadius", "shadows", "gradients", "components"],
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
- Create a harmonious, accessible color palette (check contrast ratios mentally)
- Include semantic colors (success, warning, error, info)
- Provide a complete type scale from xs to 5xl
- Include multiple font weights
- Create practical shadows and gradients
- Component HTML/CSS should use CSS custom properties referencing the tokens
- Components should look polished and production-ready`,
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
