
import { corsHeaders } from "./cors.ts";

const EDEN_AI_API_KEY = Deno.env.get("EDEN_AI_API_KEY");

/**
 * Calls Eden AI OCR API for text extraction
 */
export async function callEdenAI(
  fileBase64: string, 
  fileType: string, 
  provider: string, 
  language: string
): Promise<any> {
  console.log(`Calling Eden AI OCR API with ${provider} provider...`);
  
  const edenAIPayload = {
    providers: provider,
    file_base64: fileBase64,
    file_type: fileType,
    language: language,
    // Additional OCR settings for better quality
    ocr_settings: {
      density: "high",
      table_recognition: true,
      region_recognition: true,
      font_enhancement: true
    }
  };
  
  const response = await fetch("https://api.edenai.run/v2/ocr/ocr", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${EDEN_AI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(edenAIPayload)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Eden AI API error with ${provider}: ${errorText}`);
  }
  
  return await response.json();
}

/**
 * Try multiple providers in sequence until successful
 */
export async function extractWithFallbacks(
  fileBase64: string, 
  fileType: string, 
  providers: string[], 
  language: string, 
  fileName: string
): Promise<{ success: boolean, extracted_text: string }> {
  // Try each provider in sequence
  for (const provider of providers) {
    try {
      console.log(`Trying OCR provider: ${provider}`);
      const data = await callEdenAI(fileBase64, fileType, provider, language);
      
      // Process the response
      const result = processEdenAIResponse(data, provider, fileName);
      
      // If we got a reasonable amount of text, return it
      if (result.success && result.extracted_text && result.extracted_text.length > 500) {
        console.log(`Provider ${provider} successful with ${result.extracted_text.length} chars`);
        return result;
      }
    } catch (error) {
      console.error(`Error with provider ${provider}:`, error);
      // Continue to next provider
    }
  }
  
  // If all providers failed, return error
  return {
    success: false,
    extracted_text: `Não foi possível extrair o texto do arquivo: ${fileName}. Por favor, copie e cole o texto manualmente.`
  };
}

/**
 * Function to process the Eden AI response
 */
export function processEdenAIResponse(data: any, provider: string, fileName: string): { success: boolean, extracted_text: string } {
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
    extractedText = cleanExtractedText(extractedText);
    
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

/**
 * Clean up and normalize extracted text
 */
function cleanExtractedText(text: string): string {
  return text
    // Replace multiple newlines with double newlines (paragraph breaks)
    .replace(/\n{3,}/g, "\n\n")
    // Remove excessive spaces
    .replace(/[ \t]{3,}/g, " ")
    // Normalize whitespace around punctuation
    .replace(/\s+([.,;:!?])/g, "$1");
}
