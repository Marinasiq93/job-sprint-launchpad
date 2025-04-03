
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
            Forneça uma análise detalhada baseada em informações disponíveis online.`
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
    
    return content;
  } catch (error) {
    console.error("Error calling Perplexity API:", error);
    throw error;
  }
};

// Process the raw Perplexity API response into our expected format
const processPerplexityResponse = (content: string, companyName: string): BriefingResponse => {
  try {
    // Parse content paragraph by paragraph and extract key information
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    
    // If we don't have enough content, fall back to a default structure
    if (paragraphs.length < 2) {
      return {
        overview: content || `Análise da empresa ${companyName}`,
        highlights: ["Informação obtida diretamente da API sem formatação específica"],
        summary: "Veja o conteúdo acima para a análise completa.",
        sources: []
      };
    }
    
    // Take first paragraph as overview
    const overview = paragraphs[0];
    
    // Identify potential highlight points (sentences or bullet points)
    let highlights: string[] = [];
    
    // Look for bullet points or numbered lists
    const bulletRegex = /[•\-*]\s+([^\n]+)/g;
    const numberedRegex = /\d+\.\s+([^\n]+)/g;
    let bulletMatch;
    let numberedMatch;
    
    while ((bulletMatch = bulletRegex.exec(content)) !== null) {
      highlights.push(bulletMatch[1]);
    }
    
    while ((numberedMatch = numberedRegex.exec(content)) !== null) {
      highlights.push(numberedMatch[1]);
    }
    
    // If no bullet points, extract some sentences from the middle of the content
    if (highlights.length === 0) {
      const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
      // Skip first few and last few sentences (likely intro and conclusion)
      if (sentences.length > 6) {
        highlights = sentences.slice(2, 7).map(s => s.trim());
      } else if (sentences.length > 0) {
        highlights = sentences.slice(0, Math.min(5, sentences.length)).map(s => s.trim());
      }
    }
    
    // Limit to 5 highlights
    highlights = highlights.slice(0, 5);
    
    // If still no highlights, create generic ones
    if (highlights.length === 0) {
      highlights = [
        `Informações sobre ${companyName} extraídas de fontes online`,
        "Consulte o site oficial da empresa para mais detalhes",
        "Procure reviews no Glassdoor para insights de funcionários",
        "Verifique o LinkedIn da empresa para atualizações recentes",
        "Pesquise notícias recentes para contexto atual da empresa"
      ];
    }
    
    // Take last paragraph or second half of content as summary
    const summary = paragraphs[paragraphs.length - 1];
    
    // Look for URLs in the content to use as sources
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = content.match(urlRegex) || [];
    
    const sources = urls.slice(0, 5).map(url => ({
      title: `Fonte: ${url.split("//")[1]?.split("/")[0] || url}`,
      url: url
    }));
    
    // If no URLs found, add generic sources
    if (sources.length === 0) {
      sources.push({
        title: `Site oficial de ${companyName}`,
        url: `https://www.google.com/search?q=${encodeURIComponent(companyName)}+site+oficial`
      });
      sources.push({
        title: `${companyName} no LinkedIn`,
        url: `https://www.linkedin.com/company/${encodeURIComponent(companyName.toLowerCase().replace(/\s+/g, '-'))}`
      });
    }
    
    return {
      overview,
      highlights,
      summary,
      sources
    };
  } catch (error) {
    console.error("Error processing Perplexity response:", error);
    // Return a basic structure with the raw content
    return {
      overview: content.slice(0, 200) + "...",
      highlights: ["Veja a análise completa acima"],
      summary: content.slice(-200),
      sources: [
        { 
          title: `Pesquisar ${companyName}`, 
          url: `https://www.google.com/search?q=${encodeURIComponent(companyName)}`
        }
      ]
    };
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
      // Try to get data from Perplexity API (now getting raw text)
      const perplexityResponse = await getPerplexityAnalysis(prompt);
      console.log("Raw API response excerpt:", perplexityResponse.substring(0, 100) + "...");
      
      // Process the raw text into our expected structure
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

