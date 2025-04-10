
import { callEdenAIWorkflow } from "./workflow.ts";
import { extractStructuredAnalysis } from "./analysis-extractor.ts";
import { corsHeaders, EDEN_AI_API_KEY, validateAPIKey } from "./utils.ts";

// Using just one workflow ID for simplicity
export const JOB_FIT_WORKFLOW_IDS = [
  "7be3c4b4-b371-4d03-abae-afbce8415b37", // Primary workflow ID
];

/**
 * Call Eden AI workflow for job fit analysis
 */
export async function callEdenAIWorkflows(
  resumeBase64: string,
  jobDescription: string,
  jobTitle: string = "",
  workflowIds: string[],
  debug: boolean = false
): Promise<Response | null> {
  // Validate API key before proceeding
  if (!validateAPIKey()) {
    console.error("Eden AI API key validation failed");
    return null;
  }
  
  console.log("Starting Eden AI workflow call");
  console.log("Resume file length:", resumeBase64?.length || 0);
  console.log("Job description length:", jobDescription?.length || 0);
  
  try {
    const workflowId = workflowIds[0]; // Just use the first workflow ID
    console.log(`Using Eden AI workflow ID: ${workflowId}`);
    
    // Prepare inputs with simple field names that match our workflow.ts implementation
    const workflowInputs = {
      resume: resumeBase64,
      jobDescription: jobDescription,
      jobTitle: jobTitle || ""
    };
    
    console.log("Calling Eden AI workflow with inputs:", Object.keys(workflowInputs));
    
    // Call the Eden AI workflow with our inputs and wait for results
    const result = await callEdenAIWorkflow(workflowInputs, workflowId);
    
    console.log("Eden AI workflow execution completed", JSON.stringify({
      has_result: !!result,
      result_type: result ? typeof result : 'undefined',
      result_keys: result ? Object.keys(result) : []
    }));
    
    // Check if we got a valid response from Eden AI
    if (!result) {
      console.error("No result from Eden AI workflow");
      return null;
    }
    
    // Process the response from Eden AI
    try {
      // Get the text from the workflow response - finding the most likely field
      const jobFitFeedbackText = result.job_fit_feedback || 
                                 result.workflow_result || 
                                 result.analysis || 
                                 result.output ||
                                 result.results?.output ||
                                 "";
                                 
      console.log("Job fit feedback text sample:", jobFitFeedbackText.substring(0, 100) + "...");
      
      // Skip if feedback is too short
      if (!jobFitFeedbackText || jobFitFeedbackText.length < 50) {
        console.warn("Job fit feedback too short or missing");
        return null;
      }
      
      // Extract structured information from the text
      const analysisResult = extractStructuredAnalysis(jobFitFeedbackText);
      
      // Add the raw analysis text to help with debugging
      analysisResult.rawAnalysis = jobFitFeedbackText;
      
      // Add input summary for debugging if needed
      if (debug) {
        analysisResult.inputSummary = {
          jobTitleLength: jobTitle?.length || 0,
          jobDescriptionLength: jobDescription?.length || 0,
          resumeTextLength: resumeBase64?.length || 0,
          coverLetterTextLength: 0,
          referenceTextLength: 0
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
          rawAnalysis: result.job_fit_feedback || result.workflow_result || result.analysis || result.output || "Sem dados de análise disponíveis",
          fallbackAnalysis: false
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (workflowError) {
    console.error(`Error with workflow:`, workflowError);
    return null;
  }
}
