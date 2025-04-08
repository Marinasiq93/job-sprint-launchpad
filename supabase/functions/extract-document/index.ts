
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
    
    // Check if route parameter is present in query string (for Supabase function.invoke)
    // Support both query params for compatibility
    const queryRoute = url.searchParams.get('route');
    
    // Check the endpoint path to determine how to handle the request
    if (url.pathname.endsWith('/job-fit') || queryRoute === 'job-fit') {
      // Handle job fit analysis using Eden AI workflow
      return await handleJobFitRequest(req);
    } else {
      // Handle regular OCR document extraction
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
