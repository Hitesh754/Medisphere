// // import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// // const corsHeaders = {
// //   "Access-Control-Allow-Origin": "*",
// //   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
// // };

// // serve(async (req) => {
// //   if (req.method === "OPTIONS") {
// //     return new Response(null, { headers: corsHeaders });
// //   }

// //   try {
// //     const { imageBase64, mimeType } = await req.json();

// //     if (!imageBase64) {
// //       return new Response(JSON.stringify({ error: "No image provided" }), {
// //         status: 400,
// //         headers: { ...corsHeaders, "Content-Type": "application/json" },
// //       });
// //     }

// //     const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
// //     if (!LOVABLE_API_KEY) {
// //       return new Response(JSON.stringify({ error: "API key not configured" }), {
// //         status: 500,
// //         headers: { ...corsHeaders, "Content-Type": "application/json" },
// //       });
// //     }

// //     const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
// //       method: "POST",
// //       headers: {
// //         Authorization: `Bearer ${LOVABLE_API_KEY}`,
// //         "Content-Type": "application/json",
// //       },
// //       body: JSON.stringify({
// //         model: "google/gemini-2.5-flash",
// //         messages: [
// //           {
// //             role: "system",
// //             content: `You are a medical prescription analyzer. Extract all medicines from the prescription image. For each medicine found, provide:
// // - name: The exact medicine name
// // - dosage: The dosage (e.g., 500mg, 10ml)
// // - frequency: How often to take it (e.g., "Twice daily", "3 times a day after meals")
// // - duration: How long to take it (e.g., "7 days", "2 weeks")
// // - advisory: Important advice like "Take after food", "Avoid alcohol", side effects to watch for

// // If the image is not a prescription or you cannot read it clearly, still try your best to extract any medicine information visible. If truly unreadable, return an empty medicines array with a note.

// // Be accurate - only report medicines you can actually see in the prescription.`,
// //           },
// //           {
// //             role: "user",
// //             content: [
// //               {
// //                 type: "text",
// //                 text: "Please analyze this prescription image and extract all medicine details.",
// //               },
// //               {
// //                 type: "image_url",
// //                 image_url: {
// //                   url: `data:${mimeType || "image/jpeg"};base64,${imageBase64}`,
// //                 },
// //               },
// //             ],
// //           },
// //         ],
// //         tools: [
// //           {
// //             type: "function",
// //             function: {
// //               name: "extract_medicines",
// //               description: "Extract structured medicine data from a prescription",
// //               parameters: {
// //                 type: "object",
// //                 properties: {
// //                   medicines: {
// //                     type: "array",
// //                     items: {
// //                       type: "object",
// //                       properties: {
// //                         name: { type: "string", description: "Medicine name" },
// //                         dosage: { type: "string", description: "Dosage amount" },
// //                         frequency: { type: "string", description: "How often to take" },
// //                         duration: { type: "string", description: "Duration of course" },
// //                         advisory: { type: "string", description: "Important advisory/warnings" },
// //                       },
// //                       required: ["name", "dosage", "frequency", "duration", "advisory"],
// //                     },
// //                   },
// //                   generalAdvice: {
// //                     type: "string",
// //                     description: "Overall advisory message for the patient",
// //                   },
// //                 },
// //                 required: ["medicines", "generalAdvice"],
// //               },
// //             },
// //           },
// //         ],
// //         tool_choice: { type: "function", function: { name: "extract_medicines" } },
// //       }),
// //     });

// //     if (!response.ok) {
// //       if (response.status === 429) {
// //         return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
// //           status: 429,
// //           headers: { ...corsHeaders, "Content-Type": "application/json" },
// //         });
// //       }
// //       if (response.status === 402) {
// //         return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), {
// //           status: 402,
// //           headers: { ...corsHeaders, "Content-Type": "application/json" },
// //         });
// //       }
// //       const errorText = await response.text();
// //       console.error("AI gateway error:", response.status, errorText);
// //       return new Response(JSON.stringify({ error: "Failed to analyze prescription" }), {
// //         status: 500,
// //         headers: { ...corsHeaders, "Content-Type": "application/json" },
// //       });
// //     }

