
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
    // Look for strengths section
    const strengthsMatch = text.match(/Strengths|Pontos Fortes|Forças|:[\s\S]*?(?=Gaps|Lacunas|Missing|$)/i);
    if (strengthsMatch && strengthsMatch[0]) {
      const strengthsText = strengthsMatch[0].replace(/Strengths|Pontos Fortes|Forças|:|\*\*/gi, '').trim();
      // Extract bullet points
      const strengthBullets = strengthsText.split(/\n-|\n•|\n\*/).filter(Boolean).map(s => s.trim());
      if (strengthBullets.length > 0) {
        result.keySkills = strengthBullets.slice(0, 5); // Limit to first 5 skills
        result.relevantExperiences = strengthBullets.slice(0, 5); // Use some strengths for experiences too
      }
    }
    
    // Look for gaps section
    const gapsMatch = text.match(/Gaps|Lacunas|Missing[\s\S]*?(?=$)/i);
    if (gapsMatch && gapsMatch[0]) {
      const gapsText = gapsMatch[0].replace(/Gaps|Lacunas|Missing|:|\*\*/gi, '').trim();
      // Extract bullet points
      const gapBullets = gapsText.split(/\n-|\n•|\n\*/).filter(Boolean).map(s => s.trim());
      if (gapBullets.length > 0) {
        result.identifiedGaps = gapBullets.slice(0, 5); // Limit to first 5 gaps
      }
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
export function createMissingDataResponse(): Response {
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
      error: "Dados de entrada insuficientes para análise completa"
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
      error: "Erro inesperado no servidor",
      rawAnalysis: "Um erro inesperado ocorreu durante o processamento. Nossa equipe técnica foi notificada."
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
  );
}
