
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

// Generate sample demo content without API call
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
    
    // For now, return demo content instead of calling Perplexity API
    // This avoids the 400 errors until the API integration can be fixed properly
    const briefingData = generateDemoContent(companyName, category, companyWebsite || 'https://www.example.com');
    
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
