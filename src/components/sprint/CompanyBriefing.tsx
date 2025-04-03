
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RefreshCw } from "lucide-react";
import { toast } from "@/lib/toast";

interface CompanyBriefingProps {
  companyName: string;
  companyWebsite: string;
  jobDescription: string;
  currentQuestionIndex: number;
}

// Define content categories for briefings
const BRIEFING_CATEGORIES = {
  CULTURE_VALUES: 'culture_values',
  MISSION_VISION: 'mission_vision',
  PRODUCT_MARKET: 'product_market',
  LEADERSHIP: 'leadership',
  COMPANY_HISTORY: 'company_history'
};

// Define the mapping between questions and briefing categories
// This allows multiple questions to reference the same briefing without duplication
const questionToBriefingMap = [
  BRIEFING_CATEGORIES.CULTURE_VALUES,    // Question 0: "Você se sente alinhado com a cultura e os valores da empresa?"
  BRIEFING_CATEGORIES.MISSION_VISION,    // Question 1: "Você se identifica com a missão da empresa?"
  BRIEFING_CATEGORIES.PRODUCT_MARKET,    // Question 2: "Você tem alguma conexão pessoal ou profissional com o produto...?"
  BRIEFING_CATEGORIES.LEADERSHIP,        // Question 3: "Você vê o time de liderança como alguém em quem confiaria...?"
  BRIEFING_CATEGORIES.COMPANY_HISTORY    // Question 4: "Algum pensamento ou conexão sobre a história da fundação...?"
];

