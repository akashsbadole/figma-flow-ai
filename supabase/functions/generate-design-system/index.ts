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
              description: "Create a complete design system with colors, typography, spacing, and border radius.",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Name for this design system" },
                  colors: {
                    type: "object",
                    properties: {
                      primary: { type: "string", description: "Primary brand color as hex" },
                      secondary: { type: "string", description: "Secondary color as hex" },
                      accent: { type: "string", description: "Accent/highlight color as hex" },
                      background: { type: "string", description: "Background color as hex" },
                      foreground: { type: "string", description: "Text/foreground color as hex" },
                      muted: { type: "string", description: "Muted/subtle color as hex" },
                    },
                    required: ["primary", "secondary", "accent", "background", "foreground", "muted"],
                    additionalProperties: false,
                  },
                  typography: {
                    type: "object",
                    properties: {
                      heading: { type: "string", description: "Heading font family name" },
                      body: { type: "string", description: "Body font family name" },
                      mono: { type: "string", description: "Monospace font family name" },
                      scale: {
                        type: "array",
                        items: { type: "string" },
                        description: "Type scale sizes from smallest to largest (e.g. '0.75rem', '1rem', '1.5rem', '2rem', '3rem')",
                      },
                    },
                    required: ["heading", "body", "mono", "scale"],
                    additionalProperties: false,
                  },
                  spacing: {
                    type: "array",
                    items: { type: "string" },
                    description: "Spacing scale values (e.g. '0.25rem', '0.5rem', '1rem', '1.5rem', '2rem', '3rem', '4rem')",
                  },
                  borderRadius: { type: "string", description: "Default border radius value (e.g. '8px', '12px')" },
                },
                required: ["name", "colors", "typography", "spacing", "borderRadius"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_design_system" } },
        messages: [
          {
            role: "system",
            content: "You are an expert design system architect. Based on the brand description, create a cohesive, visually appealing design system. Choose fonts that match the brand personality. Create harmonious color palettes. Use a consistent spacing and type scale.",
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
