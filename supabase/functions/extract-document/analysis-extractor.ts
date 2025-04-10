/**
 * Extract structured information from text analysis
 */
export function extractStructuredAnalysis(text: string) {
  if (!text) {
    return {
      compatibilityScore: "N/A",
      keySkills: [],
      relevantExperiences: [],
      identifiedGaps: []
    };
  }
  
  // Try to extract compatibility score
  let compatibilityScore = "Análise Realizada";
  const scorePatterns = [
    /compatibilidade[:\s]+([0-9]+[.,]?[0-9]*\s*%|[a-záàâãéèêíïóôõöúüçñ]+ [a-záàâãéèêíïóôõöúüçñ]+)/i,
    /score[:\s]+([0-9]+[.,]?[0-9]*\s*%|[a-záàâãéèêíïóôõöúüçñ]+ [a-záàâãéèêíïóôõöúüçñ]+)/i,
    /pontuação[:\s]+([0-9]+[.,]?[0-9]*\s*%|[a-záàâãéèêíïóôõöúüçñ]+ [a-záàâãéèêíïóôõöúüçñ]+)/i,
    /fit[:\s]+([0-9]+[.,]?[0-9]*\s*%|[a-z]+ [a-z]+)/i
  ];
  
  for (const pattern of scorePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      compatibilityScore = match[1].trim();
      break;
    }
  }
  
  // Enhanced skill extraction
  const keySkills: string[] = [];
  const skillSections = text.match(/(?:habilidades|competências|skills|principais\s+pontos|principais\s+competências)[:\s]+(?:\n|.)+?(?=\n\s*\n|\n\s*[A-Z]|$)/gi);
  
  if (skillSections && skillSections.length > 0) {
    // Process each skills section
    for (const section of skillSections) {
      // Extract list items with various list markers
      const items = section.match(/(?:[-•*]\s*|\d+[.)\]]\s*|\n\s*)[A-Z][^-•*\n\.]*(?:\.[^-•*\n\.]+)?/g);
      if (items && items.length > 0) {
        items.forEach(item => {
          const cleanItem = item.replace(/[-•*\d+.)\]]/g, "").trim();
          if (cleanItem.length > 3 && !keySkills.includes(cleanItem)) {
            keySkills.push(cleanItem);
          }
        });
      } else {
        // If no list items found, try splitting by commas or newlines
        const text = section.replace(/(?:habilidades|competências|skills|principais\s+pontos|principais\s+competências)[:\s]+/i, "");
        const parts = text.split(/[,\n]/).map(p => p.trim()).filter(p => 
          p.length > 3 && 
          !/^(?:habilidades|competências|skills)$/i.test(p)
        );
        
        parts.forEach(part => {
          if (!keySkills.includes(part)) {
            keySkills.push(part);
          }
        });
      }
    }
  }
  
  // If no skills extracted yet, try another approach
  if (keySkills.length === 0) {
    // Look for colon-separated lists
    const skillColonList = text.match(/(?:habilidades|competências|skills)[:\s]+([^\.]+)/i);
    if (skillColonList && skillColonList[1]) {
      const skills = skillColonList[1].split(/[,;]/).map(s => s.trim()).filter(s => s.length > 3);
      skills.forEach(skill => keySkills.push(skill));
    }
  }
  
  // Extract experiences with a similar approach
  const relevantExperiences: string[] = [];
  const experienceSections = text.match(/(?:experiências|experiência|experience|projetos relevantes|experiência relevante)[:\s]+(?:\n|.)+?(?=\n\s*\n|\n\s*[A-Z]|$)/gi);
  
  if (experienceSections && experienceSections.length > 0) {
    for (const section of experienceSections) {
      // Extract list items
      const items = section.match(/(?:[-•*]\s*|\d+[.)\]]\s*|\n\s*)[A-Z][^-•*\n\.]*(?:\.[^-•*\n\.]+)?/g);
      if (items && items.length > 0) {
        items.forEach(item => {
          const cleanItem = item.replace(/[-•*\d+.)\]]/g, "").trim();
          if (cleanItem.length > 3 && !relevantExperiences.includes(cleanItem)) {
            relevantExperiences.push(cleanItem);
          }
        });
      } else {
        // If no list items found, try splitting by periods or newlines
        const text = section.replace(/(?:experiências|experiência|experience|projetos relevantes|experiência relevante)[:\s]+/i, "");
        const parts = text.split(/[.\n]/).map(p => p.trim()).filter(p => 
          p.length > 3 && 
          !/^(?:experiências|experiência|experience)$/i.test(p)
        );
        
        parts.forEach(part => {
          if (!relevantExperiences.includes(part)) {
            relevantExperiences.push(part);
          }
        });
      }
    }
  }
  
  // Extract gaps
  const identifiedGaps: string[] = [];
  const gapSections = text.match(/(?:lacunas|gaps|áreas de desenvolvimento|pontos fracos|melhorias|deficiências)[:\s]+(?:\n|.)+?(?=\n\s*\n|\n\s*[A-Z]|$)/gi);
  
  if (gapSections && gapSections.length > 0) {
    for (const section of gapSections) {
      // Extract list items
      const items = section.match(/(?:[-•*]\s*|\d+[.)\]]\s*|\n\s*)[A-Z][^-•*\n\.]*(?:\.[^-•*\n\.]+)?/g);
      if (items && items.length > 0) {
        items.forEach(item => {
          const cleanItem = item.replace(/[-•*\d+.)\]]/g, "").trim();
          if (cleanItem.length > 3 && !identifiedGaps.includes(cleanItem)) {
            identifiedGaps.push(cleanItem);
          }
        });
      } else {
        // If no list items found, try splitting by periods or newlines
        const text = section.replace(/(?:lacunas|gaps|áreas de desenvolvimento|pontos fracos|melhorias|deficiências)[:\s]+/i, "");
        const parts = text.split(/[.\n]/).map(p => p.trim()).filter(p => 
          p.length > 3 && 
          !/^(?:lacunas|gaps|áreas de desenvolvimento|pontos fracos|melhorias|deficiências)$/i.test(p)
        );
        
        parts.forEach(part => {
          if (!identifiedGaps.includes(part)) {
            identifiedGaps.push(part);
          }
        });
      }
    }
  }
  
  // Ensure we have some minimum content
  if (keySkills.length === 0) {
    const skills = extractKeywordsFromText(text, ["programação", "desenvolvimento", "gestão", "análise", "design"]);
    skills.forEach(skill => keySkills.push(skill));
  }
  
  if (relevantExperiences.length === 0) {
    const exps = extractKeywordsFromText(text, ["experiência", "projeto", "trabalhou", "desenvolveu", "implementou", "liderou"]);
    exps.forEach(exp => relevantExperiences.push(exp));
  }
  
  if (identifiedGaps.length === 0) {
    const gaps = extractKeywordsFromText(text, ["falta", "ausência", "melhorar", "desenvolver", "aprimorar", "limitação"]);
    gaps.forEach(gap => identifiedGaps.push(gap));
  }
  
  // Limit the number of items in each array to keep the UI clean
  const limitItems = (items: string[], limit: number = 5): string[] => {
    return items.slice(0, limit);
  };
  
  return {
    compatibilityScore,
    keySkills: limitItems(keySkills),
    relevantExperiences: limitItems(relevantExperiences),
    identifiedGaps: limitItems(identifiedGaps)
  };
}

