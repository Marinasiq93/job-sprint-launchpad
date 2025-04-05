
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { generateJobFitAnalysis } from "./openaiService.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received analyze-job-fit request");
    const requestData = await req.json();
    const { jobTitle, jobDescription, resumeText, coverLetterText, referenceText } = requestData;

    // Validate required fields
    if (!jobTitle || !jobDescription || !resumeText) {
      console.error("Missing required fields:", { 
        hasJobTitle: !!jobTitle, 
        hasJobDescription: !!jobDescription, 
        hasResumeText: !!resumeText 
      });
      
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: job title, job description and resume text are required" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    console.log("Analyzing job fit for:", jobTitle);
    console.log("Resume text length:", resumeText.length);
    
    // Generate job fit analysis using OpenAI
    const fitAnalysisResult = await generateJobFitAnalysis({
      jobTitle, 
      jobDescription, 
      resumeText, 
      coverLetterText, 
      referenceText
    });

    console.log("Analysis complete");
    
    // Return the result
    return new Response(
      JSON.stringify(fitAnalysisResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-job-fit function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
