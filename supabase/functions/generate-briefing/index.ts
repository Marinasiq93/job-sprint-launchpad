
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY is not set in environment variables');
    }

    const { prompt, category, companyName, companyWebsite, refresh = false } = await req.json();

    // Structure the message for Perplexity API
    const message = `
      ${prompt}
      
      Use the following JSON structure for your response:
      {
        "overview": "A comprehensive overview about the company, focusing on aspects relevant to ${category}",
        "highlights": ["Key point 1", "Key point 2", "Key point 3", "Key point 4", "Key point 5"],
        "summary": "A concluding analysis that offers deeper context or insights"
      }
      
      Only respond with valid JSON. Do not include any introductory text, explanations, or markdown formatting.
    `;

    console.log(`Fetching information for ${companyName} - Category: ${category}`);

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that analyzes companies for job applicants. Provide structured insights about company culture, mission, products, leadership, and history to help candidates prepare for interviews. Return only valid JSON as specified.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 1000,
        return_images: false,
        return_related_questions: false,
        search_domain_filter: ['perplexity.ai'],
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the structured JSON response from Perplexity's response
    let structuredResponse = {};
    
    try {
      // The response should be in the content field of the first choice
      const contentText = data.choices[0].message.content;
      
      // Extract JSON from the response (it might be wrapped in code blocks)
      const jsonMatch = contentText.match(/```json\s*([\s\S]*?)\s*```/) || 
                        contentText.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, contentText];
      
      const jsonString = jsonMatch[1] || contentText;
      structuredResponse = JSON.parse(jsonString);
      
      console.log("Successfully parsed structured response");
    } catch (parseError) {
      console.error("Failed to parse Perplexity response as JSON:", parseError);
      console.log("Raw response:", data.choices[0].message.content);
      
      // Provide a fallback structured response
      structuredResponse = {
        overview: "As informações sobre a empresa não puderam ser formatadas corretamente. Tente atualizar novamente.",
        highlights: [
          "Informação não disponível",
          "Tente atualizar a análise",
          "Verifique o site da empresa",
          "Busque informações em plataformas como LinkedIn",
          "Considere fontes públicas como Glassdoor"
        ],
        summary: "Não foi possível estruturar adequadamente as informações da empresa. Por favor, tente atualizar a análise."
      };
    }

    return new Response(JSON.stringify(structuredResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-briefing function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      overview: "Não foi possível obter informações detalhadas sobre a empresa no momento.",
      highlights: [
        "Verifique sua conexão com a internet",
        "Verifique se o site da empresa está acessível",
        "Tente novamente mais tarde",
        "Considere buscar informações manualmente no site da empresa",
        "Consulte perfis da empresa em redes sociais"
      ],
      summary: "Houve um problema técnico ao buscar informações. Tente atualizar a análise ou consulte o site da empresa diretamente."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