// //     const result = await response.json();
// //     const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];

// //     if (toolCall?.function?.arguments) {
// //       const extracted = JSON.parse(toolCall.function.arguments);
// //       return new Response(JSON.stringify(extracted), {
// //         headers: { ...corsHeaders, "Content-Type": "application/json" },
// //       });
// //     }

// //     // Fallback: return the text content
// //     const textContent = result.choices?.[0]?.message?.content || "";
// //     return new Response(JSON.stringify({ medicines: [], generalAdvice: textContent }), {
// //       headers: { ...corsHeaders, "Content-Type": "application/json" },
// //     });
// //   } catch (e) {
// //     console.error("scan-prescription error:", e);
// //     return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
// //       status: 500,
// //       headers: { ...corsHeaders, "Content-Type": "application/json" },
// //     });
// //   }
// // });

// import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers":
//     "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
// };

// serve(async (req) => {
//   if (req.method === "OPTIONS") {
//     return new Response(null, { headers: corsHeaders });
//   }

//   try {
//     const { imageBase64, mimeType } = await req.json();

//     if (!imageBase64) {
//       return new Response(JSON.stringify({ error: "No image provided" }), {
//         status: 400,
//         headers: { ...corsHeaders, "Content-Type": "application/json" },
//       });
//     }

//     const gemini_key = Deno.env.get("gemini_key");
//     if (!gemini_key) {
//       return new Response(JSON.stringify({ error: "API key not configured" }), {
//         status: 500,
//         headers: { ...corsHeaders, "Content-Type": "application/json" },
//       });
//     }

//     const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
//     const resolvedMime = mimeType && allowedMimes.includes(mimeType) ? mimeType : "image/jpeg";

//     const response = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${gemini_key}`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           contents: [
//             {
//               parts: [
//                 {
//                   inline_data: {
//                     mime_type: resolvedMime,
//                     data: imageBase64,
//                   },
//                 },
//                 {
//                   text: `You are a medical prescription analyzer. Extract all medicines from this prescription image.

// Respond ONLY with a valid JSON object in this exact format, no markdown, no explanation:
// {
//   "medicines": [
//     {
//       "name": "Medicine Name",
//       "dosage": "500mg",
//       "frequency": "Twice daily",
//       "duration": "7 days",
//       "advisory": "Take after food"
//     }
//   ],
//   "generalAdvice": "Overall advice for the patient"
// }

// For each medicine provide: name, dosage, frequency (how often), duration (how long), advisory (warnings/advice).
// If the image is not a prescription or unreadable, return: {"medicines":[],"generalAdvice":"Could not read prescription clearly. Please try a clearer image."}`,
//                 },
//               ],
//             },
//           ],
//           generationConfig: {
//             temperature: 0.1,
//             maxOutputTokens: 1024,
//           },
//         }),
//       }
//     );

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("Gemini API error:", response.status, errorText);

//       if (response.status === 429) {
//         return new Response(
//           JSON.stringify({ error: "Rate limited. Please try again in a moment." }),
//           { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//         );
//       }
//       if (response.status === 400) {
//         return new Response(
//           JSON.stringify({ error: "Invalid request. Please try a clearer image." }),
//           { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//         );
//       }
//       if (response.status === 403) {
//         return new Response(
//           JSON.stringify({ error: "Invalid API key. Please check your gemini_key secret." }),
//           { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//         );
//       }

//       return new Response(
//         JSON.stringify({ error: "Failed to analyze prescription" }),
//         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     const result = await response.json();
//     const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

//     try {
//       const clean = textContent.replace(/```json|```/g, "").trim();
//       const extracted = JSON.parse(clean);
//       return new Response(JSON.stringify(extracted), {
//         headers: { ...corsHeaders, "Content-Type": "application/json" },
//       });
//     } catch {
//       console.error("JSON parse error, raw response:", textContent);
//       return new Response(
//         JSON.stringify({ medicines: [], generalAdvice: textContent }),
//         { headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }
//   } catch (e) {
//     console.error("scan-prescription error:", e);
//     return new Response(
//       JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
//       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//     );
//   }
// });

