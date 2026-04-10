const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://lovable.dev",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a medical summary assistant. Give concise, professional health status summaries. No markdown." },
          { role: "user", content: prompt },
        ],
        max_tokens: 200,
      }),
    });

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || "Unable to generate health summary at this time.";

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Health summary error:", error);
    return new Response(
      JSON.stringify({ summary: "Unable to generate health summary at this time." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});