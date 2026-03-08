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

    // Generate HTML/CSS code using AI
    const codeResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `You are an expert UI designer. Generate clean, modern HTML and CSS code based on the user's description. Return ONLY valid JSON with this exact structure:
{"html": "<the HTML markup>", "css": "<the CSS styles>", "svg": "<optional SVG if applicable, or empty string>"}
Do not include any markdown, explanation, or code fences. Just the JSON object.
Make the designs visually appealing with modern CSS (gradients, shadows, rounded corners, good typography).
Use a cohesive color palette. Make it responsive.`,
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!codeResponse.ok) {
      if (codeResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (codeResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI generation failed");
    }

    const codeData = await codeResponse.json();
    const content = codeData.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      // Try to extract JSON from possible markdown fences
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      parsed = JSON.parse(jsonMatch[1].trim());
    } catch {
      parsed = { html: content, css: "", svg: "" };
    }

    // Generate preview image using image model
    let imageUrl = "";
    try {
      const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [
            {
              role: "user",
              content: `Create a clean, professional UI mockup/wireframe image for: ${prompt}. Make it look like a real web design with modern aesthetics.`,
            },
          ],
          modalities: ["image", "text"],
        }),
      });

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url || "";
      }
    } catch (e) {
      console.error("Image generation failed, continuing without image:", e);
    }

    return new Response(
      JSON.stringify({
        htmlCode: parsed.html || "",
        cssCode: parsed.css || "",
        svgCode: parsed.svg || "",
        imageUrl,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-design error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
