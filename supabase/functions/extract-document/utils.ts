
// CORS headers for all responses
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Get Eden AI API key from environment variables
export const EDEN_AI_API_KEY = Deno.env.get("EDEN_AI_API_KEY");

// Add the missing cleanExtractedText function from textCleaner.ts
export const cleanExtractedText = (text: string): string => {
  return text
    .replace(/\\(\d{3}|n|r|t|b|f|\\|\(|\))/g, " ") // Replace escape sequences
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "")   // Keep only printable characters
    .replace(/\s+/g, " ")                    // Normalize whitespace
    .replace(/\( \)/g, " ")                  // Remove empty parentheses
    .replace(/\[\]/g, " ")                   // Remove empty brackets
    .replace(/\s+/g, " ")                    // Normalize whitespace again
    .trim();
};

// Check if API key is properly set with more detailed logging
export function validateAPIKey() {
  if (!EDEN_AI_API_KEY) {
    console.error("Eden AI API key issue: Key not found in environment variables");
    return false;
  }
  
  if (EDEN_AI_API_KEY.length < 20) {
    console.error("Eden AI API key issue: Key too short (length:", EDEN_AI_API_KEY.length, ")");
    return false;
  }
  
  // Log first and last 3 characters of key for debugging (without exposing full key)
  const keyStart = EDEN_AI_API_KEY.substring(0, 3);
  const keyEnd = EDEN_AI_API_KEY.substring(EDEN_AI_API_KEY.length - 3);
  console.log(`API key validated (starts with ${keyStart}..., ends with ...${keyEnd}), length: ${EDEN_AI_API_KEY.length}`);
  
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