/**
 * Helper function to extract keywords from text when structured extraction fails
 */
function extractKeywordsFromText(text: string, keywords: string[], limit: number = 5): string[] {
  const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);
  const result: string[] = [];
  
  // Extract sentences containing keywords
  for (const keyword of keywords) {
    for (const sentence of sentences) {
      if (sentence.toLowerCase().includes(keyword.toLowerCase()) && !result.includes(sentence.trim())) {
        const trimmed = sentence.trim();
        if (trimmed.length > 5 && trimmed.length < 100) {
          result.push(trimmed);
          if (result.length >= limit) break;
        }
      }
    }
    if (result.length >= limit) break;
  }
  
  // If we don't have enough results, add some generic ones
  if (result.length === 0) {
    result.push("Não foi possível extrair informações específicas do texto fornecido");
    result.push("Considere fornecer um currículo mais detalhado para análise");
  }
  
  return result;
}

/**
 * Create a minimal fallback response when required data is missing
 */
export function createMissingDataResponse(errorMessage = ""): Response {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
  
  return new Response(
    JSON.stringify({ 
      compatibilityScore: "Análise incompleta",
      keySkills: ["Não foi possível analisar as habilidades"],
      relevantExperiences: ["Sem dados suficientes para análise de experiência"],
      identifiedGaps: ["Adicione mais detalhes ao seu currículo para uma análise completa"],
      fallbackAnalysis: true,
      error: errorMessage || "Dados de entrada insuficientes para análise completa"
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }}
  );
}

/**
 * Create an error response for unexpected errors
 */
export function createErrorResponse(error: Error): Response {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
  
  return new Response(
    JSON.stringify({ 
      compatibilityScore: "Erro interno",
      keySkills: ["Falha no processamento"],
      relevantExperiences: ["Erro técnico na análise"],
      identifiedGaps: ["Tente novamente mais tarde"],
      fallbackAnalysis: true,
      error: error.message || "Erro inesperado no servidor",
      rawAnalysis: "Um erro inesperado ocorreu durante o processamento. Nossa equipe técnica foi notificada."
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
  );
}
