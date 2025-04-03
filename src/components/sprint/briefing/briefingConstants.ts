
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
  [BRIEFING_CATEGORIES.CULTURE_VALUES]: "Valores e Cultura",
  [BRIEFING_CATEGORIES.MISSION_VISION]: "Propósito e Visão",
  [BRIEFING_CATEGORIES.PRODUCT_MARKET]: "Produto e Mercado",
  [BRIEFING_CATEGORIES.LEADERSHIP]: "Liderança e Gestão",
  [BRIEFING_CATEGORIES.COMPANY_HISTORY]: "História e Trajetória"
};

// Store default fallback content by category (used before API fetch or on error)
export const defaultContentByCategory = {
  [BRIEFING_CATEGORIES.CULTURE_VALUES]: {
    overview: "Carregando informações sobre os valores e cultura da empresa...",
    highlights: ["Carregando...", "Carregando...", "Carregando...", "Carregando...", "Carregando..."],
    summary: "Carregando análise de contexto...",
    sources: []
  },
  [BRIEFING_CATEGORIES.MISSION_VISION]: {
    overview: "Carregando informações sobre o propósito e visão da empresa...",
    highlights: ["Carregando...", "Carregando...", "Carregando...", "Carregando...", "Carregando..."],
    summary: "Carregando análise de contexto...",
    sources: []
  },
  [BRIEFING_CATEGORIES.PRODUCT_MARKET]: {
    overview: "Carregando informações sobre produto e mercado da empresa...",
    highlights: ["Carregando...", "Carregando...", "Carregando...", "Carregando...", "Carregando..."],
    summary: "Carregando análise de contexto...",
    sources: []
  },
  [BRIEFING_CATEGORIES.LEADERSHIP]: {
    overview: "Carregando informações sobre a liderança e gestão da empresa...",
    highlights: ["Carregando...", "Carregando...", "Carregando...", "Carregando...", "Carregando..."],
    summary: "Carregando análise de contexto...",
    sources: []
  },
  [BRIEFING_CATEGORIES.COMPANY_HISTORY]: {
    overview: "Carregando informações sobre a história e trajetória da empresa...",
    highlights: ["Carregando...", "Carregando...", "Carregando...", "Carregando...", "Carregando..."],
    summary: "Carregando análise de contexto...",
    sources: []
  }
};
