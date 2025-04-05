
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
    
    // Determine the provider based on file type
    // Default to 'amazon' as it generally performs well on most document types
    let provider = "amazon";
    
    // For PDFs, Microsoft's OCR tends to work well
    if (file.type === "application/pdf") {
      provider = "microsoft";
    }
    // For images, Google's OCR is often good
    else if (file.type.startsWith("image/")) {
      provider = "google";
    }
    
    console.log(`Using provider: ${provider} for file type: ${file.type}`);

    // Prepare the API request to Eden AI
    const edenAIPayload = {
      providers: provider,
      file_base64: fileBase64,
      file_type: file.type,
      language: "pt"  // Portuguese language for better extraction of PT documents
    };

    // Call Eden AI OCR API
    console.log("Calling Eden AI OCR API...");
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
      console.error("Eden AI API error:", errorText);
      
      // Fallback to a different provider if the first one fails
      if (provider !== "amazon") {
        console.log("Trying fallback provider: amazon");
        
        const fallbackPayload = {
          ...edenAIPayload,
          providers: "amazon"
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
          const result = processEdenAIResponse(fallbackData, "amazon", file.name);
          
          return new Response(
            JSON.stringify(result),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to extract text",
          extracted_text: `Não foi possível extrair o texto do arquivo: ${file.name}. Por favor, copie e cole o texto manualmente.` 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const data = await edenResponse.json();
    
    // Process the response to extract text
    const result = processEdenAIResponse(data, provider, file.name);
    
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
    
    if (data[provider] && data[provider].text) {
      extractedText = data[provider].text;
      console.log(`Successfully extracted ${extractedText.length} characters`);
    } else if (data[provider] && data[provider].raw_text) {
      extractedText = data[provider].raw_text;
      console.log(`Using raw_text: ${extractedText.length} characters`);
    } else {
      // Check if there's any other provider data we can use
      for (const altProvider in data) {
        if (data[altProvider] && (data[altProvider].text || data[altProvider].raw_text)) {
          extractedText = data[altProvider].text || data[altProvider].raw_text;
          console.log(`Using alternate provider ${altProvider}: ${extractedText.length} characters`);
          break;
        }
      }
    }
    
    if (!extractedText || extractedText.length < 10) {
      console.log("Insufficient text extracted");
      return {
        success: false,
        extracted_text: `Não foi possível extrair texto suficiente do arquivo: ${fileName}. Por favor, copie e cole o texto manualmente.`
      };
    }
    
    // Add metadata to the text
    const metadata = `Arquivo: ${fileName}\nTipo: Documento processado\nData de extração: ${new Date().toLocaleString()}\n\n`;
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
