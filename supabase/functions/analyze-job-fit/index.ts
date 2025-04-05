
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { generateJobFitAnalysis } from "./openaiService.ts";

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
    const { jobTitle, jobDescription, resumeText, coverLetterText, referenceText } = requestData;

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
    
    try {
      // Generate job fit analysis using OpenAI
      const fitAnalysisResult = await generateJobFitAnalysis({
        jobTitle, 
        jobDescription, 
        resumeText, 
        coverLetterText, 
        referenceText
      });

      console.log("Analysis complete");
      
      // Return the result
      return new Response(
        JSON.stringify(fitAnalysisResult),
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
