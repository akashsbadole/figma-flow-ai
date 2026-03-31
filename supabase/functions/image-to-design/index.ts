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

    const { image, prompt } = await req.json();
    if (!image) throw new Error("Image is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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
              name: "generate_code",
              description: "Generate production-ready code from a design image in multiple formats",
              parameters: {
                type: "object",
                properties: {
                  html: { type: "string", description: "Clean semantic HTML5 markup" },
                  css: { type: "string", description: "Modern CSS with custom properties, flexbox/grid, responsive design" },
                  react: { type: "string", description: "React functional component using JSX with inline styles or CSS modules" },
                  tailwind: { type: "string", description: "React component using Tailwind CSS utility classes" },
                },
                required: ["html", "css", "react", "tailwind"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_code" } },
        messages: [
          {
            role: "system",
            content: `You are an expert frontend developer. Analyze the provided design image and generate production-ready code.

Rules:
- HTML: Clean semantic HTML5, use appropriate tags, add realistic placeholder content
- CSS: Modern CSS with custom properties, responsive design, proper spacing and typography
- React: Functional component with proper JSX, use useState for interactive elements
- Tailwind: React component using Tailwind CSS utility classes (no custom CSS needed)
- Match colors, spacing, typography, and layout from the image as closely as possible
- Make all outputs responsive and accessible
- Include hover states, transitions where appropriate
- Use system fonts or common Google Fonts`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: prompt || "Convert this design to code" },
              { type: "image_url", image_url: { url: image } },
            ],
          },
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
      console.error("AI error:", response.status, errText);
      throw new Error("AI generation failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) throw new Error("No code generated");

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("image-to-design error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
