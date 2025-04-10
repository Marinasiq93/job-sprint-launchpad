
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
    
    // Try to use the analyze-job-fit function first if it exists
    try {
      console.log("Attempting to call analyze-job-fit function");
      
      // Convert base64 to text
      let resumeText = "";
      try {
        resumeText = atob(resumeBase64);
        console.log("Successfully decoded base64 to text, length:", resumeText.length);
      } catch (decodeError) {
        console.error("Error decoding base64:", decodeError);
        resumeText = "Error decoding resume content";
      }
      
      // Prepare the request to the analyze-job-fit function
      const analyzeRequest = new Request("http://localhost:9999/analyze-job-fit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobTitle: jobTitle || "Job Position",
          jobDescription: jobDescription,
          resumeText: resumeText,
          debug: data.debug
        })
      });
      
      try {
        console.log("Sending request to analyze-job-fit function");
        const analyzeResponse = await fetch(analyzeRequest);
        
        if (analyzeResponse.ok) {
          console.log("analyze-job-fit function returned success");
          const analyzeResult = await analyzeResponse.json();
          
          return new Response(
            JSON.stringify(analyzeResult),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } else {
          console.warn("analyze-job-fit function failed with status:", analyzeResponse.status);
        }
      } catch (analyzeError) {
        console.error("Error calling analyze-job-fit function:", analyzeError);
        // Will continue with Eden AI workflow as fallback
      }
    } catch (functionError) {
      console.error("Error setting up analyze-job-fit request:", functionError);
      // Will continue with Eden AI workflow
    }
    
    // Fallback to Eden AI workflow
    try {
      console.log("Sending request to Eden AI workflow API");
      const workflowResponse = await callEdenAIWorkflows(
        resumeBase64,
        jobDescription,
        jobTitle || "",
        JOB_FIT_WORKFLOW_IDS,
        data.debug
      );
      
      // If we got a valid response from Eden AI workflow, return it
      if (workflowResponse) {
        console.log("Returning successful workflow response");
        return workflowResponse;
      }
      
      // If workflow failed, use our fallback analysis
      console.log("Eden AI workflow returned no data, using fallback analysis");
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
