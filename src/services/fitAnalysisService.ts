
import { supabase } from "@/integrations/supabase/client";
import { FitAnalysisResult } from "@/types/fitAnalysis";

/**
 * Service for job fit analysis
 */
export const fitAnalysisService = {
  /**
   * Generate a fit analysis based on resume data and job description
   */
  generateFitAnalysis: async (
    resumeBase64: string,
    resumeType: string,
    resumeName: string,
    jobDescription: string,
    jobTitle?: string,
    coverLetterText?: string,
    referenceText?: string,
    debug?: boolean
  ): Promise<FitAnalysisResult> => {
    console.log("Calling extract-document/job-fit edge function...");
    
    // Check if resume data is valid before making the request
    if (!resumeBase64 || resumeBase64.length < 100) {
      console.warn("Resume data is too short or empty:", resumeBase64?.length);
      return {
        compatibilityScore: "Análise Limitada",
        keySkills: ["Conteúdo do currículo insuficiente para análise completa"],
        relevantExperiences: ["Adicione mais detalhes ao seu currículo para melhorar os resultados"],
        identifiedGaps: ["Recomendamos adicionar mais informações sobre experiências e habilidades"],
        fallbackAnalysis: true,
        error: "Conteúdo do currículo insuficiente"
      };
    }
    
    // Prepare the request payload for our job fit workflow
    const requestData = {
      resumeBase64,
      resumeType,
      resumeName,
      jobDescription,
      jobTitle,
      coverLetterText,
      referenceText,
      debug,
      route: 'job-fit' // Include route in the request body
    };
    
    // Log document text lengths for debugging
    console.log("Document text lengths:", {
      jobTitleLength: jobTitle?.length || 0,
      jobDescriptionLength: jobDescription?.length || 0,
      resumeTextLength: resumeBase64?.length || 0,
      coverLetterTextLength: coverLetterText?.length || 0,
      referenceTextLength: referenceText?.length || 0
    });
    
    try {
      // Call the edge function with route in the body
      const { data, error } = await supabase.functions.invoke('extract-document', {
        body: requestData
      });
      
      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Erro na função de análise");
      }
      
      if (!data) {
        console.error("No data returned from edge function");
        throw new Error("Nenhum dado retornado da análise");
      }
      
      // Check if response contains error but still has fallback analysis
      if (data.error && data.fallbackAnalysis) {
        console.warn("Received fallback analysis due to error:", data.error);
        // We'll still return the fallback data, but log the error
      }
      
      return data as FitAnalysisResult;
    } catch (error) {
      console.error("Error in fit analysis service:", error);
      
      // Return a user-friendly error response
      return {
        compatibilityScore: "Erro na Análise",
        keySkills: ["Não foi possível analisar habilidades"],
        relevantExperiences: ["Erro ao processar experiências"],
        identifiedGaps: ["Tente novamente mais tarde"],
        fallbackAnalysis: true,
        error: error instanceof Error ? error.message : "Erro desconhecido na análise",
        rawAnalysis: "Ocorreu um erro ao processar sua análise. Por favor, tente novamente."
      };
    }
  }
};
