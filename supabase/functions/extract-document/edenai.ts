import { corsHeaders } from "./cors.ts";

const EDEN_AI_API_KEY = Deno.env.get("EDEN_AI_API_KEY");

/**
 * Calls Eden AI OCR API for text extraction
 */
export async function callEdenAI(
  fileBase64: string, 
  fileType: string, 
  provider: string, 
  language: string,
  useWorkflow: boolean = false,
  workflowId: string = ""
): Promise<any> {
  if (useWorkflow && workflowId) {
    console.log(`Calling Eden AI workflow ${workflowId}...`);
    return callEdenAIWorkflow(fileBase64, fileType, workflowId);
  } else {
    console.log(`Calling Eden AI OCR API with ${provider} provider...`);
    return callEdenAIOCR(fileBase64, fileType, provider, language);
  }
}

/**
 * Calls Eden AI Workflow API
 */
async function callEdenAIWorkflow(
  fileBase64: string,
  fileType: string,
  workflowId: string
): Promise<any> {
  console.log(`Using Eden AI workflow ${workflowId} for extraction...`);
  
  // Ensure we have a valid file content
  if (!fileBase64 || fileBase64.length < 100) {
    throw new Error("Invalid or empty file content provided");
  }
  
  // Format the fileType correctly for Eden AI
  const fileExtension = fileType.split('/')[1] || 'pdf';
  
  // Construct payload for Eden AI workflow
  const workflowPayload = {
    workflow_id: workflowId,
    file_base64: fileBase64,
    file_type: fileExtension
  };
  
  console.log(`Sending request to Eden AI workflow for file type: ${fileExtension}`);
  
  try {
    const response = await fetch("https://api.edenai.run/v2/workflows/execute", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${EDEN_AI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(workflowPayload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Eden AI Workflow API error response (${response.status}):`, errorText);
      throw new Error(`Eden AI Workflow error: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error calling Eden AI workflow: ${error.message}`);
    throw error;
  }
}

/**
 * Calls Eden AI OCR API directly
 */
async function callEdenAIOCR(
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
 * Try multiple providers in sequence until successful
 */
export async function extractWithFallbacks(
  fileBase64: string, 
  fileType: string, 
  providers: string[], 
  language: string, 
  fileName: string,
  useWorkflow: boolean = false,
  workflowId: string = ""
): Promise<{ success: boolean, extracted_text: string }> {
  let lastError = null;
  
  // If using workflow, try it first
  if (useWorkflow && workflowId) {
    try {
      console.log(`Trying Eden AI workflow: ${workflowId}`);
      const data = await callEdenAIWorkflow(fileBase64, fileType, workflowId);
      
      // Process the workflow response
      if (data && data.workflow_result && typeof data.workflow_result === 'string') {
        console.log(`Workflow successful with ${data.workflow_result.length} chars`);
        
        // Check if the text contains binary data
        const hasBinaryData = /[^\x20-\x7E\xA0-\xFF\n\r\t ]/g.test(data.workflow_result);
        if (hasBinaryData) {
          console.warn(`Workflow result contains binary data, will try OCR providers instead`);
        } else {
          return {
            success: true,
            extracted_text: `Arquivo: ${fileName}\nTipo: Documento processado por workflow\nData de extração: ${new Date().toLocaleString()}\n\n${data.workflow_result}`
          };
        }
      } else if (data && data.workflow_result && data.workflow_result.extracted_text) {
        console.log(`Workflow successful with ${data.workflow_result.extracted_text.length} chars`);
        
        // Check for binary data in extracted text
        const hasBinaryData = /[^\x20-\x7E\xA0-\xFF\n\r\t ]/g.test(data.workflow_result.extracted_text);
        if (hasBinaryData) {
          console.warn(`Workflow result contains binary data, will try OCR providers instead`);
        } else {
          return {
            success: true,
            extracted_text: `Arquivo: ${fileName}\nTipo: Documento processado por workflow\nData de extração: ${new Date().toLocaleString()}\n\n${data.workflow_result.extracted_text}`
          };
        }
      } else if (data && data.workflow_result) {
        // Try to find any text content in the workflow result object
        const workflowResultString = JSON.stringify(data.workflow_result);
        if (workflowResultString.length > 100) {
          console.log(`Using workflow result data: ${workflowResultString.substring(0, 100)}...`);
          return {
            success: true,
            extracted_text: `Arquivo: ${fileName}\nTipo: Documento processado por IA\nData de extração: ${new Date().toLocaleString()}\n\n${workflowResultString}`
          };
        }
      }
    } catch (error) {
      lastError = error;
      console.error(`Error with workflow ${workflowId}:`, error);
      // Continue to OCR providers as fallback
    }
  }
  
  // Try each OCR provider in sequence
  for (const provider of providers) {
    try {
      console.log(`Trying OCR provider: ${provider}`);
      const data = await callEdenAIOCR(fileBase64, fileType, provider, language);
      
      // Process the response
      const result = processEdenAIResponse(data, provider, fileName);
      
      // If we got a reasonable amount of text, return it
      if (result.success && result.extracted_text && result.extracted_text.length > 500) {
        console.log(`Provider ${provider} successful with ${result.extracted_text.length} chars`);
        return result;
      }
    } catch (error) {
      lastError = error;
      console.error(`Error with provider ${provider}:`, error);
      // Continue to next provider
    }
  }
  
  // If all providers failed, return error with the last error message
  return {
    success: false,
    extracted_text: `Não foi possível extrair o texto do arquivo: ${fileName}. Erro: ${lastError?.message || "Desconhecido"}. Por favor, copie e cole o texto manualmente.`
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
    .replace(/\s+([.,;:!?])/g, "$1")
    // Remove any non-printable characters
    .replace(/[^\x20-\x7E\xA0-\xFF\n\r\t ]/g, "");
}
