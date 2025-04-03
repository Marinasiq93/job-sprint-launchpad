// Define content categories for briefings
export const BRIEFING_CATEGORIES = {
  CULTURE_VALUES: 'culture_values',
  MISSION_VISION: 'mission_vision',
  PRODUCT_MARKET: 'product_market',
  LEADERSHIP: 'leadership',
  COMPANY_HISTORY: 'company_history'
};

// Define the mapping between questions and briefing categories
// This allows multiple questions to reference the same briefing without duplication
export const questionToBriefingMap = [
  BRIEFING_CATEGORIES.CULTURE_VALUES,    // Question 0: "Você se sente alinhado com a cultura e os valores da empresa?"
  BRIEFING_CATEGORIES.MISSION_VISION,    // Question 1: "Você se identifica com a missão da empresa?"
  BRIEFING_CATEGORIES.PRODUCT_MARKET,    // Question 2: "Você tem alguma conexão pessoal ou profissional com o produto...?"
  BRIEFING_CATEGORIES.LEADERSHIP,        // Question 3: "Você vê o time de liderança como alguém em quem confiaria...?"
  BRIEFING_CATEGORIES.COMPANY_HISTORY    // Question 4: "Algum pensamento ou conexão sobre a história da fundação...?"
];

// Category titles for UI display
export const categoryTitles = {
  [BRIEFING_CATEGORIES.CULTURE_VALUES]: "Cultura e Valores",
  [BRIEFING_CATEGORIES.MISSION_VISION]: "Missão e Visão",
  [BRIEFING_CATEGORIES.PRODUCT_MARKET]: "Produto e Mercado",
  [BRIEFING_CATEGORIES.LEADERSHIP]: "Time de Liderança",
  [BRIEFING_CATEGORIES.COMPANY_HISTORY]: "História da Empresa"
};

// Store default fallback content by category (used before API fetch or on error)
export const defaultContentByCategory = {
  [BRIEFING_CATEGORIES.CULTURE_VALUES]: {
    overview: "Carregando informações sobre a cultura e valores da empresa...",
    highlights: ["Carregando...", "Carregando...", "Carregando...", "Carregando...", "Carregando..."],
    summary: "Carregando análise de contexto...",
    sources: []
  },
  [BRIEFING_CATEGORIES.MISSION_VISION]: {
    overview: "Carregando informações sobre a missão e visão da empresa...",
    highlights: ["Carregando...", "Carregando...", "Carregando...", "Carregando...", "Carregando..."],
    summary: "Carregando análise de contexto...",
    sources: []
  },
  [BRIEFING_CATEGORIES.PRODUCT_MARKET]: {
    overview: "Carregando informações sobre produtos e mercado da empresa...",
    highlights: ["Carregando...", "Carregando...", "Carregando...", "Carregando...", "Carregando..."],
    summary: "Carregando análise de contexto...",
    sources: []
  },
  [BRIEFING_CATEGORIES.LEADERSHIP]: {
    overview: "Carregando informações sobre a liderança da empresa...",
    highlights: ["Carregando...", "Carregando...", "Carregando...", "Carregando...", "Carregando..."],
    summary: "Carregando análise de contexto...",
    sources: []
  },
  [BRIEFING_CATEGORIES.COMPANY_HISTORY]: {
    overview: "Carregando informações sobre a história da empresa...",
    highlights: ["Carregando...", "Carregando...", "Carregando...", "Carregando...", "Carregando..."],
    summary: "Carregando análise de contexto...",
    sources: []
  }
};
