
import { callEdenAIOCR, processEdenAIResponse } from "./ocr-api.ts";
import { extractWithFallbacks } from "./extractor.ts";
import { corsHeaders } from "./utils.ts";

// Default providers for OCR
const DEFAULT_OCR_PROVIDERS = ['amazon', 'microsoft', 'google'];

/**
 * Handle OCR request
 */
export async function handleOCRRequest(req: Request): Promise<Response> {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting OCR process...");
    
    // Check if the request has a body (should be FormData)
    if (!req.body) {
      console.error("No request body provided");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "No request body provided",
          extracted_text: "Nenhum arquivo fornecido. Por favor, envie um arquivo para extração."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the form data
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof File)) {
      console.error("No file found in the request");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "No file found in the request",
          extracted_text: "Arquivo não encontrado na requisição. Por favor, envie um arquivo para extração."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`);
    
    // Read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Convert ArrayBuffer to base64
    const uint8Array = new Uint8Array(arrayBuffer);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    const fileBase64 = btoa(binaryString);
    
    // Determine file type and language
    const fileType = file.type || 'application/pdf';
    const language = 'pt'; // Default to Portuguese
    
    // Get providers from request or use defaults
    const providerParam = formData.get('providers');
    const providers = providerParam 
      ? typeof providerParam === 'string' 
        ? providerParam.split(',') 
        : DEFAULT_OCR_PROVIDERS
      : DEFAULT_OCR_PROVIDERS;
    
    console.log(`Using OCR providers: ${providers.join(', ')}`);
    
    // Use the extractWithFallbacks function to try multiple providers in sequence
    const result = await extractWithFallbacks(
      fileBase64, 
      fileType, 
      providers, 
      language, 
      file.name
    );
    
    if (result.success) {
      console.log(`OCR successful: extracted ${result.extracted_text.length} characters`);
    } else {
      console.error("OCR failed:", result.extracted_text);
    }
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in OCR process:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error",
        extracted_text: "Ocorreu um erro ao processar o documento. Por favor, tente novamente ou copie e cole o texto manualmente."
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}
