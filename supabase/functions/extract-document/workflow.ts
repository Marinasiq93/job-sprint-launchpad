
import { EDEN_AI_API_KEY, validateAPIKey } from "./utils.ts";

/**
 * Calls Eden AI workflow API with simplified input structure
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
    
    // Log the input keys and sizes for debugging
    const inputsDebug = Object.fromEntries(
      Object.entries(inputs).map(([key, value]) => {
        if (typeof value === 'string') {
          return [key, `(length: ${value.length})`];
        }
        return [key, value];
      })
    );
    console.log("Request payload summary:", inputsDebug);
    
    // Send the request to Eden AI
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${EDEN_AI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(inputs)
    });
    
    // Log the response status
    console.log(`Eden AI API response status: ${response.status}`);
    
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
      }
      
      throw new Error(`Falha na requisição da API: ${response.status}`);
    }
    
    // Parse the response
    const data = await response.json();
    
    console.log("Eden AI workflow response structure:", {
      status: data.status,
      has_content: !!data.content,
      has_results: data && data.results ? true : false,
      keys: Object.keys(data)
    });
    
    // Return the results based on common Eden AI workflow response formats
    if (data.status === 'success' && data.results) {
      return data.results;
    }
    
    if (data.content && typeof data.content === 'object') {
      return data.content;
    }
    
    // If output is available directly, return that
    if (data.output) {
      return { output: data.output };
    }
    
    // Return the whole data as a fallback
    return data;
  } catch (error) {
    console.error("Error calling Eden AI workflow:", error);
    throw error;
  }
}
