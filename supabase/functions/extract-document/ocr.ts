
import { corsHeaders } from "./cors.ts";
import { selectProviders } from "./providers.ts";
import { extractWithFallbacks } from "./edenai.ts";

/**
 * Process an OCR request and extract text from the uploaded file
 */
export async function handleOCRRequest(req: Request): Promise<Response> {
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
  
  // Convert the file to base64
  const fileBuffer = await file.arrayBuffer();
  const fileBase64 = btoa(
    new Uint8Array(fileBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
  );
  
  // Determine optimal providers based on file type
  const { providers, language } = selectProviders(file);
  
  // Main provider is the first in the list
  const mainProvider = providers[0];
  console.log(`Using primary provider: ${mainProvider} for file type: ${file.type}`);

  try {
    // Extract text with fallbacks if the primary provider fails
    const result = await extractWithFallbacks(
      fileBase64, 
      file.type, 
      providers,
      language, 
      file.name
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
        extracted_text: `Não foi possível extrair o texto do arquivo: ${file.name}. Por favor, copie e cole o texto manualmente.` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}
