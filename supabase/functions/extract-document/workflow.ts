
import { EDEN_AI_API_KEY, hasBinaryData, formatDocumentWithMetadata } from "./utils.ts";

/**
 * Calls Eden AI Workflow API
 */
export async function callEdenAIWorkflow(
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
 * Process workflow response data
 */
export function processWorkflowResponse(
  data: any, 
  fileName: string
): { success: boolean, extracted_text: string } | null {
  // Process the workflow response
  if (data && data.workflow_result && typeof data.workflow_result === 'string') {
    console.log(`Workflow successful with ${data.workflow_result.length} chars`);
    
    // Check if the text contains binary data
    if (hasBinaryData(data.workflow_result)) {
      console.warn(`Workflow result contains binary data, will try OCR providers instead`);
      return null;
    }
    
    return {
      success: true,
      extracted_text: formatDocumentWithMetadata(
        fileName, 
        "Documento processado por workflow", 
        data.workflow_result
      )
    };
  } 
  
  if (data && data.workflow_result && data.workflow_result.extracted_text) {
    console.log(`Workflow successful with ${data.workflow_result.extracted_text.length} chars`);
    
    // Check for binary data in extracted text
    if (hasBinaryData(data.workflow_result.extracted_text)) {
      console.warn(`Workflow result contains binary data, will try OCR providers instead`);
      return null;
    }
    
    return {
      success: true,
      extracted_text: formatDocumentWithMetadata(
        fileName, 
        "Documento processado por workflow", 
        data.workflow_result.extracted_text
      )
    };
  } 
  
  if (data && data.workflow_result) {
    // Try to find any text content in the workflow result object
    const workflowResultString = JSON.stringify(data.workflow_result);
    if (workflowResultString.length > 100) {
      console.log(`Using workflow result data: ${workflowResultString.substring(0, 100)}...`);
      return {
        success: true,
        extracted_text: formatDocumentWithMetadata(
          fileName, 
          "Documento processado por IA", 
          workflowResultString
        )
      };
    }
  }
  
  return null;
}
