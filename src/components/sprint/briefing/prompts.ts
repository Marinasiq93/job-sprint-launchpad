
import { BRIEFING_CATEGORIES } from "./briefingConstants";

// Perplexity prompts for each category
export const perplexityPromptsByCategory = {
  [BRIEFING_CATEGORIES.CULTURE_VALUES]: (companyName: string, companyWebsite: string) => 
    `Utilize o nome da empresa ${companyName} e a URL institucional ${companyWebsite} para gerar este conteúdo.
    Visite especificamente o site institucional da empresa ${companyWebsite} para esta análise.
    
    Comece com um breve overview da empresa ${companyName}: o que ela faz, seu tamanho, mercado, e principais produtos.
    
    Em seguida, FOQUE A MAIOR PARTE da sua análise nos VALORES CORPORATIVOS da empresa:
    * Quais são os princípios e VALORES EXPLICITAMENTE DECLARADOS no site da empresa?
    * Como esses valores se traduzem na cultura organizacional?
    * Busque informações específicas sobre valores como: inovação, diversidade, sustentabilidade, 
      transparência, trabalho em equipe, foco no cliente, etc.
    * Mencione exemplos concretos de como esses valores são aplicados na prática.
    * Extraia CITAÇÕES DIRETAS do site sobre valores, se disponíveis.
    
    Inclua também:
    * Informações do site oficial (seção "Sobre Nós", "Missão/Visão/Valores", "Cultura", etc.)
    * Entrevistas com fundadores ou executivos que mencionem valores
    * Reviews de funcionários no Glassdoor sobre a cultura
    
    Finalize com 3 NOTÍCIAS RECENTES sobre a empresa (dos últimos 6 meses), incluindo data e fonte.`,
  
  [BRIEFING_CATEGORIES.MISSION_VISION]: (companyName: string, companyWebsite: string) => 
    `Utilize o nome da empresa ${companyName} e a URL institucional ${companyWebsite} para gerar este conteúdo.
    Visite especificamente o site institucional da empresa ${companyWebsite} para esta análise.
    
    Primeiro, traga um resumo geral da empresa ${companyName}: setor de atuação, produtos, e posicionamento no mercado. 
    
    Depois, detalhe com CITAÇÕES DIRETAS quando possível:
    * Qual é a MISSÃO declarada da empresa (seu propósito de existir)
    * Qual é a VISÃO declarada da empresa (onde quer chegar no futuro)
    * Há alguma causa ou propósito maior explicitamente mencionado?
    
    Busque essas informações prioritariamente no site institucional da empresa, em seções como "Sobre Nós", 
    "Quem Somos", "Missão e Visão", ou similares.
    
    Finalize com 3 NOTÍCIAS RECENTES sobre a empresa (dos últimos 6 meses), incluindo data e fonte.`,
  
  [BRIEFING_CATEGORIES.PRODUCT_MARKET]: (companyName: string, companyWebsite: string) => 
    `Utilize o nome da empresa ${companyName} e a URL institucional ${companyWebsite} para gerar este conteúdo.
    Visite especificamente o site institucional da empresa ${companyWebsite} para esta análise.
    
    Comece com um panorama da empresa ${companyName}: produtos e serviços oferecidos, público-alvo, e contexto de mercado. 
    
    Em seguida, explique detalhadamente:
    * Qual é o perfil típico dos usuários ou clientes?
    * Quais tipos de profissionais costumam usar ou integrar esse produto?
    * Em que setores essa solução é mais comum?
    * Quais são os principais concorrentes ou ferramentas similares?
    
    Consulte o site oficial da empresa, páginas de produtos, casos de uso, e depoimentos de clientes.
    
    Finalize com 3 NOTÍCIAS RECENTES sobre a empresa ou seus produtos (dos últimos 6 meses), incluindo data e fonte.`,
  
  [BRIEFING_CATEGORIES.LEADERSHIP]: (companyName: string, companyWebsite: string) => 
    `Utilize o nome da empresa ${companyName} e a URL institucional ${companyWebsite} para gerar este conteúdo.
    Visite especificamente o site institucional da empresa ${companyWebsite} para esta análise.
    
    Forneça uma visão geral da empresa ${companyName}: o que ela faz, em que estágio está (startup, scale-up, enterprise) 
    e qual seu posicionamento no setor. 
    
    Em seguida, descreva detalhadamente o time de liderança:
    * Quem são os fundadores, CEO, CPO, CTO, etc.?
    * Qual o histórico profissional dessas pessoas?
    * Há entrevistas, podcasts ou artigos onde compartilham sua visão de negócio, cultura ou liderança?
    * Mencione qualquer aspecto notável sobre o estilo de gestão.
    
    Busque essas informações no site da empresa (seção "Equipe", "Liderança", "Sobre Nós"), LinkedIn, 
    e entrevistas públicas.
    
    Finalize com 3 NOTÍCIAS RECENTES sobre a empresa ou sua liderança (dos últimos 6 meses), incluindo data e fonte.`,
  
  [BRIEFING_CATEGORIES.COMPANY_HISTORY]: (companyName: string, companyWebsite: string) => 
    `Utilize o nome da empresa ${companyName} e a URL institucional ${companyWebsite} para gerar este conteúdo.
    Visite especificamente o site institucional da empresa ${companyWebsite} para esta análise.
    
    Dê primeiro um resumo sobre a empresa ${companyName}: mercado, produto e tamanho atual. 
    
    Em seguida, conte a história da empresa de forma detalhada:
    * Quando e como a empresa foi fundada?
    * Quem são os fundadores e qual foi sua motivação inicial?
    * Quais foram os marcos importantes na trajetória da empresa?
    * Houve pivôs significativos ou mudanças de direção?
    * Mencione rodadas de investimento ou aquisições importantes.
    
    Busque essa cronologia no site da empresa (seção "História", "Sobre Nós", "Nossa Jornada"), 
    releases de imprensa, e plataformas como Crunchbase.
    
    Finalize com 3 NOTÍCIAS RECENTES sobre a empresa (dos últimos 6 meses), incluindo data e fonte.`
};
