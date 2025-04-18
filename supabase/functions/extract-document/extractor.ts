
import { callEdenAIWorkflow } from "./workflow.ts";
import { callEdenAIOCR, processEdenAIResponse } from "./ocr-api.ts";

/**
 * Calls Eden AI OCR API for text extraction, using either workflow or direct OCR
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
    // Create payload for document extraction workflow - field name matters!
    const workflowPayload = {
      document: fileBase64  // This will be converted to a file field named "document" in workflow.ts
    };
    return callEdenAIWorkflow(workflowPayload, workflowId);
  } else {
    console.log(`Calling Eden AI OCR API with ${provider} provider...`);
    return callEdenAIOCR(fileBase64, fileType, provider, language);
  }
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
      // Create payload for document extraction workflow
      const workflowPayload = {
        document: fileBase64  // This will be processed as a file field named "document"
      };
      const data = await callEdenAIWorkflow(workflowPayload, workflowId);
      
      // Process workflow response for document extraction
      if (data && data.extracted_text) {
        return {
          success: true,
          extracted_text: data.extracted_text
        };
      }
      // If workflow processing returned no text, continue to OCR providers
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
