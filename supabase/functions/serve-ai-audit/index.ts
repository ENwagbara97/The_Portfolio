import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { input } = await req.json();

    if (!input || input.trim().length === 0) {
      return new Response(
        JSON.stringify({ audit: "Please provide a description of your project or map." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const prompt = `You are a world-class GIS Strategist and Senior UX Designer. Analyze the following project description or problem statement and provide a professional audit. 

Problem/Project: ${input}

Your goal is to provide 3 high-impact, actionable insights that address both the geospatial logic (accuracy, data layering, cartography) and the user experience (interaction flow, accessibility, visual hierarchy).

Format your response as a numbered list of 3 concise tips. For each tip, provide one clear sentence explaining the "Why" and one clear sentence for the "Action". Keep the tone professional, technical, and encouraging.`;

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || "";
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      }),
    });

    const data = await response.json();
    const audit = data.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate audit from Gemini.";

    return new Response(
      JSON.stringify({ audit }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ audit: "Error processing audit request." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
