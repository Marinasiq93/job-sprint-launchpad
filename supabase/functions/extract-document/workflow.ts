
import { EDEN_AI_API_KEY, hasBinaryData, formatDocumentWithMetadata } from "./utils.ts";

/**
 * Calls Eden AI Workflow API with custom payload format
 */
export async function callEdenAIWorkflow(
  workflowPayload: any,
  workflowId: string
): Promise<any> {
  console.log(`Using Eden AI workflow ${workflowId} for extraction...`);
  
  // Ensure we have valid API key
  if (!EDEN_AI_API_KEY) {
    throw new Error("Missing Eden AI API key");
  }
  
  console.log(`Sending request to Eden AI workflow for workflow ID: ${workflowId}`);
  
  try {
    // Call the Eden AI workflow API
    const response = await fetch("https://api.edenai.run/v2/workflows/execute", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${EDEN_AI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(workflowPayload)
    });
    
    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Eden AI Workflow API error response (${response.status}):`, errorText);
      
      // Log more details about the request
      console.error("Request details:", {
        url: "https://api.edenai.run/v2/workflows/execute",
        method: "POST",
        workflow_id: workflowPayload.workflow_id,
        response_status: response.status,
        response_text: errorText.substring(0, 200) // Log first 200 chars of error
      });
      
      // If 404, the workflow might no longer exist
      if (response.status === 404) {
        throw new Error(`Eden AI Workflow ID ${workflowId} not found (404). The workflow may have been deleted or is no longer accessible.`);
      }
      
      throw new Error(`Eden AI Workflow error: ${response.status} ${errorText}`);
    }
    
    // Parse the response
    const data = await response.json();
    console.log("Eden AI workflow response structure:", JSON.stringify({
      has_response: !!data,
      has_outputs: data && data.outputs ? true : false,
      output_keys: data && data.outputs ? Object.keys(data.outputs) : []
    }));
    
    // Return the outputs from the workflow response
    return data.outputs || {};
  } catch (error) {
    console.error(`Error calling Eden AI workflow: ${error.message}`);
    throw error;
  }
}

/**
 * Process workflow response for document extraction
 */
export function processDocumentExtractionResponse(
  data: any, 
  fileName: string
): { success: boolean, extracted_text: string } | null {
  // Process the workflow response for document extraction
  if (!data) {
    console.error("No data returned from workflow");
    return null;
  }
  
  // Standard document extraction response processing
  if (typeof data.workflow_result === 'string') {
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
  
  if (data.workflow_result && data.workflow_result.extracted_text) {
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
  
  if (data.workflow_result) {
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
