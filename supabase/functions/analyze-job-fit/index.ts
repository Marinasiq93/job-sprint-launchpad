
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { generateJobFitAnalysis } from "./openaiService.ts";
import { AnalysisInput } from "./types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received analyze-job-fit request");
    const requestData = await req.json();
    const { jobTitle, jobDescription, resumeText, coverLetterText, referenceText, debug } = requestData;

    // Validate required fields
    if (!jobTitle || !jobDescription) {
      console.error("Missing job information:", { 
        hasJobTitle: !!jobTitle, 
        hasJobDescription: !!jobDescription
      });
      
      return new Response(
        JSON.stringify({ 
          error: "Missing job information: title and description are required" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }
    
    // Check for resume text
    if (!resumeText || (typeof resumeText === 'string' && resumeText.trim().length < 10)) {
      console.error("Missing or insufficient resume text. Length:", resumeText?.length || 0);
      
      return new Response(
        JSON.stringify({ 
          error: "Missing or insufficient resume text. Please ensure your resume is properly uploaded in your profile." 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    console.log("Analyzing job fit for:", jobTitle);
    console.log("Resume text length:", resumeText.length);
    console.log("Cover letter text provided:", !!coverLetterText);
    console.log("Reference text provided:", !!referenceText);
    
    // Log request details if in debug mode
    if (debug) {
      console.log("DEBUG MODE ENABLED - Request Content Preview:");
      console.log("Job Title:", jobTitle);
      console.log("Job Description (first 100 chars):", jobDescription.substring(0, 100) + "...");
      console.log("Resume Text (first 100 chars):", resumeText.substring(0, 100) + "...");
      
      if (coverLetterText) {
        console.log("Cover Letter Text (first 100 chars):", coverLetterText.substring(0, 100) + "...");
      }
      
      if (referenceText) {
        console.log("Reference Text (first 100 chars):", referenceText.substring(0, 100) + "...");
      }
    }
    
    try {
      // Generate job fit analysis using OpenAI
      const analysisInput: AnalysisInput = {
        jobTitle, 
        jobDescription, 
        resumeText, 
        coverLetterText, 
        referenceText
      };
      
      const fitAnalysisResult = await generateJobFitAnalysis(analysisInput);

      console.log("Analysis complete");
      
      // Include input data summary in debug mode
      const response = {
        ...fitAnalysisResult,
        inputSummary: debug ? {
          jobTitleLength: jobTitle.length,
          jobDescriptionLength: jobDescription.length,
          resumeTextLength: resumeText.length,
          coverLetterTextLength: coverLetterText?.length || 0,
          referenceTextLength: referenceText?.length || 0
        } : undefined
      };
      
      // Return the result
      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (analyzeError) {
      console.error("Error in analysis:", analyzeError);
      
      return new Response(
        JSON.stringify({ 
          error: analyzeError.message || "Error generating analysis",
          fallbackAnalysis: {
            compatibilityScore: "Não foi possível calcular (N/A)",
            keySkills: [
              "Não foi possível extrair habilidades do perfil",
              "É recomendado revisar seu currículo",
              "Verifique se seu perfil está com dados atualizados",
              "Tente novamente mais tarde",
              "Contate o suporte se o problema persistir"
            ],
            relevantExperiences: [
              "Não foi possível extrair experiências relevantes",
              "Verifique se seu currículo contém informações sobre experiências anteriores",
              "Tente adicionar mais detalhes sobre projetos realizados",
              "Inclua informações sobre cargos e responsabilidades",
              "Descreva realizações e resultados obtidos"
            ],
            identifiedGaps: [
              "Não foi possível identificar lacunas",
              "Recomendamos verificar a descrição da vaga",
              "Compare com suas experiências e habilidades",
              "Procure por requisitos técnicos e comportamentais",
              "Identifique áreas para desenvolvimento"
            ]
          }
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 // Return 200 even with fallback to avoid frontend errors
        }
      );
    }

  } catch (error) {
    console.error("Error in analyze-job-fit function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Internal server error",
        errorDetails: typeof error === 'object' ? JSON.stringify(error) : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
