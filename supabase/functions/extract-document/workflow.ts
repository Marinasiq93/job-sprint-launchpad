
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
        // No need to set Content-Type, FormData will set it with correct boundary
      },
      body: formData
    });
    
    console.log(`Eden AI response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Eden AI API error (${response.status}):`, errorText);
      throw new Error(`Eden AI API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Eden AI workflow response received:", JSON.stringify({
      status: data.status,
      has_results: !!data.results,
      keys: Object.keys(data)
    }));
    
    // Return the results
    if (data.status === 'success' && data.results) {
      return data.results;
    } else if (data.content && typeof data.content === 'object') {
      return data.content;
    } else if (data.output) {
      return { output: data.output };
    }
    
    return data;
  } catch (error) {
    console.error("Error calling Eden AI workflow:", error);
    throw error;
  }
}
