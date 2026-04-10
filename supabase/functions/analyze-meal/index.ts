import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mealName, quantity, medicines } = await req.json();

    if (!mealName) {
      return new Response(JSON.stringify({ error: "No meal provided" }), {
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

    const medicineList = medicines?.length
      ? `The user is currently taking these medicines: ${medicines.map((m: any) => `${m.name} ${m.dosage} (${m.advisory})`).join(", ")}.`
      : "The user is not currently on any medication.";

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
            content: `You are a nutrition expert. Analyze meals and provide calorie/macro estimates. ${medicineList} Consider any food-drug interactions and provide a one-line suggestion about this meal in context of the user's medicines. If quantity is not specified in grams, assume one standard serving plate (~300g for cooked food, ~200g for salad/raw). Be concise and practical.`,
          },
          {
            role: "user",
            content: `Analyze this meal: "${mealName}"${quantity ? `, quantity: ${quantity}` : " (assume 1 standard plate)"}. Provide calorie count, macros, and a one-line suggestion considering my medicines.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_meal",
              description: "Return nutritional analysis of a meal",
              parameters: {
                type: "object",
                properties: {
                  calories: { type: "number", description: "Estimated calories" },
                  protein: { type: "number", description: "Protein in grams" },
                  carbs: { type: "number", description: "Carbs in grams" },
                  fat: { type: "number", description: "Fat in grams" },
                  fiber: { type: "number", description: "Fiber in grams" },
                  suggestion: { type: "string", description: "One-line suggestion about this meal considering the user's medicines" },
                },
                required: ["calories", "protein", "carbs", "fat", "fiber", "suggestion"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_meal" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "Failed to analyze meal" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      const data = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Could not analyze meal" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-meal error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});