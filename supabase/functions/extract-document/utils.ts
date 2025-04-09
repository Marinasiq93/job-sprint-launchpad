
// CORS headers for all responses
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Get Eden AI API key from environment variables
export const EDEN_AI_API_KEY = Deno.env.get("EDEN_AI_API_KEY");

// Check if API key is properly set
export function validateAPIKey() {
  if (!EDEN_AI_API_KEY || EDEN_AI_API_KEY.length < 20) {
    console.error("Eden AI API key issue:", EDEN_AI_API_KEY ? "Key too short" : "Key not found");
    return false;
  }
  return true;
}

// Create standardized error response
export function createErrorResponse(error: Error, status = 500) {
  console.error("Error in edge function:", error.message);
  
  return new Response(
    JSON.stringify({ 
      success: false,
      error: error.message,
      fallbackAnalysis: true,
      compatibilityScore: "Erro na Análise",
      keySkills: ["Não foi possível processar a análise"],
      relevantExperiences: ["Ocorreu um erro no processamento"],
      identifiedGaps: ["Tente novamente mais tarde"]
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status }
  );
}

// Create standardized missing data response
export function createMissingDataResponse(message: string) {
  return new Response(
    JSON.stringify({ 
      success: false,
      error: message,
      fallbackAnalysis: true,
      compatibilityScore: "Dados Insuficientes",
      keySkills: ["Dados insuficientes para análise"],
      relevantExperiences: ["Forneça informações completas"],
      identifiedGaps: ["Verifique os dados informados"]
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
  );
}
