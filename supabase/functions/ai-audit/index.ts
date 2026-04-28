import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Setup: supabase secrets set GEMINI_API_KEY=your_key
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { 
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      } 
    })
  }

  try {
    const { prompt: userPrompt } = await req.json()

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not set')
    }

    // Preserve system instructions for Geospatial Audit
    const systemInstruction = "You are an elite GIS auditor and Senior UX Architect. Analyze project metadata and GIS workflows. Identify critical spatial or design risks and suggest high-impact improvements. Format as a technical system report. Keep it concise, authoritative, and helpful.";
    
    const fullPrompt = `${systemInstruction}\n\nUser Input: ${userPrompt}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: fullPrompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      }),
    })

    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error.message)
    }

    const text = data.candidates[0].content.parts[0].text

    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
})
