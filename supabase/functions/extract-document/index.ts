
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const EDEN_AI_API_KEY = Deno.env.get("EDEN_AI_API_KEY");

// CORS headers for browser requests
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
    
    // Determine optimal providers based on file type with better selection for resumes
    let providers = [];
    let language = "pt"; // Default to Portuguese
    
    // For PDFs (common resume format), try multiple specialized providers
    if (file.type === "application/pdf") {
      if (file.name.toLowerCase().includes("resume") || 
          file.name.toLowerCase().includes("cv") ||
          file.name.toLowerCase().includes("curriculum") ||
          file.name.toLowerCase().includes("currículo")) {
        // For resume PDFs, use these specialized providers
        providers = ["microsoft", "amazon", "google"];
        console.log("Resume detected, using multiple specialized OCR providers");
      } else {
        // For regular PDFs
        providers = ["microsoft", "amazon"];
      }
    }
    // For images, Google's OCR is often good
    else if (file.type.startsWith("image/")) {
      providers = ["google", "microsoft"];
    }
    // For Word documents
    else if (file.type.includes("word") || file.type.includes("docx")) {
      providers = ["amazon", "microsoft"];
    }
    // Default fallback
    else {
      providers = ["amazon"];
    }
    
    // Main provider is the first in the list
    const mainProvider = providers[0];
    console.log(`Using primary provider: ${mainProvider} for file type: ${file.type}`);

    // Additional language detection for better OCR
    if (file.name.toLowerCase().includes("en_") || 
        file.name.toLowerCase().includes("_en") ||
        file.name.toLowerCase().includes("english")) {
      language = "en";
      console.log("English language detected from filename");
    }

    // Prepare the API request to Eden AI
    const edenAIPayload = {
      providers: mainProvider,
      file_base64: fileBase64,
      file_type: file.type,
      language: language,  // Language setting
      // Additional OCR settings for better quality
      ocr_settings: {
        // Request higher density scanning for better text capture
        density: "high",
        // Better handling of tables and columns in resumes
        table_recognition: true,
        // Recognize different regions/layouts in the document
        region_recognition: true,
        // Enhanced font detection
        font_enhancement: true
      }
    };

    // Call Eden AI OCR API
    console.log(`Calling Eden AI OCR API with ${mainProvider} provider...`);
    const edenResponse = await fetch("https://api.edenai.run/v2/ocr/ocr", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${EDEN_AI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(edenAIPayload)
    });
    
    if (!edenResponse.ok) {
      const errorText = await edenResponse.text();
      console.error(`Eden AI API error with ${mainProvider}:`, errorText);
      
      // Try fallback providers if available
      for (let i = 1; i < providers.length; i++) {
        const fallbackProvider = providers[i];
        console.log(`Trying fallback provider ${i}: ${fallbackProvider}`);
        
        const fallbackPayload = {
          ...edenAIPayload,
          providers: fallbackProvider
        };
        
        const fallbackResponse = await fetch("https://api.edenai.run/v2/ocr/ocr", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${EDEN_AI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(fallbackPayload)
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          
          // Process the response to extract text
          const result = processEdenAIResponse(fallbackData, fallbackProvider, file.name);
          
          // If we got a reasonable amount of text, return it
          if (result.success && result.extracted_text && result.extracted_text.length > 500) {
            console.log(`Fallback provider ${fallbackProvider} successful with ${result.extracted_text.length} chars`);
            return new Response(
              JSON.stringify(result),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      }
      
      // If all providers failed, return error
      return new Response(
        JSON.stringify({ 
          error: "Failed to extract text with all providers",
          extracted_text: `Não foi possível extrair o texto do arquivo: ${file.name}. Por favor, copie e cole o texto manualmente.` 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const data = await edenResponse.json();
    
    // Process the response to extract text
    const result = processEdenAIResponse(data, mainProvider, file.name);
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing document:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        extracted_text: "Erro ao processar o documento. Por favor, copie e cole o texto manualmente." 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Function to process the Eden AI response
function processEdenAIResponse(data: any, provider: string, fileName: string): { success: boolean, extracted_text: string } {
  console.log(`Processing ${provider} response for ${fileName}`);
  
  try {
    // Extract text from the response based on the provider
    let extractedText = "";
    
    // Try to get the most comprehensive text content
    if (data[provider] && data[provider].text) {
      extractedText = data[provider].text;
      console.log(`Using primary text field: ${extractedText.length} characters`);
    } 
    // Try raw text if the main text field is empty or missing
    else if (data[provider] && data[provider].raw_text) {
      extractedText = data[provider].raw_text;
      console.log(`Using raw_text: ${extractedText.length} characters`);
    }
    // Check if we can get text from page data (some providers return per-page results)
    else if (data[provider] && data[provider].pages && data[provider].pages.length > 0) {
      const pageTexts = data[provider].pages
        .map((page: any) => page.text || page.raw_text || "")
        .filter(Boolean);
        
      if (pageTexts.length > 0) {
        extractedText = pageTexts.join("\n\n");
        console.log(`Combined text from ${pageTexts.length} pages: ${extractedText.length} characters`);
      }
    }
    // Check if there's any other provider data we can use as a fallback
    else {
      for (const altProvider in data) {
        if (data[altProvider] && (data[altProvider].text || data[altProvider].raw_text)) {
          extractedText = data[altProvider].text || data[altProvider].raw_text;
          console.log(`Using alternate provider ${altProvider}: ${extractedText.length} characters`);
          break;
        }
      }
    }
    
    // Check if we got useful text
    if (!extractedText || extractedText.length < 10) {
      console.log("Insufficient text extracted");
      return {
        success: false,
        extracted_text: `Não foi possível extrair texto suficiente do arquivo: ${fileName}. Por favor, copie e cole o texto manualmente.`
      };
    }
    
    // Clean up and improve extracted text
    // Replace multiple newlines with double newlines (paragraph breaks)
    extractedText = extractedText.replace(/\n{3,}/g, "\n\n");
    // Remove excessive spaces
    extractedText = extractedText.replace(/[ \t]{3,}/g, " ");
    // Normalize whitespace around punctuation
    extractedText = extractedText.replace(/\s+([.,;:!?])/g, "$1");
    
    // Add metadata to the text
    const metadata = `Arquivo: ${fileName}\nTipo: Documento processado por IA\nData de extração: ${new Date().toLocaleString()}\n\n`;
    const fullText = metadata + extractedText;
    
    return {
      success: true,
      extracted_text: fullText
    };
  } catch (processingError) {
    console.error("Error processing extraction response:", processingError);
    return {
      success: false,
      extracted_text: `Erro ao processar a extração do arquivo: ${fileName}. Por favor, copie e cole o texto manualmente.`
    };
  }
}
