import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, deviceType = "mobile", variantCount = 4, referenceImage, iterateOn } = await req.json();
    if (!prompt) throw new Error("Prompt is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const deviceDimensions = {
      mobile: { width: 390, height: 844, label: "iPhone 15 Pro" },
      tablet: { width: 820, height: 1180, label: "iPad Air" },
      desktop: { width: 1440, height: 900, label: "Desktop" },
    };

    const device = deviceDimensions[deviceType as keyof typeof deviceDimensions] || deviceDimensions.mobile;

    let systemPrompt: string;

    if (iterateOn) {
      // Iteration mode: modify existing design
      systemPrompt = `You are an expert UI designer. The user has an existing design and wants to modify it.

Current HTML:
\`\`\`html
${iterateOn.html}
\`\`\`

Current CSS:
\`\`\`css
${iterateOn.css}
\`\`\`

Apply the user's requested changes while keeping the overall structure intact. Return ONLY valid JSON:
{
  "variants": [
    {
      "name": "Updated Design",
      "html": "<the modified HTML>",
      "css": "<the modified CSS>"
    }
  ]
}

RULES:
- Keep the same viewport size: ${device.width}x${device.height}px
- Only modify what the user asks for
- Preserve the overall layout and structure
- Do not include markdown, explanation, or code fences. Just the JSON.`;
    } else {
      systemPrompt = `You are an expert UI designer creating ${variantCount} different design variants for a ${device.label} (${device.width}x${device.height}px) screen.

${referenceImage ? "The user has provided a reference image. Use it as visual inspiration for the design style, colors, and layout approach." : ""}

For each variant, generate clean, modern HTML and CSS. Each variant should have a distinctly different visual approach (different color schemes, layouts, typography choices) while fulfilling the same design brief.

Return ONLY valid JSON with this exact structure:
{
  "variants": [
    {
      "name": "Variant name (e.g. 'Clean Minimal', 'Bold Gradient')",
      "html": "<the complete HTML markup>",
      "css": "<the CSS styles scoped to this variant>"
    }
  ]
}

IMPORTANT RULES:
- Generate exactly ${variantCount} variants
- Each variant's HTML should be a complete self-contained screen
- Use viewport-relative sizing: the root container should be exactly ${device.width}px x ${device.height}px
- Use modern CSS: gradients, shadows, rounded corners, good typography
- Each variant must have a cohesive but DIFFERENT color palette
- Add realistic placeholder content (text, icons as unicode/emoji)
- Make each variant visually distinct and polished
- Do not include any markdown, explanation, or code fences. Just the JSON object.`;
    }

    // Build messages
    const messages: any[] = [{ role: "system", content: systemPrompt }];

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

    const codeResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: referenceImage ? "google/gemini-2.5-flash" : "google/gemini-3-flash-preview",
        messages,
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
      const errText = await codeResponse.text();
      console.error("AI error:", errText);
      throw new Error("AI generation failed");
    }

    const codeData = await codeResponse.json();
    const content = codeData.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      parsed = JSON.parse(jsonMatch[1].trim());
    } catch {
      parsed = { variants: [{ name: "Design", html: content, css: "" }] };
    }

    const variants = (parsed.variants || []).map((v: any, i: number) => ({
      id: crypto.randomUUID(),
      name: v.name || `Variant ${i + 1}`,
      html: v.html || "",
      css: v.css || "",
    }));

    return new Response(
      JSON.stringify({
        variants,
        deviceType,
        deviceWidth: device.width,
        deviceHeight: device.height,
        deviceLabel: device.label,
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
