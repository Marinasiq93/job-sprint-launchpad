
import { EDEN_AI_API_KEY } from "./utils.ts";

/**
 * Calls Eden AI workflow API
 */
export async function callEdenAIWorkflow(
  inputs: Record<string, any>,
  workflowId: string
): Promise<any> {
  if (!EDEN_AI_API_KEY) {
    throw new Error("Eden AI API key is not configured");
  }
  
  console.log(`Sending request to Eden AI workflow for workflow ID: ${workflowId}`);
  
  try {
    // According to Eden AI documentation, we need to send inputs directly as top-level parameters
    const response = await fetch(`https://api.edenai.run/v2/workflow/${workflowId}/execution/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${EDEN_AI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(inputs) // Send inputs directly as top-level properties
    });
    
    // Check if the request was successful
    if (!response.ok) {
      // Check for specific error codes
      if (response.status === 404) {
        throw new Error(`Workflow ID ${workflowId} not found`);
      } else if (response.status === 401) {
        throw new Error('Unauthorized: Check your Eden AI API key');
      }
      
      // For other error codes, try to get more details from the response
      const errorBody = await response.text();
      throw new Error(`Eden AI API request failed: ${response.status} - ${errorBody}`);
    }
    
    // Parse the response
    const data = await response.json();
    
    // Log the response structure to help with debugging
    console.log("Eden AI workflow response structure:", JSON.stringify({
      status: data.status,
      has_content: !!data.content,
      has_results: data && data.results ? true : false
    }));
    
    // Return the results from the workflow response according to documentation
    if (data.status === 'success' && data.results) {
      return data.results;
    }
    
    if (data.content && typeof data.content === 'object') {
      return data.content;
    }
    
    // If we can't find results in the expected locations, return the whole data
    console.warn("Eden AI workflow response format unexpected, returning raw data");
    return data;
  } catch (error) {
    console.error("Error calling Eden AI workflow:", error);
    throw error;
  }
}

/**
 * Processes document extraction response from workflow
 */
export function processDocumentExtractionResponse(data: any, fileName: string): { success: boolean, extracted_text: string } | null {
  if (!data) return null;
  
  try {
    // Extract the text from the workflow response based on the expected structure
    if (data.workflow_result && typeof data.workflow_result === 'string') {
      return {
        success: true,
        extracted_text: data.workflow_result
      };
    } else if (data.extracted_text && typeof data.extracted_text === 'string') {
      return {
        success: true,
        extracted_text: data.extracted_text
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error processing workflow response for ${fileName}:`, error);
    return null;
  }
}
