
// OpenAI service for job fit analysis

interface JobFitAnalysisInput {
  jobTitle: string;
  jobDescription: string;
  resumeText: string;
  coverLetterText?: string;
  referenceText?: string;
}

interface FitAnalysisResult {
  compatibilityScore: string;
  keySkills: string[];
  relevantExperiences: string[];
  identifiedGaps: string[];
}

export async function generateJobFitAnalysis(input: JobFitAnalysisInput): Promise<FitAnalysisResult> {
  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set in environment variables');
      throw new Error('Chave da API OpenAI não configurada. Contate o administrador.');
    }

    const { jobTitle, jobDescription, resumeText, coverLetterText, referenceText } = input;
    
    // Clean and validate inputs
    const cleanedResumeText = cleanDocumentText(resumeText);
    
    if (!cleanedResumeText || cleanedResumeText.trim().length < 10) {
      throw new Error('Texto do currículo não encontrado ou muito curto para análise');
    }
    
    // Prepare documents for analysis, combining all available text
    let userDocuments = `CURRÍCULO:\n${cleanedResumeText}\n\n`;
    
    if (coverLetterText && coverLetterText.trim() !== "") {
      userDocuments += `CARTA DE APRESENTAÇÃO:\n${cleanDocumentText(coverLetterText)}\n\n`;
    }
    
    if (referenceText && referenceText.trim() !== "") {
      userDocuments += `MATERIAIS DE REFERÊNCIA:\n${cleanDocumentText(referenceText)}`;
    }

    // Log document sizes for debugging
    console.log("Document sizes for analysis:", {
      resumeTextLength: cleanedResumeText.length,
      coverLetterTextLength: coverLetterText ? cleanDocumentText(coverLetterText).length : 0,
      referenceTextLength: referenceText ? cleanDocumentText(referenceText).length : 0,
      totalDocumentsLength: userDocuments.length
    });

    // Create system message
    const systemMessage = `Você é um especialista em recrutamento e seleção com profundo conhecimento em análise de compatibilidade entre candidatos e vagas.
    
Analise cuidadosamente os documentos do candidato (currículo, carta de apresentação e outros materiais) em relação à descrição da vaga. 
Sua tarefa é fornecer uma análise estruturada de compatibilidade retornando exatamente os seguintes elementos em formato JSON:

1. compatibilityScore: Uma avaliação geral do nível de compatibilidade do candidato com a vaga em formato de texto descritivo seguido de uma porcentagem entre parênteses. Ex: "Elevado (85%)" ou "Moderado (65%)"

2. keySkills: Uma array com exatamente 5 principais habilidades identificadas no perfil do candidato que são relevantes para a vaga

3. relevantExperiences: Uma array com exatamente 5 experiências ou projetos do candidato que são mais relevantes para a vaga (explicando brevemente por quê)

4. identifiedGaps: Uma array com exatamente 5 lacunas ou requisitos importantes que foram identificados na vaga mas que não aparecem claramente no perfil do candidato ou precisam ser melhor desenvolvidos

Seja preciso, detalhado e honesto em sua avaliação. Se o candidato não apresenta boa compatibilidade, sua análise deve refletir isso claramente. 
Responda APENAS com o objeto JSON estruturado conforme solicitado, sem textos adicionais.

Nota: Alguns documentos podem conter apenas nomes de arquivos se o texto não pôde ser extraído. Nesse caso, use quaisquer informações disponíveis e indique lacunas que precisam ser melhor exploradas.`;

    // Create user message
    const userMessage = `VAGA: ${jobTitle}
    
DESCRIÇÃO DA VAGA:
${jobDescription}

DOCUMENTOS DO CANDIDATO:
${userDocuments}`;

    console.log("Calling OpenAI API with document lengths:", {
      resumeLength: cleanedResumeText.length,
      coverLetterLength: coverLetterText?.length || 0,
      referenceTextLength: referenceText?.length || 0
    });
    
    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage }
        ],
        temperature: 0.2,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`Erro na API do OpenAI: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log("OpenAI response received, parsing JSON...");
    
    // Parse the JSON response
    try {
      const fitAnalysisResult = JSON.parse(content);
      
      // Validate that all required fields are present
      if (!fitAnalysisResult.compatibilityScore || 
          !Array.isArray(fitAnalysisResult.keySkills) || 
          !Array.isArray(fitAnalysisResult.relevantExperiences) ||
          !Array.isArray(fitAnalysisResult.identifiedGaps)) {
        console.error("Invalid response format:", fitAnalysisResult);
        throw new Error("Formato de resposta inválido da API OpenAI");
      }
      
      // Ensure all arrays have exactly 5 items
      const ensureExactlyFive = <T>(arr: T[], label: string): T[] => {
        if (arr.length < 5) {
          console.warn(`${label} has less than 5 items, padding with placeholders`);
          return [...arr, ...Array(5 - arr.length).fill(`${label.slice(0, -1)} não identificado`)];
        }
        if (arr.length > 5) {
          console.warn(`${label} has more than 5 items, truncating`);
          return arr.slice(0, 5);
        }
        return arr;
      };
      
      return {
        compatibilityScore: fitAnalysisResult.compatibilityScore,
        keySkills: ensureExactlyFive(fitAnalysisResult.keySkills, "Habilidades"),
        relevantExperiences: ensureExactlyFive(fitAnalysisResult.relevantExperiences, "Experiências"),
        identifiedGaps: ensureExactlyFive(fitAnalysisResult.identifiedGaps, "Lacunas")
      };
      
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      console.error("Raw content:", content);
      throw new Error("Falha ao analisar o resultado da análise");
    }
    
  } catch (error) {
    console.error("Error generating job fit analysis:", error);
    throw error;
  }
}

// Helper function to clean document text
function cleanDocumentText(text: string | null | undefined): string {
  if (!text) return '';
  
  // Handle auto-generated text from file uploads
  if (text.startsWith('Conteúdo do arquivo:') && text.includes('(Texto extraído automaticamente)')) {
    return text;
  }
  
  // Handle text that's just a filename reference (from our extraction fallbacks)
  if (text.startsWith('Arquivo:') || text.startsWith('Currículo:') || text.startsWith('Carta de apresentação:')) {
    return text;
  }
  
  // For PDF file references with some metadata
  if (text.startsWith('Arquivo PDF:')) {
    return text;
  }
  
  // Remove excessive whitespace, normalize line breaks
  return text.replace(/\s+/g, ' ').trim();
}
