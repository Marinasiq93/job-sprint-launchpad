
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleOCRRequest } from "./ocr.ts";
import { handleJobFitRequest } from "./job-fit.ts";
import { corsHeaders } from "./utils.ts";

serve(async (req) => {
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
      // If not in the URL path, check if it's in the request body
      try {
        const body = await req.clone().json();
        console.log("Request body route parameter:", body?.route);
        if (body && body.route === 'job-fit') {
          console.log("Job fit route detected in request body");
          isJobFitRequest = true;
        }
      } catch (e) {
        console.log("Error parsing request body:", e.message);
        // If JSON parsing fails, check query params as a fallback
        const queryRoute = url.searchParams.get('route');
        console.log("URL query route parameter:", queryRoute);
        if (queryRoute === 'job-fit') {
          console.log("Job fit route detected in query parameters");
          isJobFitRequest = true;
        }
      }
    }
    
    console.log(`Request is job fit request: ${isJobFitRequest}`);
    
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
