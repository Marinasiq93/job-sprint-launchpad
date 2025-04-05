
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
    if (!jobTitle || !jobDescription) {
      console.error("Missing job information:", { 
        hasJobTitle: !!jobTitle, 
        hasJobDescription: !!jobDescription
      });
      
      return new Response(
        JSON.stringify({ 
          error: "Missing job information: title and description are required" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }
    
    // Check for resume text
    if (!resumeText || resumeText.trim().length < 10) {
      console.error("Missing or insufficient resume text. Length:", resumeText?.length || 0);
      
      return new Response(
        JSON.stringify({ 
          error: "Missing or insufficient resume text. Please ensure your resume is properly uploaded in your profile." 
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
