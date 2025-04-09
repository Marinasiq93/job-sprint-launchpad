
import { EDEN_AI_API_KEY } from "./utils.ts";

/**
 * Calls Eden AI workflow API
 */
export async function callEdenAIWorkflow(
  inputs: Record<string, any>,
  workflowId: string
): Promise<any> {
  if (!EDEN_AI_API_KEY || EDEN_AI_API_KEY.length < 20) {
    console.error("Eden AI API key issue:", EDEN_AI_API_KEY ? "Key too short" : "Key not found");
    throw new Error("Eden AI API key is not configured correctly");
  }
  
  console.log(`Sending request to Eden AI workflow for workflow ID: ${workflowId}`);
  console.log(`Input keys: ${Object.keys(inputs).join(', ')}`);
  
  try {
    const apiUrl = `https://api.edenai.run/v2/workflow/${workflowId}/execution/`;
    console.log(`Sending request to Eden AI workflow API endpoint: ${apiUrl}`);
    
    // Log the request payload for debugging (excluding actual content)
    console.log("Request payload keys:", Object.keys(inputs));
    
    // According to Eden AI documentation, we need to send inputs directly as top-level parameters
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${EDEN_AI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(inputs)
    });
    
    // Log the response status and headers
    console.log(`Eden AI API response status: ${response.status}`);
    console.log(`Eden AI API response headers:`, Object.fromEntries([...response.headers]));
    
    // Check if the request was successful
    if (!response.ok) {
      // Log the full error response for debugging
      const errorText = await response.text();
      console.error(`Eden AI API error (${response.status}): ${errorText}`);
      
      // Check for specific error codes
      if (response.status === 404) {
        throw new Error(`Workflow ID ${workflowId} not found`);
      } else if (response.status === 401) {
        throw new Error('Unauthorized: Check your Eden AI API key');
      } else if (response.status === 400) {
        throw new Error(`Bad request: ${errorText}`);
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded: Too many requests to Eden AI');
      }
      
      // For other error codes, throw a generic error
      throw new Error(`Eden AI API request failed: ${response.status}`);
    }
    
    // Parse the response
    const data = await response.json();
    
    // Log the response structure to help with debugging
    console.log("Eden AI workflow response structure:", JSON.stringify({
      status: data.status,
      has_content: !!data.content,
      has_results: data && data.results ? true : false,
      keys: Object.keys(data)
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
