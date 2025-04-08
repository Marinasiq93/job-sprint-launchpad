
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleOCRRequest } from "./ocr.ts";
import { corsHeaders } from "./utils.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Process the OCR request
    return await handleOCRRequest(req);
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
