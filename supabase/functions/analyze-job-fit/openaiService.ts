
import { AnalysisInput, AnalysisResult } from "./types.ts";
import { createAnalysisPrompt, parseAnalysisResponse } from "./analysisUtils.ts";

// Generate job fit analysis using OpenAI API
export async function generateJobFitAnalysis(input: AnalysisInput): Promise<AnalysisResult> {
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  
  if (!OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY environment variable not set");
    throw new Error("A chave da API OpenAI não está configurada");
  }
  
  try {
    // Create a prompt for the OpenAI API
    const prompt = createAnalysisPrompt(input);
    
    console.log("Sending request to OpenAI API");
    console.log("Analyzing job fit for:", input.jobTitle);
    console.log("Resume text length:", input.resumeText.length);
    console.log("Job description length:", input.jobDescription.length);
    console.log("Cover letter provided:", !!input.coverLetterText);
    console.log("References provided:", !!input.referenceText);
    
    // Call the OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: 
              "You are an expert career advisor specializing in job application analysis. " + 
              "Your task is to compare a candidate's profile with a job description and provide structured feedback. " +
              "Focus on being accurate, honest, and constructive. " + 
              "All responses must be in Portuguese. " +
              "VERY IMPORTANT: Your response must be in valid JSON format only with no markdown formatting."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 1500
      })
    });
    
    // Check if the response was successful
    if (!response.ok) {
      const errorDetails = await response.text();
      console.error("OpenAI API request failed:", response.status, errorDetails);
      throw new Error(`Falha na requisição à API OpenAI: ${response.status}`);
    }
    
    // Parse the response
    const responseData = await response.json();
    const content = responseData.choices[0]?.message?.content;
    
    if (!content) {
      console.error("No content in OpenAI response:", responseData);
      throw new Error("Nenhum conteúdo na resposta da API OpenAI");
    }
    
    console.log("Received response from OpenAI API, parsing result");
    console.log("Response sample:", content.substring(0, 200));
    
    // Parse the content into the required format
    return parseAnalysisResponse(content);
  } catch (error) {
    console.error("Error generating job fit analysis:", error);
    throw new Error(`Erro ao gerar análise de compatibilidade: ${error.message}`);
  }
}
