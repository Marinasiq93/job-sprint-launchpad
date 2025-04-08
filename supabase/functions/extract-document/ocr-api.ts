
import { EDEN_AI_API_KEY, cleanExtractedText } from "./utils.ts";

/**
 * Calls Eden AI OCR API directly
 */
export async function callEdenAIOCR(
  fileBase64: string, 
  fileType: string, 
  provider: string, 
  language: string
): Promise<any> {
  // Ensure we have a valid file content
  if (!fileBase64 || fileBase64.length < 100) {
    throw new Error("Invalid or empty file content provided");
  }
  
  // Format the fileType correctly for Eden AI
  const fileExtension = fileType.split('/')[1] || 'pdf';
  
  // Construct proper payload for Eden AI with file_base64 parameter
  const edenAIPayload = {
    providers: provider,
    file_base64: fileBase64,
    file_type: fileExtension, // Pass just the extension like 'pdf', 'png', etc
    language: language,
    // Additional OCR settings for better quality
    ocr_settings: {
      density: "high",
      table_recognition: true,
      region_recognition: true,
      font_enhancement: true
    }
  };
  
  console.log(`Sending request to Eden AI with ${provider} for file type: ${fileExtension}`);
  
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
    console.error(`Eden AI API error response (${response.status}):`, errorText);
    throw new Error(`Eden AI API error with ${provider}: ${errorText}`);
  }
  
  return await response.json();
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
    
    // Check for binary data in the extracted text
    const hasBinaryData = /[^\x20-\x7E\xA0-\xFF\n\r\t ]/g.test(extractedText);
    const hasEnoughText = extractedText.length > 100;
    
    if (hasBinaryData || !hasEnoughText) {
      console.log(`Text quality issues detected: binary data = ${hasBinaryData}, length = ${extractedText.length}`);
      return {
        success: false,
        extracted_text: `Não foi possível extrair o texto corretamente. Por favor, copie e cole manualmente o texto.`
      };
    }
    
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