// import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers":
//     "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
// };

// serve(async (req) => {
//   if (req.method === "OPTIONS") {
//     return new Response(null, { headers: corsHeaders });
//   }

//   try {
//     const body = await req.json().catch(() => null);

//     if (!body || !body.imageBase64) {
//       return new Response(JSON.stringify({ error: "No image provided" }), {
//         status: 400,
//         headers: { ...corsHeaders, "Content-Type": "application/json" },
//       });
//     }

//     const { imageBase64, mimeType } = body;

//     // Reject files over ~10MB
//     if (imageBase64.length > 14 * 1024 * 1024) {
//       return new Response(JSON.stringify({ error: "Image too large. Please use an image under 10MB." }), {
//         status: 400,
//         headers: { ...corsHeaders, "Content-Type": "application/json" },
//       });
//     }

//     const gemini_key = Deno.env.get("gemini_key");
// if (!gemini_key) {
//   return new Response(JSON.stringify({ error: "gemini_key secret not configured..." }), {
//     status: 500, // ← This is the non-2xx error
//   });
// }

//     const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
//     const resolvedMime = mimeType && allowedMimes.includes(mimeType) ? mimeType : "image/jpeg";

//     const response = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${gemini_key}`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           contents: [
//             {
//               parts: [
//                 {
//                   inline_data: {
//                     mime_type: resolvedMime,
//                     data: imageBase64,
//                   },
//                 },
//                 {
//                   text: `You are a medical prescription analyzer. Extract all medicines from this prescription image.

// Respond ONLY with a valid JSON object in this exact format, no markdown, no explanation:
// {
//   "medicines": [
//     {
//       "name": "Medicine Name",
//       "dosage": "500mg",
//       "frequency": "Twice daily",
//       "duration": "7 days",
//       "advisory": "Take after food"
//     }
//   ],
//   "generalAdvice": "Overall advice for the patient"
// }

// For each medicine provide: name, dosage, frequency (how often), duration (how long), advisory (warnings/advice).
// If the image is not a prescription or unreadable, return: {"medicines":[],"generalAdvice":"Could not read prescription clearly. Please try a clearer image."}`,
//                 },
//               ],
//             },
//           ],
//           generationConfig: {
//             temperature: 0.1,
//             maxOutputTokens: 1024,
//           },
//         }),
//       }
//     );

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("Gemini API error:", response.status, errorText);

//       if (response.status === 400) {
//         return new Response(
//           JSON.stringify({ error: "Invalid image. Please try a clearer image." }),
//           { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//         );
//       }
//       if (response.status === 403) {
//         return new Response(
//           JSON.stringify({ error: "Invalid Gemini API key. Check your gemini_key secret in Supabase." }),
//           { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//         );
//       }
//       if (response.status === 429) {
//         return new Response(
//           JSON.stringify({ error: "Rate limited. Please try again in a moment." }),
//           { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//         );
//       }

//       return new Response(
//         JSON.stringify({ error: `Gemini error ${response.status}: ${errorText}` }),
//         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     const result = await response.json();
//     const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

//     if (!textContent) {
//       return new Response(
//         JSON.stringify({ medicines: [], generalAdvice: "No response from Gemini. Please try again." }),
//         { headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     try {
//       const clean = textContent.replace(/```json|```/g, "").trim();
//       const extracted = JSON.parse(clean);
//       return new Response(JSON.stringify(extracted), {
//         headers: { ...corsHeaders, "Content-Type": "application/json" },
//       });
//     } catch {
//       console.error("JSON parse error, raw response:", textContent);
//       return new Response(
//         JSON.stringify({ medicines: [], generalAdvice: textContent }),
//         { headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }
//   } catch (e) {
//     console.error("scan-prescription error:", e);
//     return new Response(
//       JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
//       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//     );
//   }
// });


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
