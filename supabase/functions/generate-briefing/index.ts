
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Get the API key from environment variables
const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Format for the response structure
interface BriefingResponse {
  overview: string;
  highlights: string[];
  summary: string;
  sources?: Array<{
    title: string;
    url: string;
  }>;
}

// Create a fallback response when things don't work
const createFallbackResponse = (companyName: string, errorMessage: string): BriefingResponse => ({
  overview: `Não foi possível obter informações detalhadas sobre ${companyName} no momento.`,
  highlights: [
    "Verifique sua conexão com a internet",
    "Verifique se o site da empresa está acessível",
    "Tente novamente mais tarde",
    "Considere buscar informações manualmente no site da empresa",
    "Consulte perfis da empresa em redes sociais"
  ],
  summary: `Houve um problema técnico: ${errorMessage}. Tente atualizar a análise novamente.`,
  sources: [
    {
      title: `Site oficial de ${companyName}`,
      url: `https://www.google.com/search?q=${encodeURIComponent(companyName)}+site+oficial`
    },
    {
      title: `${companyName} no LinkedIn`,
      url: `https://www.linkedin.com/company/${encodeURIComponent(companyName.toLowerCase().replace(/\s+/g, '-'))}`
    }
  ]
});

// Mock the API response for now - this will be used if the API key is not set
const mockBriefingResponse = (companyName: string, category: string): BriefingResponse => {
  const categoryTitles = {
    'culture_values': 'Cultura e Valores',
    'mission_vision': 'Missão e Visão',
    'product_market': 'Produto e Mercado',
    'leadership': 'Time de Liderança',
    'company_history': 'História da Empresa'
  };
  
  const categoryTitle = categoryTitles[category as keyof typeof categoryTitles] || 'Empresa';
  
  return {
    overview: `A ${companyName} é uma empresa com presença global conhecida por suas soluções inovadoras. Este é um conteúdo de demonstração já que o acesso à API Perplexity não está configurado corretamente.`,
    highlights: [
      `A ${companyName} tem uma presença significativa no mercado`,
      `Valores como inovação e colaboração são importantes para a ${companyName}`,
      `Mais informações podem ser encontradas no site oficial da empresa`,
      `Recomendamos visitar o LinkedIn e Glassdoor para perspectivas adicionais`,
      `Este é um conteúdo gerado sem acesso à API Perplexity`
    ],
    summary: `Para obter uma análise completa sobre ${companyName} e seu ${categoryTitle}, configure corretamente a chave de API Perplexity no ambiente do Supabase Edge Function.`,
    sources: [
      {
        title: `Site oficial de ${companyName}`,
        url: `https://www.google.com/search?q=${encodeURIComponent(companyName)}+site+oficial`
      },
      {
        title: `${companyName} no LinkedIn`,
        url: `https://www.linkedin.com/company/${encodeURIComponent(companyName.toLowerCase().replace(/\s+/g, '-'))}`
      }
    ]
  };
};

