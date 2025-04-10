import { EDEN_AI_API_KEY, validateAPIKey } from "./utils.ts";

const WORKFLOW_POLL_INTERVAL = 3000; // 3 seconds 
const WORKFLOW_MAX_POLLS = 20; // Increased maximum number of polling attempts

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
    console.log(`Eden AI API endpoint: ${apiUrl}`);
    
    // Create FormData object for the request
    const formData = new FormData();
    
    // Debug log what we're sending
    console.log("Preparing inputs for Eden AI workflow:");
    
    // For resume file, convert base64 to blob and set as 'resume' field
    if (inputs.resume) {
      console.log("Processing resume base64 data...");
      
      try {
        // Extract the base64 data part if it includes the data URL prefix
        const base64Data = inputs.resume.includes(',') 
          ? inputs.resume.split(',')[1] 
          : inputs.resume;
        
        console.log(`Resume base64 length: ${base64Data.length}`);
        
        // Convert base64 to binary array
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Create blob and add to FormData
        const blob = new Blob([bytes], { type: 'application/pdf' });
        formData.append('resume', blob, 'resume.pdf');
        console.log("Resume blob created and added to FormData with key 'resume'");
      } catch (error) {
        console.error("Error processing resume base64:", error);
        throw new Error("Error processing resume data");
      }
    }
    
    // Add job description as plain text
    if (inputs.jobDescription) {
      formData.append('job_description', inputs.jobDescription);
      console.log("Added job description to FormData with key 'job_description'");
    }
    
    // Add any other inputs as form fields
    for (const [key, value] of Object.entries(inputs)) {
      if (key !== 'resume' && key !== 'jobDescription') {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          formData.append(key, String(value));
          console.log(`Added field ${key} to FormData`);
        }
      }
    }
    
    console.log("Final FormData fields:", 
      Array.from(formData.entries()).map(entry => entry[0]));
    
    console.log(`Using Eden AI API Key: ${EDEN_AI_API_KEY ? "Yes (configured)" : "No (missing)"}`);
    
    // Send the request to Eden AI
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${EDEN_AI_API_KEY}`
      },
      body: formData
    });
    
    console.log(`Eden AI workflow execution initiated - status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Eden AI API error (${response.status}):`, errorText);
      throw new Error(`Eden AI API error: ${response.status} - ${errorText}`);
    }
    
    // Get the initial response which contains the execution ID
    const executionData = await response.json();
    console.log("Eden AI workflow execution initiated:", JSON.stringify({
      id: executionData.id,
      status: executionData.status
    }));
    
    // Now poll for the execution results
    const executionId = executionData.id;
    if (!executionId) {
      console.error("No execution ID received from Eden AI");
      throw new Error("No execution ID received from Eden AI");
    }
    
    console.log(`Polling for execution results, ID: ${executionId}`);
    
    // Poll for results
    const results = await pollForWorkflowResults(workflowId, executionId);
    return results;
  } catch (error) {
    console.error("Error calling Eden AI workflow:", error);
    throw error;
  }
}

/**
 * Poll for workflow execution results until they are available
 */
async function pollForWorkflowResults(
  workflowId: string,
  executionId: string,
  pollCount = 0
): Promise<any> {
  if (pollCount >= WORKFLOW_MAX_POLLS) {
    console.error(`Maximum polling attempts (${WORKFLOW_MAX_POLLS}) reached without getting results`);
    throw new Error(`Tempo limite excedido para análise (após ${WORKFLOW_MAX_POLLS} tentativas)`);
  }
  
  console.log(`Polling for results (attempt ${pollCount + 1}/${WORKFLOW_MAX_POLLS})`);
  
  // Construct the URL for getting execution results
  const apiUrl = `https://api.edenai.run/v2/workflow/${workflowId}/execution/${executionId}/`;
  console.log(`Polling URL: ${apiUrl}`);
  
  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${EDEN_AI_API_KEY}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      const errorStatus = response.status;
      const errorBody = await response.text();
      console.error(`Error fetching execution results: ${errorStatus} - ${errorBody}`);
      
      if (errorStatus === 404) {
        throw new Error(`Execução do workflow não encontrada (ID: ${executionId})`);
      }
      
      if (errorStatus === 401 || errorStatus === 403) {
        throw new Error(`Erro de autenticação ao acessar o workflow (${errorStatus})`);
      }
      
      // For other errors, continue polling
      await new Promise(resolve => setTimeout(resolve, WORKFLOW_POLL_INTERVAL));
      return pollForWorkflowResults(workflowId, executionId, pollCount + 1);
    }
    
    const data = await response.json();
    console.log("Execution status poll response:", JSON.stringify({
      status: data.status,
      has_content: !!data.content,
      has_results: !!data.results,
      content_keys: data.content ? Object.keys(data.content) : [],
      results_keys: data.results ? Object.keys(data.results) : []
    }));
    
    // If the workflow is still running, poll again
    if (data.status === 'pending' || data.status === 'running' || data.status === 'created') {
      await new Promise(resolve => setTimeout(resolve, WORKFLOW_POLL_INTERVAL));
      return pollForWorkflowResults(workflowId, executionId, pollCount + 1);
    }
    
    // If the workflow failed, throw an error
    if (data.status === 'failed' || data.status === 'error') {
      console.error(`Workflow execution failed with status: ${data.status}`);
      const errorMessage = data.error || `Falha na execução do workflow (${data.status})`;
      throw new Error(errorMessage);
    }
    
    // If the workflow is completed, return the results
    if (data.status === 'success' || data.status === 'completed') {
      console.log("Workflow execution completed successfully");
      
      // Navigate the response structure to find the results
      if (data.results && Object.keys(data.results).length > 0) {
        console.log("Returning 'results' from workflow response");
        return data.results;
      } else if (data.content && typeof data.content === 'object' && Object.keys(data.content).length > 0) {
        console.log("Returning 'content' from workflow response");
        return data.content;
      } else if (data.output) {
        console.log("Returning 'output' from workflow response");
        return { output: data.output };
      } else if (data.job_fit_feedback) {
        console.log("Returning 'job_fit_feedback' from workflow response");
        return { job_fit_feedback: data.job_fit_feedback };
      }
      
      // Return the entire response if we can't find specific results
      console.log("Returning entire workflow response data");
      return data;
    } else {
      console.error(`Workflow execution has unexpected status: ${data.status}`);
      throw new Error(`Status inesperado no workflow: ${data.status}`);
    }
  } catch (error) {
    console.error(`Error polling for results:`, error);
    
    // If we've made more than a few attempts, we'll throw the error
    // Otherwise we'll keep trying
    if (pollCount > 5 && error.message.includes("Execução do workflow não encontrada")) {
      throw error;
    }
    
    // If it's a network error or temporary failure, keep polling
    if (!(error.message.includes("Tempo limite excedido") || 
          error.message.includes("Erro de autenticação"))) {
      await new Promise(resolve => setTimeout(resolve, WORKFLOW_POLL_INTERVAL));
      return pollForWorkflowResults(workflowId, executionId, pollCount + 1);
    }
    
    throw error;
  }
}
