
/**
 * Extract structured analysis from the raw text returned by the AI
 */
export function extractStructuredAnalysis(text: string): any {
  // Default values
  const result = {
    compatibilityScore: "Análise Realizada",
    keySkills: [] as string[],
    relevantExperiences: [] as string[],
    identifiedGaps: [] as string[]
  };
  
  try {
    console.log("Extracting structured analysis from text:", text.substring(0, 200) + "...");
    
    // Try to extract a compatibility score
    const scoreMatch = text.match(/compatibility score:?\s*([\d.]+)%|compatibilidade:?\s*([\d.]+)%|pontuação:?\s*([\d.]+)%/i);
    if (scoreMatch) {
      const scoreValue = scoreMatch[1] || scoreMatch[2] || scoreMatch[3];
      const score = parseFloat(scoreValue);
      if (!isNaN(score)) {
        if (score >= 80) {
          result.compatibilityScore = `Alta Compatibilidade (${score}%)`;
        } else if (score >= 60) {
          result.compatibilityScore = `Compatibilidade Média (${score}%)`;
        } else {
          result.compatibilityScore = `Compatibilidade Baixa (${score}%)`;
        }
      }
    } else if (text.toLowerCase().includes("alta compatibilidade") || text.toLowerCase().includes("high compatibility")) {
      result.compatibilityScore = "Alta Compatibilidade";
    } else if (text.toLowerCase().includes("média compatibilidade") || text.toLowerCase().includes("medium compatibility")) {
      result.compatibilityScore = "Compatibilidade Média";
    } else if (text.toLowerCase().includes("baixa compatibilidade") || text.toLowerCase().includes("low compatibility")) {
      result.compatibilityScore = "Compatibilidade Baixa";
    }
    
    // Look for strengths, skills, or relevant sections
    const strengthsMatch = text.match(/Strengths|Pontos Fortes|Forças|Skills|Habilidades|:[\s\S]*?(?=Gaps|Lacunas|Missing|$)/i);
    if (strengthsMatch && strengthsMatch[0]) {
      const strengthsText = strengthsMatch[0].replace(/Strengths|Pontos Fortes|Forças|Skills|Habilidades|:|\*\*/gi, '').trim();
      // Extract bullet points
      const strengthBullets = strengthsText.split(/\n-|\n•|\n\*|\n\d+\./).filter(Boolean).map(s => s.trim());
      if (strengthBullets.length > 0) {
        result.keySkills = strengthBullets.slice(0, 5); // Limit to first 5 skills
      }
      
      // Try to find experiences separately, or use some skills as experiences if none found
      const expMatch = text.match(/Experience|Experiência|Background|Projects|Projetos|:[\s\S]*?(?=Gaps|Lacunas|Missing|Skills|Habilidades|$)/i);
      if (expMatch && expMatch[0]) {
        const expText = expMatch[0].replace(/Experience|Experiência|Background|Projects|Projetos|:|\*\*/gi, '').trim();
        const expBullets = expText.split(/\n-|\n•|\n\*|\n\d+\./).filter(Boolean).map(e => e.trim());
        if (expBullets.length > 0) {
          result.relevantExperiences = expBullets.slice(0, 5); // Limit to first 5 experiences
        } else {
          result.relevantExperiences = strengthBullets.slice(0, 3); // Use some skills as experiences if none found
        }
      } else {
        result.relevantExperiences = strengthBullets.slice(0, 3); // Use some skills as experiences if no separate section
      }
    }
    
    // Look for gaps section
    const gapsMatch = text.match(/Gaps|Lacunas|Missing|Areas for Improvement|Áreas para Melhorar|:[\s\S]*?(?=$)/i);
    if (gapsMatch && gapsMatch[0]) {
      const gapsText = gapsMatch[0].replace(/Gaps|Lacunas|Missing|Areas for Improvement|Áreas para Melhorar|:|\*\*/gi, '').trim();
      // Extract bullet points
      const gapBullets = gapsText.split(/\n-|\n•|\n\*|\n\d+\./).filter(Boolean).map(s => s.trim());
      if (gapBullets.length > 0) {
        result.identifiedGaps = gapBullets.slice(0, 5); // Limit to first 5 gaps
      }
    }
    
    // If we couldn't extract anything meaningful, set default values
    if (result.keySkills.length === 0) {
      result.keySkills = ["Análise de texto completa disponível abaixo"];
    }
    
    if (result.relevantExperiences.length === 0) {
      result.relevantExperiences = ["Consulte a análise completa para detalhes sobre experiências"];
    }
    
    if (result.identifiedGaps.length === 0) {
      result.identifiedGaps = ["Veja a análise detalhada para identificação de lacunas"];
    }
    
    return result;
  } catch (error) {
    console.error("Error extracting structured analysis:", error);
    // Return partial analysis
    return result;
  }
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
