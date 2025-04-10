
import { EDEN_AI_API_KEY, validateAPIKey } from "./utils.ts";

/**
 * Calls Eden AI workflow API
 */
export async function callEdenAIWorkflow(
  inputs: Record<string, any>,
  workflowId: string
): Promise<any> {
  // Verify API key before sending request
  if (!validateAPIKey()) {
    console.error("Eden AI API key validation failed");
    throw new Error("API de análise não configurada corretamente");
  }
  
  console.log(`Sending request to Eden AI workflow for workflow ID: ${workflowId}`);
  console.log(`Input keys: ${Object.keys(inputs).join(', ')}`);
  
  try {
    // Use the direct workflow execution endpoint format
    const apiUrl = `https://api.edenai.run/v2/workflow/${workflowId}/execution/`;
    console.log(`Sending request to Eden AI workflow API endpoint: ${apiUrl}`);
    
    // Log the full input structure for debugging (excluding content length)
    const inputsDebug = Object.fromEntries(
      Object.entries(inputs).map(([key, value]) => {
        if (typeof value === 'string' && value.length > 100) {
          return [key, `${value.substring(0, 50)}... (truncated, length: ${value.length})`];
        }
        return [key, value];
      })
    );
    console.log("Full request payload structure:", JSON.stringify(inputsDebug));
    
    // Send inputs directly as top-level parameters according to the Eden AI API documentation you shared
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
        throw new Error(`Workflow ID ${workflowId} não encontrado`);
      } else if (response.status === 401) {
        throw new Error('Problema de autenticação: Verifique a chave de API');
      } else if (response.status === 400) {
        throw new Error(`Requisição inválida: ${errorText}`);
      } else if (response.status === 429) {
        throw new Error('Taxa limite excedida: Muitas requisições para Eden AI');
      }
      
      // For other error codes, throw a generic error
      throw new Error(`Falha na requisição da API: ${response.status}`);
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
