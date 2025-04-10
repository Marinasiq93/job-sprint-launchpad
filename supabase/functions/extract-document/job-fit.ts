
import { corsHeaders, createMissingDataResponse, createErrorResponse } from "./utils.ts";
import { generateFallbackAnalysis } from "./job-fit-fallback.ts";
import { JOB_FIT_WORKFLOW_IDS, callEdenAIWorkflows } from "./eden-workflow.ts";
import { EDEN_AI_API_KEY } from "./utils.ts";

/**
 * Handle job fit analysis request using Eden AI workflow
 */
export async function handleJobFitRequest(req: Request): Promise<Response> {
  try {
    console.log("Starting job fit analysis process");
    console.log("Eden AI API Key configured:", EDEN_AI_API_KEY ? "Yes (length: " + EDEN_AI_API_KEY.length + ")" : "No");
    
    // Parse the request body
    let data;
    try {
      data = await req.json();
      console.log("Request body parsed successfully");
      console.log("Request body keys:", Object.keys(data));
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return createErrorResponse(new Error("Erro ao processar os dados da solicitação"), 400);
    }
    
    // Extract data with detailed logging
    const { resumeBase64, jobDescription, jobTitle } = data;
    console.log("Data extraction from request:", {
      hasResumeBase64: !!resumeBase64,
      resumeBase64Length: resumeBase64?.length || 0,
      hasJobDescription: !!jobDescription,
      jobDescriptionLength: jobDescription?.length || 0,
      hasJobTitle: !!jobTitle
    });
    
    // Validate required fields
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

    console.log(`Processing job fit analysis with workflow ID: ${JOB_FIT_WORKFLOW_IDS[0]}`);
    console.log(`Job description length: ${jobDescription.length}`);
    console.log(`Resume base64 data length: ${resumeBase64?.length || 0}`);
    
    // If no Eden AI workflow is accessible, use our fallback text-based analysis approach
    if (!EDEN_AI_API_KEY || EDEN_AI_API_KEY.length < 20 || JOB_FIT_WORKFLOW_IDS.length === 0) {
      console.log("No Eden AI workflows available, using fallback analysis");
      return generateFallbackAnalysis(resumeBase64, jobDescription);
    }
    
    try {
      // Call Eden AI workflow with the resumeBase64 and jobDescription
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
      
      // If workflow failed, use our fallback analysis
      console.log("Eden AI workflow failed, using fallback analysis");
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