// Call Perplexity API to generate company briefing with MCP formatting
const generateBriefingWithPerplexity = async (
  prompt: string,
  category: string,
  companyName: string
): Promise<BriefingResponse> => {
  if (!perplexityApiKey) {
    console.log('PERPLEXITY_API_KEY is not set. Using mock response.');
    return mockBriefingResponse(companyName, category);
  }

  try {
    // Implementing Model Context Protocol (MCP) structure for better interactions
    const systemMessage = `<context>
You are a company research specialist that analyzes organizations for job applicants.
Your task is to provide structured insights focusing on category: ${category}.
You must only respond with valid JSON in the exact format requested.
</context>`;

    const userMessage = `<input>
${prompt}

Please format your response as a valid JSON object with these exact fields:
{
  "overview": "A comprehensive paragraph overview focusing on ${category}",
  "highlights": ["Key point 1", "Key point 2", "Key point 3", "Key point 4", "Key point 5"],
  "summary": "A concluding analysis with deeper insights",
  "sources": [
    {"title": "Source Title 1", "url": "URL1"},
    {"title": "Source Title 2", "url": "URL2"}
  ]
}

Include 3-5 sources with title and URL. Do not include any explanatory text or Markdown.
</input>`;

    console.log(`Fetching information for ${companyName} - Category: ${category} with MCP formatting`);

    // Using the correct model and proper MCP formatting for request
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-online', // Using the most compatible model
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.1, // Lower temperature for more deterministic responses
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.error(`Perplexity API error: ${response.status} - ${response.statusText}`);
      console.error(`Response body: ${responseText}`);
      throw new Error(`Perplexity API responded with status: ${response.status} - ${responseText.substring(0, 200)}`);
    }

    const data = await response.json();
    console.log('API response received successfully');
    
    // Extract and parse the JSON response with improved error handling
    try {
      const contentText = data.choices[0].message.content;
      console.log('Raw response content:', contentText.substring(0, 300) + '...');
      
      let parsedResponse;
      
      // More robust JSON extraction - looking for JSON patterns
      const jsonRegexPatterns = [
        /```json\s*([\s\S]*?)\s*```/, // JSON in code blocks
        /```\s*([\s\S]*?)\s*```/,     // Any code block
        /\{[\s\S]*"overview"[\s\S]*"highlights"[\s\S]*"summary"[\s\S]*\}/ // Raw JSON object
      ];
      
      let extractedJson = null;
      
      // Try multiple regex patterns to extract the JSON
      for (const pattern of jsonRegexPatterns) {
        const match = contentText.match(pattern);
        if (match && match[1]) {
          extractedJson = match[1].trim();
          break;
        }
      }
      
      // If no JSON extracted with regex, use the whole content
      if (!extractedJson) {
        extractedJson = contentText.trim();
      }
      
      try {
        parsedResponse = JSON.parse(extractedJson);
      } catch (jsonError) {
        // If first attempt fails, try a more aggressive approach
        console.error("First JSON parse attempt failed:", jsonError);
        
        // Look for the first { and last } in the string
        const firstBrace = extractedJson.indexOf('{');
        const lastBrace = extractedJson.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const jsonSubstring = extractedJson.substring(firstBrace, lastBrace + 1);
          console.log("Attempting to parse JSON substring:", jsonSubstring.substring(0, 100) + "...");
          parsedResponse = JSON.parse(jsonSubstring);
        } else {
          throw jsonError; // Re-throw if we couldn't find valid JSON delimiters
        }
      }
      
      // Ensure the response has all required fields
      if (!parsedResponse.overview || !parsedResponse.highlights || !parsedResponse.summary) {
        console.error("Parsed response is missing required fields");
        throw new Error("The API response is missing required fields");
      }
      
      // If the API returns sources directly, merge them
      if (data.choices[0].message.sources && data.choices[0].message.sources.length > 0) {
        const apiSources = data.choices[0].message.sources.map((source: any) => ({
          title: source.title || 'Source',
          url: source.url
        }));
        
        // If the response already has sources, combine them, otherwise add them
        if (parsedResponse.sources && Array.isArray(parsedResponse.sources)) {
          parsedResponse.sources = [...parsedResponse.sources, ...apiSources];
        } else {
          parsedResponse.sources = apiSources;
        }
      }
      
      return parsedResponse;
    } catch (parseError) {
      console.error("Failed to parse Perplexity response as JSON:", parseError);
      console.log("Raw response content:", data.choices[0].message.content);
      
      // Return a properly structured fallback response
      throw new Error(`Falha ao analisar resposta da API: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Error calling Perplexity API:', error);
    return createFallbackResponse(companyName, error.message);
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, category, companyName, companyWebsite, refresh = false } = await req.json();

    // Validate required input parameters
    if (!prompt || !category || !companyName) {
      console.error('Missing required parameters:', { prompt: !!prompt, category: !!category, companyName: !!companyName });
      return new Response(JSON.stringify(
        createFallbackResponse('', 'Missing required parameters: prompt, category, or companyName')
      ), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    console.log(`Processing briefing request for ${companyName}, category: ${category}`);
    
    // Generate briefing content
    const briefingData = await generateBriefingWithPerplexity(prompt, category, companyName);
    
    return new Response(JSON.stringify(briefingData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-briefing function:', error);
    
    // Create a user-friendly error response
    const errorResponse = createFallbackResponse('', error.message);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      ...errorResponse
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
