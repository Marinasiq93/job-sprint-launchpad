
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
