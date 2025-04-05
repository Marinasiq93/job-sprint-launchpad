
// Import OpenAI API types
interface AnalysisInput {
  jobTitle: string;
  jobDescription: string;
  resumeText: string;
  coverLetterText?: string;
  referenceText?: string;
}

interface AnalysisResult {
  compatibilityScore: string;
  keySkills: string[];
  relevantExperiences: string[];
  identifiedGaps: string[];
}

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
              "All responses must be in Portuguese."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 1000
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

// Create a prompt for the OpenAI API
function createAnalysisPrompt(input: AnalysisInput): string {
  const { jobTitle, jobDescription, resumeText, coverLetterText, referenceText } = input;
  
  let prompt = `
Analise a compatibilidade entre o perfil do candidato e a vaga de emprego a seguir.

## VAGA
Título: ${jobTitle}

Descrição:
${jobDescription}

## PERFIL DO CANDIDATO
### Currículo
${resumeText}
`;

  // Add cover letter if available
  if (coverLetterText && coverLetterText.trim() !== "") {
    prompt += `
### Carta de Apresentação
${coverLetterText}
`;
  }

  // Add reference if available
  if (referenceText && referenceText.trim() !== "") {
    prompt += `
### Referências
${referenceText}
`;
  }

  // Add instructions for the output format
  prompt += `
## INSTRUÇÕES
Baseado na comparação entre o perfil do candidato e os requisitos da vaga, forneça uma análise estruturada nos seguintes formatos:

1. Compatibilidade com a Vaga: Uma classificação qualitativa (Baixa, Média-Baixa, Média, Média-Alta, Alta) seguida de uma porcentagem estimada.

2. Principais Habilidades Identificadas: Uma lista de 3-5 habilidades ou competências do candidato que são relevantes para esta vaga específica.

3. Experiências ou Projetos Relevantes: Uma lista de 3-5 experiências ou projetos do candidato que demonstram sua aptidão para a vaga.

4. Lacunas Identificadas: Uma lista de 3-5 habilidades ou experiências que o candidato precisaria desenvolver para se adequar melhor à vaga.

Sua resposta deve estar em formato JSON com o seguinte padrão:
{
  "compatibilityScore": "Texto com classificação qualitativa e porcentagem",
  "keySkills": ["habilidade 1", "habilidade 2", "habilidade 3"],
  "relevantExperiences": ["experiência 1", "experiência 2", "experiência 3"],
  "identifiedGaps": ["lacuna 1", "lacuna 2", "lacuna 3"]
}
`;

  // Log the prompt length
  console.log("Analysis prompt created, length:", prompt.length);
  
  return prompt;
}

// Parse the response from the OpenAI API
function parseAnalysisResponse(content: string): AnalysisResult {
  try {
    // Try to find and extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.error("No JSON found in OpenAI response");
      throw new Error("Formato de resposta inválido");
    }
    
    // Parse the JSON
    const jsonText = jsonMatch[0];
    console.log("Found JSON in response:", jsonText.substring(0, 100) + "...");
    
    // Remove any markdown formatting that might be in the JSON string
    const cleanJsonText = jsonText.replace(/```json|```/g, '').trim();
    
    // Parse the cleaned JSON
    const result = JSON.parse(cleanJsonText);
    
    // Validate the result has all the required fields
    if (!result.compatibilityScore || !Array.isArray(result.keySkills) || 
        !Array.isArray(result.relevantExperiences) || !Array.isArray(result.identifiedGaps)) {
      console.error("Invalid response format, missing required fields:", result);
      throw new Error("Formato de resposta inválido, campos obrigatórios ausentes");
    }
    
    // Return the validated result
    return {
      compatibilityScore: result.compatibilityScore,
      keySkills: result.keySkills,
      relevantExperiences: result.relevantExperiences,
      identifiedGaps: result.identifiedGaps
    };
  } catch (error) {
    console.error("Error parsing OpenAI response:", error);
    console.error("Raw response content:", content);
    throw new Error(`Erro ao processar resposta da API: ${error.message}`);
  }
}
