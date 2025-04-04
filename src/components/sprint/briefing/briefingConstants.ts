
export const BRIEFING_CATEGORIES = {
  CULTURE_VALUES: "culture_values",
  MISSION_VISION: "mission_vision",
  PRODUCT_MARKET: "product_market",
  LEADERSHIP: "leadership",
  COMPANY_HISTORY: "company_history",
};

// Map each question index to a briefing category
export const questionToBriefingMap: Record<number, string> = {
  0: BRIEFING_CATEGORIES.CULTURE_VALUES,
  1: BRIEFING_CATEGORIES.MISSION_VISION,
  2: BRIEFING_CATEGORIES.PRODUCT_MARKET,
  3: BRIEFING_CATEGORIES.LEADERSHIP,
  4: BRIEFING_CATEGORIES.COMPANY_HISTORY,
};

// Titles for each category
export const categoryTitles: Record<string, string> = {
  [BRIEFING_CATEGORIES.CULTURE_VALUES]: "Cultura e Valores",
  [BRIEFING_CATEGORIES.MISSION_VISION]: "Missão e Visão",
  [BRIEFING_CATEGORIES.PRODUCT_MARKET]: "Produto e Mercado",
  [BRIEFING_CATEGORIES.LEADERSHIP]: "Liderança",
  [BRIEFING_CATEGORIES.COMPANY_HISTORY]: "História da Empresa",
};

// Default content for each category if API is unavailable
export const defaultContentByCategory: Record<string, any> = {
  [BRIEFING_CATEGORIES.CULTURE_VALUES]: {
    overview: "Demonstração: Cultura e valores da empresa.",
    highlights: [
      "Valores fundamentais da empresa",
      "Como a cultura se manifesta no dia a dia",
      "Iniciativas que reforçam os valores",
      "Declarações da liderança sobre a cultura",
      "Prêmios ou reconhecimentos relacionados à cultura"
    ],
    summary: "Esta é uma versão de demonstração das informações de cultura e valores. Configure a API para análise completa.",
    sources: [],
    recentNews: []
  },
  [BRIEFING_CATEGORIES.MISSION_VISION]: {
    overview: "Demonstração: Missão, visão e propósito da empresa.",
    highlights: [
      "Missão oficial da empresa",
      "Visão de futuro declarada",
      "Propósito maior que a empresa busca atingir",
      "Citações inspiradoras da liderança sobre o propósito"
    ],
    summary: "A empresa demonstra seu compromisso com a missão através de vários projetos e iniciativas:",
    additionalPoints: [
      "Projetos alinhados ao propósito declarado",
      "Produtos que demonstram compromisso com a visão",
      "Iniciativas de impacto social ou ambiental",
      "Transformações que a empresa está gerando no setor"
    ],
    sources: [],
    recentNews: []
  },
  [BRIEFING_CATEGORIES.PRODUCT_MARKET]: {
    overview: "Demonstração: Informações sobre produto, mercado e público da empresa.",
    highlights: [
      "Principais produtos ou serviços oferecidos",
      "Perfil típico dos usuários ou clientes",
      "Setores de mercado onde a solução é mais utilizada",
      "Profissionais que costumam utilizar o produto",
      "Concorrentes ou ferramentas similares no mercado"
    ],
    summary: "Esta é uma versão de demonstração das informações de produto e mercado. Configure a API para análise completa.",
    sources: [],
    recentNews: []
  },
  [BRIEFING_CATEGORIES.LEADERSHIP]: {
    overview: "Demonstração: Informações sobre a liderança da empresa.",
    highlights: [
      "Nomes e cargos dos principais líderes",
      "Experiência profissional da liderança",
      "Estilo de liderança e valores promovidos",
      "Iniciativas lideradas pela equipe executiva",
      "Visão da liderança para o futuro da empresa"
    ],
    summary: "Esta é uma versão de demonstração das informações sobre a liderança. Configure a API para análise completa.",
    sources: [],
    recentNews: []
  },
  [BRIEFING_CATEGORIES.COMPANY_HISTORY]: {
    overview: "Demonstração: História da fundação e marcos importantes da empresa.",
    highlights: [
      "Ano e local de fundação",
      "Nomes dos fundadores e seus backgrounds",
      "Motivação original para a criação da empresa",
      "Principais marcos históricos da empresa",
      "Pivôs estratégicos no modelo de negócio"
    ],
    summary: "Esta é uma versão de demonstração da história da empresa. Configure a API para análise completa.",
    sources: [],
    recentNews: []
  },
};
