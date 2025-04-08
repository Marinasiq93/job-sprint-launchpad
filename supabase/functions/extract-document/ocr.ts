
import { corsHeaders } from "./cors.ts";
import { selectProviders } from "./providers.ts";
import { extractWithFallbacks } from "./edenai.ts";

// Define config for Eden AI workflow
const USE_WORKFLOW = true; // Set to true to use workflow
const WORKFLOW_ID = "your-workflow-id-here"; // Replace with your actual workflow ID

/**
 * Process an OCR request and extract text from the uploaded file
 */
export async function handleOCRRequest(req: Request): Promise<Response> {
  try {
    // Parse the request body
    const formData = await req.formData();
    const file = formData.get("file");
    
    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: "No file provided or invalid file" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
    
    // Validate maximum file size (15MB)
    if (file.size > 15 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "File too large. Maximum size is 15MB." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Convert the file to base64
    const fileBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(fileBuffer);
    const base64String = btoa(
      Array.from(uint8Array)
        .map(byte => String.fromCharCode(byte))
        .join('')
    );
    
    console.log(`Successfully converted ${file.size} bytes to base64 (${base64String.length} chars)`);
    
    // Determine optimal providers based on file type
    const { providers, language } = selectProviders(file);
    
    // Main provider is the first in the list
    const mainProvider = providers[0];
    
    // Log whether we're using workflow or traditional OCR
    if (USE_WORKFLOW && WORKFLOW_ID) {
      console.log(`Using Eden AI workflow: ${WORKFLOW_ID} for file type: ${file.type}`);
    } else {
      console.log(`Using primary provider: ${mainProvider} for file type: ${file.type}`);
    }

    try {
      // Extract text with fallbacks if the primary provider fails
      const result = await extractWithFallbacks(
        base64String, 
        file.type, 
        providers,
        language, 
        file.name,
        USE_WORKFLOW, 
        WORKFLOW_ID
      );
      
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Error processing file:", error);
      
      return new Response(
        JSON.stringify({ 
          error: error.message,
          success: false,
          extracted_text: `Não foi possível extrair o texto do arquivo: ${file.name}. Erro: ${error.message}. Por favor, copie e cole o texto manualmente.` 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error in OCR handler:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Unexpected server error",
        success: false,
        extracted_text: "Erro inesperado ao processar o documento. Por favor, copie e cole o texto manualmente." 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}
