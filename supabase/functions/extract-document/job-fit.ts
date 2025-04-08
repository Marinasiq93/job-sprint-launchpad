
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
      return new Response(
        JSON.stringify({ 
          error: "Missing required data: resume and job description are required" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
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
        return new Response(
          JSON.stringify({ 
            error: "Failed to process workflow response for job fit analysis",
            success: false,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
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
      
      return new Response(
        JSON.stringify({ 
          error: error.message,
          success: false,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error in job fit handler:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Unexpected server error",
        success: false,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}
