
import { BriefingResponse } from "./types.ts";

// Create a fallback response when things don't work
export const createFallbackResponse = (companyName: string, errorMessage: string): BriefingResponse => ({
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
export const generateDemoContent = (companyName: string, category: string, companyWebsite: string): BriefingResponse => {
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
