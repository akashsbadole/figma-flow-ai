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
      systemPrompt = `You are an expert UI designer. The user has an existing design and wants to modify it.

Current HTML:
${iterateOn.html}

Current CSS:
${iterateOn.css}

Apply the user's requested changes while keeping the overall structure intact.
Keep the same viewport size: ${device.width}x${device.height}px. Only modify what the user asks for.`;
    } else {
      systemPrompt = `You are an expert UI designer creating ${variantCount} different design variants for a ${device.label} (${device.width}x${device.height}px) screen.

${referenceImage ? "The user has provided a reference image. Use it as visual inspiration for the design style, colors, and layout approach." : ""}

For each variant, generate:
1. Clean, modern HTML and CSS for a complete self-contained screen
2. A native SVG version of the same design using pure SVG elements (rect, text, circle, path, g, etc.) — NO foreignObject, NO embedded HTML. This SVG is for pasting into Figma as editable vector objects.

Each variant should have a distinctly different visual approach (different color schemes, layouts, typography choices) while fulfilling the same design brief.

IMPORTANT RULES:
- Generate exactly ${variantCount} variants
- Each variant's HTML should be a complete self-contained screen
- Use viewport-relative sizing: the root container should be exactly ${device.width}px x ${device.height}px
- Use modern CSS: gradients, shadows, rounded corners, good typography
- Each variant must have a cohesive but DIFFERENT color palette
- Add realistic placeholder content (text, icons as unicode/emoji)
- Make each variant visually distinct and polished
- The SVG must be a complete standalone SVG with viewBox="0 0 ${device.width} ${device.height}" using native SVG elements only (text, rect, circle, line, path, g, linearGradient, etc.)
- The SVG should visually match the HTML version as closely as possible
- In SVG, use <text> for all text content, <rect> for boxes/cards/buttons, rounded corners via rx/ry attributes`;
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

    // Build variant properties dynamically
    const variantProperties: Record<string, any> = {};
    const requiredFields: string[] = [];
    const count = iterateOn ? 1 : Math.min(variantCount, 6);

    for (let i = 1; i <= count; i++) {
      variantProperties[`variant_${i}_name`] = { type: "string", description: `Name for variant ${i} (e.g. 'Clean Minimal', 'Bold Gradient')` };
      variantProperties[`variant_${i}_html`] = { type: "string", description: `Complete HTML markup for variant ${i}. Root container must be ${device.width}x${device.height}px.` };
      variantProperties[`variant_${i}_css`] = { type: "string", description: `CSS styles for variant ${i}. Use modern CSS with gradients, shadows, good typography.` };
      requiredFields.push(`variant_${i}_name`, `variant_${i}_html`, `variant_${i}_css`);
    }

    const codeResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: referenceImage ? "google/gemini-2.5-flash" : "google/gemini-2.5-flash",
        messages,
        tools: [
          {
            type: "function",
            function: {
              name: "generate_design_variants",
              description: `Generate ${count} UI design variant(s) with HTML and CSS`,
              parameters: {
                type: "object",
                properties: variantProperties,
                required: requiredFields,
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_design_variants" } },
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
      console.error("AI error:", codeResponse.status, errText);
      throw new Error("AI generation failed");
    }

    const codeData = await codeResponse.json();
    const toolCall = codeData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      // Fallback: try parsing from content
      const content = codeData.choices?.[0]?.message?.content || "";
      console.error("No tool call returned. Content preview:", content.substring(0, 300));
      throw new Error("AI did not return structured output");
    }

    let args: Record<string, string>;
    try {
      args = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error("Failed to parse tool call args:", toolCall.function.arguments?.substring(0, 500));
      throw new Error("Failed to parse AI response");
    }

    // Extract variants from flat tool call response
    const variants = [];
    for (let i = 1; i <= count; i++) {
      const name = args[`variant_${i}_name`];
      const html = args[`variant_${i}_html`];
      const css = args[`variant_${i}_css`];
      if (html && css) {
        variants.push({
          id: crypto.randomUUID(),
          name: name || `Variant ${i}`,
          html,
          css,
        });
      }
    }

    if (variants.length === 0) {
      console.error("No variants extracted from args keys:", Object.keys(args));
      throw new Error("No design variants generated");
    }

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
