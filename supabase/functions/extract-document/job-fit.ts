
import { corsHeaders } from "./utils.ts";
import { generateFallbackAnalysis } from "./job-fit-fallback.ts";
import { JOB_FIT_WORKFLOW_IDS, callEdenAIWorkflows } from "./eden-workflow.ts";
import { createMissingDataResponse, createErrorResponse } from "./analysis-extractor.ts";

/**
 * Handle job fit analysis request using Eden AI workflow
 */
export async function handleJobFitRequest(req: Request): Promise<Response> {
  try {
    console.log("Starting job fit analysis process");
    // Parse the request body
    const data = await req.json();
    const { resumeBase64, resumeType, resumeName, jobDescription } = data;
    
    // Check for required input data
    if (!resumeBase64 || !jobDescription) {
      console.warn("Missing input data - generating fallback response");
      return createMissingDataResponse();
    }

    console.log(`Processing job fit analysis with available workflows`);
    console.log(`Resume name: ${resumeName}, type: ${resumeType}, job description length: ${jobDescription.length}`);
    console.log(`Resume base64 data length: ${resumeBase64?.length || 0}`);
    
    // If no Eden AI workflow is accessible, use our fallback text-based analysis approach
    if (!data.EDEN_AI_API_KEY && JOB_FIT_WORKFLOW_IDS.length === 0) {
      console.log("No Eden AI workflows available, using fallback analysis");
      return generateFallbackAnalysis(resumeBase64, jobDescription);
    }
    
    try {
      // Try to use Eden AI workflow
      const workflowResponse = await callEdenAIWorkflows(
        resumeBase64,
        jobDescription,
        JOB_FIT_WORKFLOW_IDS,
        data.debug
      );
      
      // If we got a valid response from Eden AI workflow, return it
      if (workflowResponse) {
        return workflowResponse;
      }
      
      // If all workflows failed, use our fallback analysis
      console.log("All Eden AI workflows failed, using fallback analysis");
      return generateFallbackAnalysis(resumeBase64, jobDescription);
      
    } catch (error) {
      console.error("Error in job fit analysis workflow:", error);
      return generateFallbackAnalysis(resumeBase64, jobDescription);
    }
  } catch (error) {
    console.error("Unexpected error in job fit handler:", error);
    return createErrorResponse(error instanceof Error ? error : new Error("Unknown error"));
  }
}
