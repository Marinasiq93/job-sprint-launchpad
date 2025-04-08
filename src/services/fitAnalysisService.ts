
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
    
    // Prepare the request payload for our job fit workflow
    const requestData = {
      resumeBase64,
      resumeType,
      resumeName,
      jobDescription,
      jobTitle,
      coverLetterText,
      referenceText,
      debug
    };
    
    // Log document text lengths for debugging
    console.log("Document text lengths:", {
      jobTitleLength: jobTitle?.length || 0,
      jobDescriptionLength: jobDescription?.length || 0,
      resumeTextLength: resumeBase64?.length || 0,
      coverLetterTextLength: coverLetterText?.length || 0,
      referenceTextLength: referenceText?.length || 0
    });
    
    // Call the edge function with the '/job-fit' path parameter
    // Fix: Use params instead of query for routing parameter in function invoke
    const { data, error } = await supabase.functions.invoke('extract-document', {
      body: requestData,
      headers: {
        'Content-Type': 'application/json'
      },
      params: { route: 'job-fit' }
    });
    
    if (error) {
      console.error("Edge function error:", error);
      throw new Error(error.message || "Erro na função de análise");
    }
    
    if (!data) {
      console.error("No data returned from edge function");
      throw new Error("Nenhum dado retornado da análise");
    }
    
    return data as FitAnalysisResult;
  }
};
