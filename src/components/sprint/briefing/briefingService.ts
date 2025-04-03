
import { toast } from "@/lib/toast";
import { BRIEFING_CATEGORIES } from "./briefingConstants";

// Perplexity prompts for each category
export const perplexityPromptsByCategory = {
  [BRIEFING_CATEGORIES.CULTURE_VALUES]: (companyName: string, companyWebsite: string) => 
    `Utilize o nome da empresa ${companyName} e a URL institucional ${companyWebsite} para gerar este conteúdo.
    Me dê um overview da empresa ${companyName}: o que ela faz, seu tamanho, mercado, e principais produtos. 
    Em seguida, aprofunde sobre sua cultura organizacional e valores. Inclua informações do site oficial, 
    entrevistas com fundadores ou funcionários, e reviews públicos como Glassdoor. 
    Há algo que indique o que essa empresa valoriza no dia a dia e como isso se traduz em práticas internas?`,
  
  [BRIEFING_CATEGORIES.MISSION_VISION]: (companyName: string, companyWebsite: string) => 
    `Utilize o nome da empresa ${companyName} e a URL institucional ${companyWebsite} para gerar este conteúdo.
    Primeiro, traga um resumo geral da empresa ${companyName}: setor de atuação, produtos, e posicionamento no mercado. 
    Depois, detalhe qual é a missão e visão da empresa, com base em fontes oficiais e declarações públicas de liderança. 
    Há alguma causa ou propósito maior guiando suas ações?`,
  
  [BRIEFING_CATEGORIES.PRODUCT_MARKET]: (companyName: string, companyWebsite: string) => 
    `Utilize o nome da empresa ${companyName} e a URL institucional ${companyWebsite} para gerar este conteúdo.
    Comece com um panorama da empresa ${companyName}: produtos e serviços oferecidos, público-alvo, e contexto de mercado. 
    Depois, explique qual é o perfil típico dos usuários ou clientes. Quais tipos de profissionais costumam usar ou 
    integrar esse produto? Em que setores essa solução é mais comum? Inclua também possíveis concorrentes ou ferramentas similares.`,
  
  [BRIEFING_CATEGORIES.LEADERSHIP]: (companyName: string, companyWebsite: string) => 
    `Utilize o nome da empresa ${companyName} e a URL institucional ${companyWebsite} para gerar este conteúdo.
    Forneça uma visão geral da empresa ${companyName}: o que ela faz, em que estágio está (startup, scale-up, enterprise) 
    e qual seu posicionamento no setor. Em seguida, descreva quem compõe o time de liderança (fundadores, CEO, CPO, etc). 
    Qual o histórico profissional dessas pessoas? Há entrevistas, podcasts ou artigos onde compartilham sua visão de negócio, 
    cultura ou liderança?`,
  
  [BRIEFING_CATEGORIES.COMPANY_HISTORY]: (companyName: string, companyWebsite: string) => 
    `Utilize o nome da empresa ${companyName} e a URL institucional ${companyWebsite} para gerar este conteúdo.
    Dê primeiro um resumo sobre a empresa ${companyName}: mercado, produto e tamanho atual. Em seguida, conte como a 
    empresa foi fundada: quem são os fundadores, qual foi a motivação ou problema que queriam resolver, e se há alguma 
    história marcante ou inspiradora sobre os primeiros passos da empresa.`
};

// Interface for the briefing content structure
export interface BriefingContent {
  overview: string;
  highlights: string[];
  summary: string;
}

// Fetch content from Perplexity API
export const fetchBriefingContent = async (
  category: string,
  companyName: string,
  companyWebsite: string,
  refresh = false
): Promise<BriefingContent> => {
  try {
    // Get the prompt for this category
    const prompt = perplexityPromptsByCategory[category](companyName, companyWebsite);
    
    // Call Perplexity API through our Edge Function
    const response = await fetch('/api/generate-briefing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        category,
        companyName,
        companyWebsite,
        refresh // Signal to bypass any caching on the backend
      }),
    });
    
    if (!response.ok) {
      throw new Error('Falha ao buscar informações da empresa');
    }
    
    const data = await response.json();
    
    return {
      overview: data.overview,
      highlights: data.highlights,
      summary: data.summary
    };
  } catch (error) {
    console.error('Erro ao buscar informações da empresa:', error);
    if (refresh) {
      toast.error('Não foi possível atualizar a análise. Tente novamente mais tarde.');
    }
    throw error;
  }
};
