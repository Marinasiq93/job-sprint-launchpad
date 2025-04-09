
import { corsHeaders } from "./utils.ts";
import { generateFallbackAnalysis } from "./job-fit-fallback.ts";
import { JOB_FIT_WORKFLOW_IDS, callEdenAIWorkflows } from "./eden-workflow.ts";
import { createMissingDataResponse, createErrorResponse } from "./analysis-extractor.ts";
import { EDEN_AI_API_KEY } from "./utils.ts";

/**
 * Handle job fit analysis request using Eden AI workflow
 */
export async function handleJobFitRequest(req: Request): Promise<Response> {
  try {
    console.log("Starting job fit analysis process");
    console.log("Eden AI API Key configured:", EDEN_AI_API_KEY ? "Yes (length: " + EDEN_AI_API_KEY.length + ")" : "No");
    
    // Parse the request body
    const data = await req.json();
    const { resumeBase64, resumeType, resumeName, jobDescription, jobTitle } = data;
    
    // More detailed validation
    if (!resumeBase64) {
      console.warn("Missing resume data");
      return createMissingDataResponse("Resume data is required");
    }
    
    if (!jobDescription) {
      console.warn("Missing job description");
      return createMissingDataResponse("Job description is required");
    }
    
    // Check for likely invalid data
    if (resumeBase64.length < 100) {
      console.warn("Resume base64 data too short:", resumeBase64.length);
      return createMissingDataResponse("Resume data is too short or invalid");
    }

    console.log(`Processing job fit analysis with available workflows`);
    console.log(`Resume name: ${resumeName}, type: ${resumeType}, job description length: ${jobDescription.length}`);
    console.log(`Resume base64 data length: ${resumeBase64?.length || 0}`);
    console.log(`Job title provided: ${jobTitle ? 'Yes' : 'No'}`);
    
    // If no Eden AI workflow is accessible, use our fallback text-based analysis approach
    if (!EDEN_AI_API_KEY || JOB_FIT_WORKFLOW_IDS.length === 0) {
      console.log("No Eden AI workflows available, using fallback analysis");
      return generateFallbackAnalysis(resumeBase64, jobDescription);
    }
    
    try {
      // Try to use Eden AI workflow
      const workflowResponse = await callEdenAIWorkflows(
        resumeBase64,
        jobDescription,
        jobTitle || "",
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
