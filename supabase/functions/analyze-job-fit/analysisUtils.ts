
import { AnalysisInput, AnalysisResult } from "./types.ts";

// Create a prompt for the OpenAI API with better handling of longer content
export function createAnalysisPrompt(input: AnalysisInput): string {
  const { jobTitle, jobDescription, resumeText, coverLetterText, referenceText } = input;
  
  // Process job description - trim if too long
  const maxJobDescriptionLength = 4000;
  const processedJobDescription = 
    jobDescription.length > maxJobDescriptionLength
      ? jobDescription.substring(0, maxJobDescriptionLength) + "... (texto truncado devido ao tamanho)"
      : jobDescription;

  // Process resume text - trim if too long  
  const maxResumeLength = 5000;
  const processedResumeText = 
    resumeText.length > maxResumeLength
      ? resumeText.substring(0, maxResumeLength) + "... (texto truncado devido ao tamanho)"
      : resumeText;
  
  let prompt = `
Analise a compatibilidade entre o perfil do candidato e a vaga de emprego a seguir.

## VAGA
Título: ${jobTitle}

Descrição:
${processedJobDescription}

## PERFIL DO CANDIDATO
### Currículo
${processedResumeText}
`;

  // Add cover letter if available (trimmed if too long)
  if (coverLetterText && coverLetterText.trim() !== "") {
    const maxCoverLetterLength = 2000;
    const processedCoverLetter = 
      coverLetterText.length > maxCoverLetterLength
        ? coverLetterText.substring(0, maxCoverLetterLength) + "... (texto truncado devido ao tamanho)"
        : coverLetterText;
        
    prompt += `
### Carta de Apresentação
${processedCoverLetter}
`;
  }

  // Add reference if available (trimmed if too long)
  if (referenceText && referenceText.trim() !== "") {
    const maxReferenceLength = 1500;
    const processedReferenceText = 
      referenceText.length > maxReferenceLength
        ? referenceText.substring(0, maxReferenceLength) + "... (texto truncado devido ao tamanho)"
        : referenceText;
        
    prompt += `
### Referências
${processedReferenceText}
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

IMPORTANTE: Sua resposta DEVE estar APENAS em formato JSON, sem formatação markdown, com o seguinte padrão:

{
  "compatibilityScore": "Texto com classificação qualitativa e porcentagem",
  "keySkills": ["habilidade 1", "habilidade 2", "habilidade 3"],
  "relevantExperiences": ["experiência 1", "experiência 2", "experiência 3"],
  "identifiedGaps": ["lacuna 1", "lacuna 2", "lacuna 3"]
}

Não inclua markdown, código, ou comentários. Forneça APENAS o objeto JSON.
`;

  // Log the prompt length
  console.log("Analysis prompt created, length:", prompt.length);
  
  return prompt;
}

// Parse the response from the OpenAI API
export function parseAnalysisResponse(content: string): AnalysisResult {
  try {
    console.log("Parsing OpenAI response");
    
    // Strip any markdown formatting that might be present
    let cleanContent = content.replace(/```json|```/g, '').trim();
    
    // Try to extract a JSON object
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.error("No valid JSON found in OpenAI response");
      throw new Error("Formato de resposta inválido - JSON não encontrado");
    }
    
    // Extract and parse the JSON
    const jsonText = jsonMatch[0];
    
    try {
      const result = JSON.parse(jsonText);
      
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
    } catch (jsonError) {
      console.error("Error parsing JSON:", jsonError);
      console.error("Raw JSON string:", jsonText);
      throw new Error(`Erro ao analisar JSON: ${jsonError.message}`);
    }
  } catch (error) {
    console.error("Error parsing OpenAI response:", error);
    console.error("Raw response content:", content.substring(0, 300) + "...");
    throw new Error(`Erro ao processar resposta da API: ${error.message}`);
  }
}
