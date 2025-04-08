
import { callEdenAIWorkflow, processWorkflowResponse } from "./workflow.ts";
import { corsHeaders } from "./utils.ts";

// Define config for Eden AI workflow
const JOB_FIT_WORKFLOW_ID = "297546a6-33e9-460e-83bb-a6eeeabc3144"; // Eden AI workflow ID from your workflow export

/**
 * Handle job fit analysis request using Eden AI workflow
 */
export async function handleJobFitRequest(req: Request): Promise<Response> {
  try {
    console.log("Starting job fit analysis process");
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
    console.log(`Resume base64 data length: ${resumeBase64?.length || 0}`);
    
    try {
      // Prepare data for Eden AI workflow based on the workflow schema
      const workflowPayload = {
        workflow_id: JOB_FIT_WORKFLOW_ID,
        async: false,
        inputs: {
          Jobdescription: jobDescription,
          Resume: resumeBase64
        }
      };
      
      console.log("Calling Eden AI workflow with payload:", JSON.stringify({
        workflow_id: workflowPayload.workflow_id,
        async: workflowPayload.async,
        input_sizes: {
          jobDescription_length: jobDescription?.length || 0,
          resumeBase64_length: resumeBase64?.length || 0
        }
      }));
      
      // Call the Eden AI workflow with our prepared payload
      const result = await callEdenAIWorkflow(
        workflowPayload,
        JOB_FIT_WORKFLOW_ID
      );
      
      console.log("Eden AI workflow response received", JSON.stringify({
        has_result: !!result,
        result_type: result ? typeof result : 'undefined',
        has_job_fit_feedback: result?.job_fit_feedback ? true : false
      }));
      
      // Check if we got a valid response from Eden AI
      if (!result || !result.job_fit_feedback) {
        console.error("Invalid response from Eden AI workflow", JSON.stringify(result));
        
        // Return a more user-friendly fallback response
        return new Response(
          JSON.stringify({ 
            compatibilityScore: "Não foi possível determinar",
            keySkills: ["Análise de habilidades indisponível"],
            relevantExperiences: ["Análise de experiências indisponível"],
            identifiedGaps: ["Tente novamente mais tarde ou adicione mais detalhes ao seu currículo"],
            fallbackAnalysis: true,
            error: "Falha na comunicação com o serviço de análise",
            rawAnalysis: "Não foi possível obter análise detalhada devido a um erro de comunicação."
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }}
        );
      }
      
      // Process the response from Eden AI
      try {
        // Get the raw text from the workflow response
        const jobFitFeedbackText = result.job_fit_feedback;
        console.log("Job fit feedback text sample:", jobFitFeedbackText.substring(0, 100) + "...");
        
        // Try to extract structured information from the text
        const analysisResult = extractStructuredAnalysis(jobFitFeedbackText);
        
        // Add the raw analysis text to help with debugging
        analysisResult.rawAnalysis = jobFitFeedbackText;
        
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
        
        console.log("Analysis result generated successfully");
        return new Response(
          JSON.stringify(analysisResult),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (parsingError) {
        console.error("Error parsing Eden AI workflow response:", parsingError);
        
        // Return the raw text from Eden AI if we can't parse it properly
        return new Response(
          JSON.stringify({
            compatibilityScore: "Análise Realizada",
            keySkills: ["Veja a análise completa abaixo"],
            relevantExperiences: ["Análise detalhada disponível"],
            identifiedGaps: ["Consulte a análise completa abaixo"],
            rawAnalysis: result.job_fit_feedback || "Sem dados de análise disponíveis",
            fallbackAnalysis: false
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
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
          error: error.message || "Erro no processamento da análise",
          rawAnalysis: "Ocorreu um erro técnico ao processar sua análise. Por favor, tente novamente mais tarde."
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
        error: "Erro inesperado no servidor",
        rawAnalysis: "Um erro inesperado ocorreu durante o processamento. Nossa equipe técnica foi notificada."
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }}
    );
  }
}

/**
 * Extract structured analysis from the raw text returned by the AI
 */
function extractStructuredAnalysis(text: string): any {
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
