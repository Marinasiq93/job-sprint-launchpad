
import { EDEN_AI_API_KEY, hasBinaryData, formatDocumentWithMetadata } from "./utils.ts";

/**
 * Calls Eden AI Workflow API with proper payload format based on documentation
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
    // According to documentation, we need to send inputs directly as top-level parameters
    // So we extract the inputs from the payload and send them directly
    const response = await fetch(`https://api.edenai.run/v2/workflow/${workflowId}/execution/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${EDEN_AI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(workflowPayload.inputs) // Send inputs directly as top-level properties
    });
    
    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Eden AI Workflow API error response (${response.status}):`, errorText);
      
      // Log more details about the request
      console.error("Request details:", {
        url: `https://api.edenai.run/v2/workflow/${workflowId}/execution/`,
        method: "POST",
        workflow_id: workflowId,
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
      status: data.status,
      has_results: data && data.results ? true : false
    }));
    
    // Return the results from the workflow response according to documentation
    if (data.status === 'success' && data.results) {
      return data.results;
    }
    
    // If workflow is still processing
    if (data.status === 'processing') {
      console.log("Workflow is still processing, consider using async approach in future");
      return { workflow_processing: true };
    }
    
    // Return whatever data we have
    return data;
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
  
  // Handle the case where we're getting a direct text result
  if (typeof data === 'string') {
    console.log(`Workflow successful with ${data.length} chars of string data`);
    
    // Check if the text contains binary data
    if (hasBinaryData(data)) {
      console.warn(`Workflow result contains binary data, will try OCR providers instead`);
      return null;
    }
    
    return {
      success: true,
      extracted_text: formatDocumentWithMetadata(
        fileName, 
        "Documento processado por workflow", 
        data
      )
    };
  }
  
  // Standard document extraction response processing
  if (data.job_fit_feedback) {
    console.log(`Workflow returned job fit feedback with ${data.job_fit_feedback.length} chars`);
    return {
      success: true,
      extracted_text: formatDocumentWithMetadata(
        fileName, 
        "Documento processado por workflow", 
        data.job_fit_feedback
      )
    };
  }
  
  if (data.extracted_text) {
    console.log(`Workflow successful with ${data.extracted_text.length} chars`);
    
    // Check for binary data in extracted text
    if (hasBinaryData(data.extracted_text)) {
      console.warn(`Workflow result contains binary data, will try OCR providers instead`);
      return null;
    }
    
    return {
      success: true,
      extracted_text: formatDocumentWithMetadata(
        fileName, 
        "Documento processado por workflow", 
        data.extracted_text
      )
    };
  } 
  
  if (data.workflow_processing) {
    console.log("Workflow is still processing, returning null");
    return null;
  }
  
  // Try to find any text content in the workflow result object
  if (data) {
    // Convert to string if it's an object
    const workflowResultString = typeof data === 'object' ? JSON.stringify(data) : String(data);
    if (workflowResultString && workflowResultString.length > 100) {
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