// Perplexity prompts for each category
const perplexityPromptsByCategory = {
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

// Category titles for UI display
const categoryTitles = {
  [BRIEFING_CATEGORIES.CULTURE_VALUES]: "Cultura e Valores",
  [BRIEFING_CATEGORIES.MISSION_VISION]: "Missão e Visão",
  [BRIEFING_CATEGORIES.PRODUCT_MARKET]: "Produto e Mercado",
  [BRIEFING_CATEGORIES.LEADERSHIP]: "Time de Liderança",
  [BRIEFING_CATEGORIES.COMPANY_HISTORY]: "História da Empresa"
};

// Store default fallback content by category (used before API fetch or on error)
const defaultContentByCategory = {
  [BRIEFING_CATEGORIES.CULTURE_VALUES]: {
    overview: "Carregando informações sobre a cultura e valores da empresa...",
    highlights: [
      "Valores e princípios organizacionais",
      "Ambiente de trabalho e cultura interna",
      "Práticas e políticas de colaboração",
      "Compromissos sociais e ambientais",
      "Testimunhos de funcionários"
    ],
    summary: "A cultura de uma empresa define como as pessoas trabalham juntas e quais comportamentos são valorizados no dia a dia."
  },
  [BRIEFING_CATEGORIES.MISSION_VISION]: {
    overview: "Carregando informações sobre a missão e visão da empresa...",
    highlights: [
      "Propósito e objetivos de longo prazo",
      "Impacto pretendido no mercado e sociedade",
      "Compromissos com stakeholders",
      "Metas de crescimento e expansão",
      "Valores que guiam a tomada de decisão"
    ],
    summary: "A missão expressa o propósito principal da empresa, enquanto a visão descreve onde ela pretende chegar no futuro."
  },
  [BRIEFING_CATEGORIES.PRODUCT_MARKET]: {
    overview: "Carregando informações sobre os produtos, serviços e mercado...",
    highlights: [
      "Principais produtos e serviços oferecidos",
      "Público-alvo e necessidades atendidas",
      "Diferenciação competitiva no mercado",
      "Tendências do setor e oportunidades",
      "Concorrentes diretos e indiretos"
    ],
    summary: "Compreender o posicionamento de mercado e o valor oferecido aos clientes ajuda a contextualizar sua contribuição potencial."
  },
  [BRIEFING_CATEGORIES.LEADERSHIP]: {
    overview: "Carregando informações sobre o time de liderança da empresa...",
    highlights: [
      "Fundadores e história de fundação",
      "Experiência e trajetória dos executivos",
      "Estilo de liderança e comunicação",
      "Visão estratégica para o negócio",
      "Presença pública e comunicação externa"
    ],
    summary: "A liderança define o tom e a direção da empresa, influenciando diretamente sua cultura e resultados."
  },
  [BRIEFING_CATEGORIES.COMPANY_HISTORY]: {
    overview: "Carregando informações sobre a história e origem da empresa...",
    highlights: [
      "Contexto da fundação e motivação inicial",
      "Desafios enfrentados nos primeiros anos",
      "Marcos significativos de crescimento",
      "Pivôs e mudanças estratégicas importantes",
      "Evolução da proposta de valor ao longo do tempo"
    ],
    summary: "Conhecer a história da empresa oferece insights valiosos sobre seus valores e prioridades atuais."
  }
};

const CompanyBriefing = ({ companyName, companyWebsite, jobDescription, currentQuestionIndex }: CompanyBriefingProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [briefingCache, setBriefingCache] = useState<Record<string, any>>({});

  // Get the current briefing category based on the question index
  const currentBriefingCategory = questionToBriefingMap[currentQuestionIndex] || BRIEFING_CATEGORIES.CULTURE_VALUES;
  
  // Get the cached briefing or use default content
  const currentBriefing = briefingCache[currentBriefingCategory] || defaultContentByCategory[currentBriefingCategory];

  // Fetch content from Perplexity API
  const fetchBriefingContent = async (category: string) => {
    // If we already have cached data for this category, use it
    if (briefingCache[category]) {
      return briefingCache[category];
    }

    setIsLoading(true);
    
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
          companyWebsite
        }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao buscar informações da empresa');
      }
      
      const data = await response.json();
      
      // Parse and structure the response
      const briefingData = {
        overview: data.overview || defaultContentByCategory[category].overview,
        highlights: data.highlights || defaultContentByCategory[category].highlights,
        summary: data.summary || defaultContentByCategory[category].summary
      };
      
      // Cache the result
      setBriefingCache(prev => ({
        ...prev,
        [category]: briefingData
      }));
      
      setIsLoading(false);
      return briefingData;
    } catch (error) {
      console.error('Erro ao buscar informações da empresa:', error);
      toast.error('Não foi possível carregar as informações da empresa. Usando dados padrão.');
      setIsLoading(false);
      
      // Return default content if API call fails
      return defaultContentByCategory[category];
    }
  };

  const handleRefreshAnalysis = async () => {
    // When the refresh button is clicked, fetch fresh data for the current category
    // This will clear the cache for this specific category
    setIsLoading(true);
    
    try {
      // Get the prompt for this category
      const prompt = perplexityPromptsByCategory[currentBriefingCategory](companyName, companyWebsite);
      
      // Call Perplexity API through our Edge Function with cache-busting parameter
      const response = await fetch('/api/generate-briefing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          category: currentBriefingCategory,
          companyName,
          companyWebsite,
          refresh: true // Signal to bypass any caching on the backend
        }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao atualizar informações da empresa');
      }
      
      const data = await response.json();
      
      // Parse and structure the response
      const briefingData = {
        overview: data.overview || defaultContentByCategory[currentBriefingCategory].overview,
        highlights: data.highlights || defaultContentByCategory[currentBriefingCategory].highlights,
        summary: data.summary || defaultContentByCategory[currentBriefingCategory].summary
      };
      
      // Update the cache with new data
      setBriefingCache(prev => ({
        ...prev,
        [currentBriefingCategory]: briefingData
      }));
      
      toast.success('Análise atualizada com sucesso!');
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao atualizar análise:', error);
      toast.error('Não foi possível atualizar a análise. Tente novamente mais tarde.');
      setIsLoading(false);
    }
  };

  // Fetch briefing content on initial render and when category changes
  useEffect(() => {
    fetchBriefingContent(currentBriefingCategory);
  }, [currentBriefingCategory, companyName, companyWebsite]);

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Análise da Empresa</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={handleRefreshAnalysis}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Atualizar análise</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="space-y-4">
          <section>
            <h3 className="font-medium text-sm text-muted-foreground mb-2">{categoryTitles[currentBriefingCategory]}</h3>
            <p className="text-sm">
              {currentBriefing.overview}
            </p>
          </section>
          
          <Separator />
          
          <section>
            <h3 className="font-medium text-sm text-muted-foreground mb-2">Pontos Principais</h3>
            <ul className="text-sm space-y-1 list-disc pl-5">
              {currentBriefing.highlights.map((highlight, index) => (
                <li key={index}>{highlight}</li>
              ))}
            </ul>
          </section>
          
          <Separator />
          
          <section>
            <h3 className="font-medium text-sm text-muted-foreground mb-2">Análise de Contexto</h3>
            <p className="text-sm">
              {currentBriefing.summary}
            </p>
          </section>
        </div>
      </CardContent>
    </div>
  );
};

export default CompanyBriefing;
