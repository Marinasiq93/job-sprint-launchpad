
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

// Generate demo content without API call
const generateDemoContent = (companyName: string, category: string, companyWebsite: string): BriefingResponse => {
  // Generate appropriate content based on company name, website and category
  const categoryLabels = {
    'culture_values': 'cultura e valores',
    'mission_vision': 'missão e visão',
    'product_market': 'produto e mercado',
    'leadership': 'liderança',
    'company_history': 'história'
  };
  
  const categoryLabel = categoryLabels[category as keyof typeof categoryLabels] || 'perfil';
  
  return {
    overview: `${companyName} (${companyWebsite}) é uma empresa que está sendo analisada para sua candidatura. Esta é uma versão de demonstração da análise de ${categoryLabel} da empresa.`,
    highlights: [
      `Demonstração: ${companyName} opera em seu setor com foco em inovação`,
      `Demonstração: A presença online da empresa pode ser verificada em ${companyWebsite}`,
      `Demonstração: Recomendamos pesquisar mais sobre a ${categoryLabel} da ${companyName}`,
      `Demonstração: Consulte o LinkedIn e Glassdoor para mais informações sobre a empresa`,
      `Demonstração: Esta análise está em modo de demonstração e não reflete dados reais da empresa`
    ],
    summary: `Esta é uma análise de demonstração para ${companyName}. Para utilizar a análise completa, verifique se a API Perplexity está corretamente configurada no ambiente.`,
    sources: [
      {
        title: `Site oficial: ${companyWebsite}`,
        url: companyWebsite
      },
      {
        title: `${companyName} no LinkedIn`,
        url: `https://www.linkedin.com/company/${encodeURIComponent(companyName.toLowerCase().replace(/\s+/g, '-'))}`
      },
      {
        title: `${companyName} no Glassdoor`,
        url: `https://www.glassdoor.com.br/Avalia%C3%A7%C3%B5es/${encodeURIComponent(companyName)}-Avalia%C3%A7%C3%B5es`
      }
    ]
  };
};

// Call Perplexity API to get the analysis
const getPerplexityAnalysis = async (prompt: string): Promise<any> => {
  if (!perplexityApiKey) {
    throw new Error("PERPLEXITY_API_KEY is not set in the environment");
  }
  
  console.log("Calling Perplexity API with key:", perplexityApiKey ? "API key is set" : "No API key");
  
  try {
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
            content: `Você é um assistente especializado em análise de empresas para candidatos a emprego.
            Organize sua resposta para ser parseada como JSON com a seguinte estrutura:
            {
              "overview": "Visão geral da empresa e detalhes principais",
              "highlights": ["Ponto 1", "Ponto 2", "Ponto 3", "Ponto 4", "Ponto 5"],
              "summary": "Resumo conciso para o candidato",
              "sources": [
                {"title": "Fonte 1", "url": "url1"},
                {"title": "Fonte 2", "url": "url2"}
              ]
            }
            Mantenha os highlights limitados a 5 itens importantes, e fontes entre 2 e 5.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error("Perplexity API error:", errorData);
      throw new Error(`API responded with status ${response.status}: ${errorData}`);
    }
    
    const data = await response.json();
    console.log("Perplexity API response received");
    
    // Extract the content from the response
    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in Perplexity API response");
    }
    
    // Try to parse the JSON from the content
    try {
      // Find JSON in the content (it might be wrapped in text or markdown)
      const jsonMatch = content.match(/```json\s*({[\s\S]*?})\s*```/) || 
                         content.match(/{[\s\S]*"overview"[\s\S]*"highlights"[\s\S]*"summary"[\s\S]*}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      
      // If no JSON found using regex, try to parse the whole content
      return JSON.parse(content);
    } catch (parseError) {
      console.error("Error parsing JSON from Perplexity response:", parseError);
      console.log("Raw content:", content);
      throw new Error("Failed to parse JSON from Perplexity response");
    }
  } catch (error) {
    console.error("Error calling Perplexity API:", error);
    throw error;
  }
};

// Process the Perplexity API response into our expected format
const processPerplexityResponse = (data: any, companyName: string): BriefingResponse => {
  try {
    // Validate the required fields
    if (!data.overview || !Array.isArray(data.highlights) || !data.summary) {
      throw new Error("Perplexity response is missing required fields");
    }
    
    // Create a valid response object
    return {
      overview: data.overview || `Análise da empresa ${companyName}`,
      highlights: Array.isArray(data.highlights) ? 
        data.highlights.slice(0, 5) : 
        ["Nenhum destaque disponível"],
      summary: data.summary || "Resumo não disponível",
      sources: Array.isArray(data.sources) ? 
        data.sources.map((source: any) => ({
          title: source.title || "Fonte",
          url: source.url || "#"
        })) : 
        [{ title: `Informações sobre ${companyName}`, url: `https://www.google.com/search?q=${encodeURIComponent(companyName)}` }]
    };
  } catch (error) {
    console.error("Error processing Perplexity response:", error);
    throw error;
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
    if (!category || !companyName) {
      console.error('Missing required parameters:', { category: !!category, companyName: !!companyName });
      return new Response(JSON.stringify(
        createFallbackResponse('', 'Missing required parameters: category or companyName')
      ), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    console.log(`Processing briefing request for ${companyName}, category: ${category}`);
    console.log(`API key present: ${!!perplexityApiKey}`);
    
    // Check if API key is available
    if (!perplexityApiKey) {
      console.log("PERPLEXITY_API_KEY not set, returning demo content");
      const briefingData = generateDemoContent(companyName, category, companyWebsite || 'https://www.example.com');
      return new Response(JSON.stringify(briefingData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    try {
      // Try to get data from Perplexity API
      const perplexityResponse = await getPerplexityAnalysis(prompt);
      const processedResponse = processPerplexityResponse(perplexityResponse, companyName);
      
      return new Response(JSON.stringify(processedResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (apiError) {
      console.error("Error from Perplexity API, falling back to demo content:", apiError);
      // Fallback to demo content if API call fails
      const briefingData = generateDemoContent(companyName, category, companyWebsite || 'https://www.example.com');
      return new Response(JSON.stringify(briefingData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
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
