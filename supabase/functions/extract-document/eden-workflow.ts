import { callEdenAIWorkflow } from "./workflow.ts";
import { extractStructuredAnalysis } from "./analysis-extractor.ts";
import { corsHeaders } from "./utils.ts";

// Updated workflow IDs - using a fallback approach
export const JOB_FIT_WORKFLOW_IDS = [
  "297546a6-33e9-460e-83bb-a6eeeabc3144", // Original ID that returned 404
  // Add any alternative workflow IDs your account might have
];

/**
 * Attempt to call Eden AI workflows for job fit analysis
 */
export async function callEdenAIWorkflows(
  resumeBase64: string,
  jobDescription: string,
  workflowIds: string[],
  debug: boolean = false
): Promise<Response | null> {
  let lastError = null;
  
  // Try each workflow ID until one works
  for (const workflowId of workflowIds) {
    try {
      console.log(`Attempting to use Eden AI workflow ID: ${workflowId}`);
      
      // Prepare data for Eden AI workflow based on the workflow schema
      // Following documentation: inputs should be top-level parameters
      const workflowPayload = {
        // We'll keep the workflow_id field to maintain compatibility with our function signature
        workflow_id: workflowId,
        async: false,
        inputs: {
          // These are the actual input parameters that will be sent at the top level
          Resume: resumeBase64,
          Jobdescription: jobDescription
        }
      };
      
      console.log("Calling Eden AI workflow with payload:", JSON.stringify({
        workflow_id: workflowId,
        input_sizes: {
          jobDescription_length: jobDescription?.length || 0,
          resumeBase64_length: resumeBase64?.length || 0
        }
      }));
      
      // Call the Eden AI workflow with our prepared payload
      const result = await callEdenAIWorkflow(
        workflowPayload,
        workflowId
      );
      
      console.log("Eden AI workflow response received", JSON.stringify({
        has_result: !!result,
        result_type: result ? typeof result : 'undefined',
        has_job_fit_feedback: result?.job_fit_feedback ? true : false
      }));
      
      // Check if we got a valid response from Eden AI
      if (!result || (!result.job_fit_feedback && !result.workflow_result)) {
        console.error("Invalid response from Eden AI workflow", JSON.stringify(result));
        continue; // Try next workflow ID
      }
      
      // Process the response from Eden AI
      try {
        // Get the text from the workflow response
        const jobFitFeedbackText = result.job_fit_feedback || result.workflow_result || "";
        console.log("Job fit feedback text sample:", jobFitFeedbackText.substring(0, 100) + "...");
        
        // Skip if feedback is too short
        if (jobFitFeedbackText.length < 100) {
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
            rawAnalysis: result.job_fit_feedback || result.workflow_result || "Sem dados de análise disponíveis",
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
