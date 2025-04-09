
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleOCRRequest } from "./ocr.ts";
import { handleJobFitRequest } from "./job-fit.ts";
import { corsHeaders } from "./utils.ts";

serve(async (req) => {
  console.log("Extract document function called with method:", req.method);
  console.log("Request URL:", req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let isJobFitRequest = false;
    
    console.log(`Handling request for URL: ${url.pathname}`);
    
    // Check if route is specified in the URL path
    if (url.pathname.endsWith('/job-fit')) {
      console.log("Job fit route detected in URL path");
      isJobFitRequest = true;
    } else {
      // Log content type header to help with debugging
      console.log("Request content type:", req.headers.get("content-type"));
      
      // Try to determine if this is a job fit request based on body
      try {
        const clonedReq = req.clone();
        
        // For JSON requests, check the route parameter
        if (req.headers.get("content-type")?.includes("application/json")) {
          try {
            const body = await clonedReq.json();
            console.log("Request JSON body route:", body.route);
            
            if (body && body.route === 'job-fit') {
              console.log("Job fit route detected in request body");
              isJobFitRequest = true;
            }
          } catch (jsonError) {
            console.log("JSON parsing error:", jsonError.message);
          }
        } 
        // For form data requests, check if it has the route parameter
        else if (req.headers.get("content-type")?.includes("multipart/form-data")) {
          try {
            const formData = await clonedReq.formData();
            const routeValue = formData.get('route');
            console.log("Form data route value:", routeValue);
            
            if (routeValue === 'job-fit') {
              console.log("Job fit route detected in form data");
              isJobFitRequest = true;
            }
          } catch (formError) {
            console.log("Form data parsing error:", formError.message);
          }
        }
        
        // Check query parameters as a last resort
        const queryRoute = url.searchParams.get('route');
        if (queryRoute === 'job-fit') {
          console.log("Job fit route detected in query parameters");
          isJobFitRequest = true;
        }
      } catch (parseError) {
        console.log("Error parsing request to determine type:", parseError.message);
        
        // Check query params as a fallback
        const queryRoute = url.searchParams.get('route');
        if (queryRoute === 'job-fit') {
          console.log("Job fit route detected in query parameters");
          isJobFitRequest = true;
        }
      }
    }
    
    console.log(`Request identified as job fit request: ${isJobFitRequest}`);
    
    // Handle according to the determined request type
    if (isJobFitRequest) {
      // Handle job fit analysis using Eden AI workflow
      console.log("Forwarding to job fit handler");
      return await handleJobFitRequest(req);
    } else {
      // Handle regular OCR document extraction
      console.log("Forwarding to OCR handler");
      return await handleOCRRequest(req);
    }
  } catch (error) {
    console.error("Unhandled error in extract-document:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        extracted_text: "Erro ao processar o documento. Por favor, copie e cole o texto manualmente." 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
