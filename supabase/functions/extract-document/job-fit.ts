
import { callEdenAIWorkflow, processWorkflowResponse } from "./workflow.ts";
import { corsHeaders } from "./utils.ts";

// Define config for Eden AI workflow
const JOB_FIT_WORKFLOW_ID = "297546a6-33e9-460e-83bb-a6eeeabc3144"; // Your Eden AI workflow ID

/**
 * Handle job fit analysis request using Eden AI workflow
 */
export async function handleJobFitRequest(req: Request): Promise<Response> {
  try {
    // Parse the request body
    const data = await req.json();
    const { resumeBase64, resumeType, resumeName, jobDescription } = data;
    
    if (!resumeBase64 || !jobDescription) {
      console.warn("Missing input data - generating fallback response");
      
      // Generate a fallback response when required data is missing
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

    console.log(`Processing job fit analysis with workflow: ${JOB_FIT_WORKFLOW_ID}`);
    console.log(`Resume name: ${resumeName}, type: ${resumeType}, job description length: ${jobDescription.length}`);
    
    try {
      // Call the Eden AI workflow for job fit analysis
      const result = await callEdenAIWorkflow(
        resumeBase64,
        resumeType || "application/pdf", 
        JOB_FIT_WORKFLOW_ID,
        jobDescription
      );
      
      // Process the workflow response as job fit analysis
      const processedResult = processWorkflowResponse(result, resumeName || "resume.pdf", true);
      
      if (!processedResult || !processedResult.success) {
        console.error("Failed to process workflow response for job fit analysis");
        
        // Return a more user-friendly fallback response
        return new Response(
          JSON.stringify({ 
            compatibilityScore: "Não foi possível determinar",
            keySkills: ["Análise de habilidades indisponível"],
            relevantExperiences: ["Análise de experiências indisponível"],
            identifiedGaps: ["Tente novamente mais tarde ou adicione mais detalhes ao seu currículo"],
            fallbackAnalysis: true,
            error: "Falha no processamento da análise"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }}
        );
      }
      
      // Format the analysis result
      const analysisResult = processedResult.fit_analysis || {
        compatibilityScore: "N/A",
        keySkills: [],
        relevantExperiences: [],
        identifiedGaps: []
      };
      
      // Add input summary for debugging if needed
      if (data.debug) {
        analysisResult.inputSummary = {
          jobTitleLength: data.jobTitle?.length || 0,
          jobDescriptionLength: jobDescription?.length || 0,
          resumeTextLength: resumeBase64?.length || 0,
          coverLetterTextLength: data.coverLetterText?.length || 0,
          referenceTextLength: data.referenceText?.length || 0
        };
      }
      
      return new Response(
        JSON.stringify(analysisResult),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Error in job fit analysis workflow:", error);
      
      // Return a helpful fallback response
      return new Response(
        JSON.stringify({ 
          compatibilityScore: "Erro na análise",
          keySkills: ["Não foi possível processar as habilidades"],
          relevantExperiences: ["Erro na análise de experiências"],
          identifiedGaps: ["Tente novamente ou adicione mais detalhes ao seu currículo"],
          fallbackAnalysis: true,
          error: error.message || "Erro no processamento da análise"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }}
      );
    }
  } catch (error) {
    console.error("Unexpected error in job fit handler:", error);
    
    // Return a user-friendly error response
    return new Response(
      JSON.stringify({ 
        compatibilityScore: "Erro interno",
        keySkills: ["Falha no processamento"],
        relevantExperiences: ["Erro técnico na análise"],
        identifiedGaps: ["Tente novamente mais tarde"],
        fallbackAnalysis: true,
        error: "Erro inesperado no servidor"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }}
    );
  }
}
