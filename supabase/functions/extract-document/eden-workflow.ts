
import { callEdenAIWorkflow } from "./workflow.ts";
import { extractStructuredAnalysis } from "./analysis-extractor.ts";
import { corsHeaders, EDEN_AI_API_KEY } from "./utils.ts";

// Updated workflow IDs - using a fallback approach
export const JOB_FIT_WORKFLOW_IDS = [
  "297546a6-33e9-460e-83bb-a6eeeabc3144", // Primary workflow ID
  // Add any alternative workflow IDs here if needed
];

/**
 * Attempt to call Eden AI workflows for job fit analysis
 */
export async function callEdenAIWorkflows(
  resumeBase64: string,
  jobDescription: string,
  jobTitle: string = "",
  workflowIds: string[],
  debug: boolean = false
): Promise<Response | null> {
  let lastError = null;
  
  console.log("Starting Eden AI workflow call with API key:", 
              EDEN_AI_API_KEY ? `${EDEN_AI_API_KEY.substring(0, 10)}...` : "No API key found");
  console.log("Job fit workflow IDs:", workflowIds);
  
  // Try each workflow ID until one works
  for (const workflowId of workflowIds) {
    try {
      console.log(`Attempting to use Eden AI workflow ID: ${workflowId}`);
      
      // Format inputs EXACTLY as expected by the Eden AI workflow
      // IMPORTANT: Use the exact case-sensitive names shown in your workflow screenshots
      const workflowInputs = {
        Resume: resumeBase64,
        Jobdescription: jobDescription
      };
      
      // Add job title if provided - note: only add if your workflow actually has this input
      if (jobTitle && workflowIds.includes("job_title")) {
        workflowInputs['job_title'] = jobTitle;
      }
      
      console.log("Calling Eden AI workflow with input keys:", Object.keys(workflowInputs).join(', '));
      console.log("Input sample sizes - Resume:", resumeBase64.length, "Jobdescription:", jobDescription.length);
      
      // Call the Eden AI workflow with our prepared payload
      const result = await callEdenAIWorkflow(
        workflowInputs,
        workflowId
      );
      
      console.log("Eden AI workflow response received", JSON.stringify({
        has_result: !!result,
        result_type: result ? typeof result : 'undefined',
        has_job_fit_feedback: result?.job_fit_feedback ? true : false,
        result_keys: result ? Object.keys(result) : []
      }));
      
      // Check if we got a valid response from Eden AI
      if (!result || (!result.job_fit_feedback && !result.workflow_result && !result.analysis && !result.results)) {
        console.error("Invalid response from Eden AI workflow", result ? JSON.stringify(result) : "null response");
        continue; // Try next workflow ID
      }
      
      // Process the response from Eden AI
      try {
        // Get the text from the workflow response
        const jobFitFeedbackText = result.job_fit_feedback || 
                                   result.workflow_result || 
                                   result.analysis || 
                                   result.results?.output ||
                                   "";
                                   
        console.log("Job fit feedback text sample:", jobFitFeedbackText.substring(0, 100) + "...");
        
        // Skip if feedback is too short
        if (jobFitFeedbackText.length < 50) {
          console.warn("Job fit feedback too short, trying next workflow");
          continue;
        }
        
        // Try to extract structured information from the text
        const analysisResult = extractStructuredAnalysis(jobFitFeedbackText);
        
        // Add the raw analysis text to help with debugging
        analysisResult.rawAnalysis = jobFitFeedbackText;
        
        // Add input summary for debugging if needed
        if (debug) {
          analysisResult.inputSummary = {
            jobDescriptionLength: jobDescription?.length || 0,
            resumeTextLength: resumeBase64?.length || 0
          };
        }
        
        console.log("Analysis result generated successfully");
        return new Response(
          JSON.stringify(analysisResult),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (parsingError) {
        console.error("Error parsing Eden AI workflow response:", parsingError);
        lastError = parsingError;
        
        // Return the raw text from Eden AI if we can't parse it properly
        return new Response(
          JSON.stringify({
            compatibilityScore: "Análise Realizada",
            keySkills: ["Veja a análise completa abaixo"],
            relevantExperiences: ["Análise detalhada disponível"],
            identifiedGaps: ["Consulte a análise completa abaixo"],
            rawAnalysis: result.job_fit_feedback || result.workflow_result || result.analysis || result.results?.output || "Sem dados de análise disponíveis",
            fallbackAnalysis: false
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (workflowError) {
      console.error(`Error with workflow ${workflowId}:`, workflowError);
      lastError = workflowError;
      // Continue to try the next workflow ID
    }
  }
  
  // All workflow attempts failed
  console.warn("All Eden AI workflows failed");
  return null;
}
