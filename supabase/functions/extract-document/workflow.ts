
import { EDEN_AI_API_KEY, validateAPIKey } from "./utils.ts";

/**
 * Calls Eden AI workflow API with proper FormData structure
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
    
    // Create FormData object for the request
    const formData = new FormData();
    
    // Add each input to FormData with the proper field name
    // For resume, we need to convert base64 to a blob
    if (inputs.resume) {
      // Convert base64 to blob
      const base64Data = inputs.resume.split(',')[1] || inputs.resume;
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      // Create blob and add to FormData with the exact field name "Resume"
      const blob = new Blob(byteArrays);
      formData.append('Resume', blob, 'resume.pdf');
      console.log("Added Resume file to FormData");
    }
    
    // Add job description with exact field name "Jobdescription"
    if (inputs.Jobdescription) {
      formData.append('Jobdescription', inputs.Jobdescription);
      console.log("Added Jobdescription text to FormData");
    }
    
    console.log("FormData created with fields:", 
      Array.from(formData.entries()).map(entry => entry[0]));
    
    // Add logging to help debug the request
    console.log(`Authorization header will use token of length: ${EDEN_AI_API_KEY?.length || 0}`);
    
    // Send the request to Eden AI using FormData
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${EDEN_AI_API_KEY}`
        // FormData sets its own content-type with boundary
      },
      body: formData
    });
    
    // Log the response status and headers for debugging
    console.log(`Eden AI API response status: ${response.status}`);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
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
