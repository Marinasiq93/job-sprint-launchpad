
import { extractWithFallbacks } from "./extractor.ts";
import { PROVIDERS, DEFAULT_LANGUAGE } from "./providers.ts";
import { corsHeaders } from "./utils.ts";

/**
 * Handle OCR document extraction request
 */
export async function handleOCRRequest(req: Request): Promise<Response> {
  try {
    console.log("Starting document extraction process");
    
    // Check if a file was uploaded
    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
      // Handle file upload (form data)
      const formData = await req.formData();
      const file = formData.get("file") as File;
      
      if (!file) {
        console.error("No file found in form data");
        return new Response(
          JSON.stringify({ success: false, extracted_text: "Nenhum arquivo encontrado na requisição" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      console.log(`File received: ${file.name}, type: ${file.type}, size: ${(file.size/1024).toFixed(2)}KB`);
      
      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64String = btoa(String.fromCharCode(...uint8Array));
      
      // Call extraction with fallbacks
      const result = await extractWithFallbacks(
        base64String, 
        file.type,
        PROVIDERS, 
        DEFAULT_LANGUAGE,
        file.name
      );
      
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Handle JSON request (base64 data)
      const data = await req.json();
      const { fileBase64, fileType, fileName, language } = data;
      
      if (!fileBase64 || !fileType) {
        console.error("Missing required fields in request");
        return new Response(
          JSON.stringify({ success: false, extracted_text: "Dados inválidos na requisição" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      console.log(`Processing document: ${fileName || "unknown"}, type: ${fileType}`);
      
      // Call extraction with fallbacks
      const result = await extractWithFallbacks(
        fileBase64, 
        fileType, 
        PROVIDERS, 
        language || DEFAULT_LANGUAGE,
        fileName || "document"
      );
      
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Unexpected error in OCR handler:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        extracted_text: `Erro ao processar o documento: ${error.message}. Por favor, copie e cole o texto manualmente.` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}
