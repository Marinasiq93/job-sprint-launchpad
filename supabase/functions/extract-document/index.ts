
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleOCRRequest } from "./ocr.ts";
import { handleJobFitRequest } from "./job-fit.ts";
import { corsHeaders } from "./utils.ts";

serve(async (req) => {
  console.log("Extract document function called with method:", req.method);
  console.log("Request URL:", req.url);
  console.log("Request headers:", Object.fromEntries([...req.headers]));
  
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
      // Check if this is a job fit request based on body
      try {
        const clonedReq = req.clone();
        const contentType = req.headers.get("content-type") || "";
        console.log("Request content type:", contentType);
        
        // For JSON requests, check the route parameter or the presence of resumeBase64
        if (contentType.includes("application/json")) {
          const body = await clonedReq.json();
          console.log("Request JSON body keys:", Object.keys(body));
          
          if (body && (body.route === 'job-fit' || body.resumeBase64)) {
            console.log("Job fit request detected from JSON body");
            isJobFitRequest = true;
          }
        }
        // For form data requests, check for route parameter
        else if (contentType.includes("multipart/form-data")) {
          const formData = await clonedReq.formData();
          const route = formData.get('route');
          
          if (route === 'job-fit') {
            console.log("Job fit route detected from form data");
            isJobFitRequest = true;
          }
        }
        
        // Check URL query parameters as a fallback
        const queryRoute = url.searchParams.get('route');
        if (queryRoute === 'job-fit') {
          console.log("Job fit route detected from query parameters");
          isJobFitRequest = true;
        }
        
      } catch (parseError) {
        console.error("Error parsing request to determine type:", parseError);
        // Continue and rely on URL-based detection
      }
    }
    
    console.log(`Request identified as job fit request: ${isJobFitRequest}`);
    
    // Handle according to the determined request type
    if (isJobFitRequest) {
      console.log("Forwarding to job fit handler");
      return await handleJobFitRequest(req);
    } else {
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
