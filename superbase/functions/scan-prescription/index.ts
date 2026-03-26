import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a medical prescription analyzer. Extract all medicines from the prescription image. For each medicine found, provide:
- name: The exact medicine name
- dosage: The dosage (e.g., 500mg, 10ml)
- frequency: How often to take it (e.g., "Twice daily", "3 times a day after meals")
- duration: How long to take it (e.g., "7 days", "2 weeks")
- advisory: Important advice like "Take after food", "Avoid alcohol", side effects to watch for

If the image is not a prescription or you cannot read it clearly, still try your best to extract any medicine information visible. If truly unreadable, return an empty medicines array with a note.

Be accurate - only report medicines you can actually see in the prescription.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please analyze this prescription image and extract all medicine details.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType || "image/jpeg"};base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_medicines",
              description: "Extract structured medicine data from a prescription",
              parameters: {
                type: "object",
                properties: {
                  medicines: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Medicine name" },
                        dosage: { type: "string", description: "Dosage amount" },
                        frequency: { type: "string", description: "How often to take" },
                        duration: { type: "string", description: "Duration of course" },
                        advisory: { type: "string", description: "Important advisory/warnings" },
                      },
                      required: ["name", "dosage", "frequency", "duration", "advisory"],
                    },
                  },
                  generalAdvice: {
                    type: "string",
                    description: "Overall advisory message for the patient",
                  },
                },
                required: ["medicines", "generalAdvice"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_medicines" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to analyze prescription" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      const extracted = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(extracted), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: return the text content
    const textContent = result.choices?.[0]?.message?.content || "";
    return new Response(JSON.stringify({ medicines: [], generalAdvice: textContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("scan-prescription error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
