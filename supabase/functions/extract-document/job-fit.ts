
import { callEdenAIWorkflow, processWorkflowResponse } from "./workflow.ts";
import { corsHeaders } from "./utils.ts";

// Updated workflow ID - using a fallback approach instead of a fixed ID that might no longer exist
const JOB_FIT_WORKFLOW_IDS = [
  "297546a6-33e9-460e-83bb-a6eeeabc3144", // Original ID that returned 404
  // Add any alternative workflow IDs your account might have
];

/**
 * Handle job fit analysis request using Eden AI workflow
 */
export async function handleJobFitRequest(req: Request): Promise<Response> {
  try {
    console.log("Starting job fit analysis process");
    // Parse the request body
    const data = await req.json();
    const { resumeBase64, resumeType, resumeName, jobDescription } = data;
    
    if (!resumeBase64 || !jobDescription) {
      console.warn("Missing input data - generating fallback response");
      
      // Generate a fallback response when required data is missing
      return new Response(
        JSON.stringify({ 
          compatibilityScore: "Análise incompleta",
          keySkills: ["Não foi possível analisar as habilidades"],
          relevantExperiences: ["Sem dados suficientes para análise de experiência"],
          identifiedGaps: ["Adicione mais detalhes ao seu currículo para uma análise completa"],
          fallbackAnalysis: true,
          error: "Dados de entrada insuficientes para análise completa"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }}
      );
    }

    console.log(`Processing job fit analysis with available workflows`);
    console.log(`Resume name: ${resumeName}, type: ${resumeType}, job description length: ${jobDescription.length}`);
    console.log(`Resume base64 data length: ${resumeBase64?.length || 0}`);
    
    let lastError = null;
    
    // If no Eden AI workflow is accessible, use our fallback text-based analysis approach
    if (!data.EDEN_AI_API_KEY && JOB_FIT_WORKFLOW_IDS.length === 0) {
      console.log("No Eden AI workflows available, using fallback analysis");
      return generateFallbackAnalysis(resumeBase64, jobDescription);
    }
    
    try {
      // Try each workflow ID until one works
      for (const workflowId of JOB_FIT_WORKFLOW_IDS) {
        try {
          console.log(`Attempting to use Eden AI workflow ID: ${workflowId}`);
          
          // Prepare data for Eden AI workflow based on the workflow schema
          const workflowPayload = {
            workflow_id: workflowId,
            async: false,
            inputs: {
              Jobdescription: jobDescription,
              Resume: resumeBase64
            }
          };
          
          console.log("Calling Eden AI workflow with payload:", JSON.stringify({
            workflow_id: workflowPayload.workflow_id,
            async: workflowPayload.async,
            input_sizes: {
              jobDescription_length: jobDescription?.length || 0,
              resumeBase64_length: resumeBase64?.length || 0
            }
          }));
          
          // Call the Eden AI workflow with our prepared payload
          const result = await callEdenAIWorkflow(
            workflowPayload,
            workflowId
          );
          
          console.log("Eden AI workflow response received", JSON.stringify({
            has_result: !!result,
            result_type: result ? typeof result : 'undefined',
            has_job_fit_feedback: result?.job_fit_feedback ? true : false
          }));
          
          // Check if we got a valid response from Eden AI
          if (!result || !result.job_fit_feedback) {
            console.error("Invalid response from Eden AI workflow", JSON.stringify(result));
            continue; // Try next workflow ID
          }
          
          // Process the response from Eden AI
          try {
            // Get the raw text from the workflow response
            const jobFitFeedbackText = result.job_fit_feedback;
            console.log("Job fit feedback text sample:", jobFitFeedbackText.substring(0, 100) + "...");
            
            // Try to extract structured information from the text
            const analysisResult = extractStructuredAnalysis(jobFitFeedbackText);
            
            // Add the raw analysis text to help with debugging
            analysisResult.rawAnalysis = jobFitFeedbackText;
            
            // Add input summary for debugging if needed
            if (data.debug) {
              analysisResult.inputSummary = {
                jobTitleLength: data.jobTitle?.length || 0,
                jobDescriptionLength: jobDescription?.length || 0,
                resumeTextLength: resumeBase64?.length || 0,
                coverLetterTextLength: data.coverLetterText?.length || 0,
                referenceTextLength: data.referenceText?.length || 0
              };
            }
            
            console.log("Analysis result generated successfully");
            return new Response(
              JSON.stringify(analysisResult),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          } catch (parsingError) {
            console.error("Error parsing Eden AI workflow response:", parsingError);
            lastError = parsingError;
            
            // Return the raw text from Eden AI if we can't parse it properly
            return new Response(
              JSON.stringify({
                compatibilityScore: "Análise Realizada",
                keySkills: ["Veja a análise completa abaixo"],
                relevantExperiences: ["Análise detalhada disponível"],
                identifiedGaps: ["Consulte a análise completa abaixo"],
                rawAnalysis: result.job_fit_feedback || "Sem dados de análise disponíveis",
                fallbackAnalysis: false
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } catch (workflowError) {
          console.error(`Error with workflow ${workflowId}:`, workflowError);
          lastError = workflowError;
          // Continue to try the next workflow ID
        }
      }
      
      // If we tried all workflow IDs and none worked, use the fallback analysis
      console.warn("All Eden AI workflows failed, using fallback analysis");
      return generateFallbackAnalysis(resumeBase64, jobDescription);
      
    } catch (error) {
      console.error("Error in job fit analysis workflow:", error);
      lastError = error;
      
      return generateFallbackAnalysis(resumeBase64, jobDescription);
    }
  } catch (error) {
    console.error("Unexpected error in job fit handler:", error);
    
    // Return a user-friendly error response
    return new Response(
      JSON.stringify({ 
        compatibilityScore: "Erro interno",
        keySkills: ["Falha no processamento"],
        relevantExperiences: ["Erro técnico na análise"],
        identifiedGaps: ["Tente novamente mais tarde"],
        fallbackAnalysis: true,
        error: "Erro inesperado no servidor",
        rawAnalysis: "Um erro inesperado ocorreu durante o processamento. Nossa equipe técnica foi notificada."
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}

/**
 * Generate a fallback analysis when Eden AI workflows are not available
 */
async function generateFallbackAnalysis(resumeBase64: string, jobDescription: string): Promise<Response> {
  console.log("Generating fallback analysis using basic text comparison");
  
  try {
    // Decode the resume from base64
    const resumeText = decodeBase64Text(resumeBase64);
    
    // Simple keyword matching analysis
    const keywords = extractKeywords(jobDescription);
    const matchedKeywords = findMatchingKeywords(resumeText, keywords);
    const missingKeywords = keywords.filter(kw => !matchedKeywords.includes(kw));
    
    // Calculate a very simple score based on keyword matches
    const matchRate = keywords.length > 0 ? (matchedKeywords.length / keywords.length) : 0;
    let compatibilityScore = "Não foi possível calcular";
    
    if (matchRate >= 0.7) {
      compatibilityScore = "Alta Compatibilidade";
    } else if (matchRate >= 0.4) {
      compatibilityScore = "Compatibilidade Média";
    } else {
      compatibilityScore = "Compatibilidade Baixa";
    }
    
    // Create the analysis result
    const result = {
      compatibilityScore,
      keySkills: matchedKeywords.length > 0 ? matchedKeywords.slice(0, 5) : ["Análise baseada em texto simplificada"],
      relevantExperiences: [
        "Análise simplificada devido à indisponibilidade do serviço principal",
        "Recomendamos adicionar mais detalhes sobre suas experiências relacionadas à vaga"
      ],
      identifiedGaps: missingKeywords.length > 0 ? 
        missingKeywords.slice(0, 5).map(kw => `Considere adicionar informações sobre: ${kw}`) : 
        ["Não foi possível realizar análise detalhada de lacunas"],
      fallbackAnalysis: true,
      error: "Análise simplificada devido a um problema técnico com o serviço principal",
      rawAnalysis: `Análise simplificada gerada devido à indisponibilidade temporária do serviço principal.
      
Foram encontradas ${matchedKeywords.length} palavras-chave relevantes no seu currículo de um total de ${keywords.length} palavras-chave extraídas da descrição da vaga.

Compatibilidade estimada: ${compatibilityScore}

Recomendações: Continue melhorando seu currículo adicionando mais detalhes sobre suas experiências e habilidades, especialmente relacionadas a ${missingKeywords.slice(0, 3).join(', ')} e outras áreas mencionadas na descrição da vaga.`
    };
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating fallback analysis:", error);
    
    return new Response(
      JSON.stringify({ 
        compatibilityScore: "Análise indisponível",
        keySkills: ["Não foi possível analisar habilidades"],
        relevantExperiences: ["Serviço temporariamente indisponível"],
        identifiedGaps: ["Tente novamente mais tarde"],
        fallbackAnalysis: true,
        error: error instanceof Error ? error.message : "Erro na análise simplificada",
        rawAnalysis: "O serviço de análise está temporariamente indisponível. Por favor, tente novamente mais tarde."
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

/**
 * Decode base64 text (for fallback analysis)
 */
function decodeBase64Text(base64Text: string): string {
  try {
    return decodeURIComponent(escape(atob(base64Text)));
  } catch (e) {
    console.error("Error decoding base64 text:", e);
    return "";
  }
}

/**
 * Extract keywords from job description (for fallback analysis)
 */
function extractKeywords(text: string): string[] {
  if (!text) return [];
  
  // Common words to exclude (stopwords in Portuguese)
  const stopwords = new Set(["de", "a", "o", "que", "e", "do", "da", "em", "um", "para", "é", "com", "não", "uma", "os", "no", "se", "na", "por", "mais", "as", "dos", "como", "mas", "foi", "ao", "ele", "das", "tem", "à", "seu", "sua", "ou", "ser", "quando", "muito", "há", "nos", "já", "está", "eu", "também", "só", "pelo", "pela", "até", "isso", "ela", "entre", "era", "depois", "sem", "mesmo", "aos", "ter", "seus", "quem", "nas", "me", "esse", "eles", "estão", "você", "tinha", "foram", "essa", "num", "nem", "suas", "meu", "às", "minha", "têm", "numa", "pelos", "elas", "havia", "seja", "qual", "será", "nós", "tenho", "lhe", "deles", "essas", "esses", "pelas", "este", "fosse", "dele", "tu", "te", "vocês", "vos", "lhes", "meus", "minhas", "teu", "tua", "teus", "tuas", "nosso", "nossa", "nossos", "nossas", "dela", "delas", "esta", "estes", "estas", "aquele", "aquela", "aqueles", "aquelas", "isto", "aquilo", "estou", "está", "estamos", "estão", "estive", "esteve", "estivemos", "estiveram", "estava", "estávamos", "estavam", "estivera", "estivéramos", "esteja", "estejamos", "estejam", "estivesse", "estivéssemos", "estivessem", "estiver", "estivermos", "estiverem"]);
  
  // Extract words, convert to lowercase, remove punctuation, filter out short words and stopwords
  return text.toLowerCase()
    .replace(/[^\wáàâãéèêíïóôõöúçñ ]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopwords.has(word))
    .filter((word, index, self) => self.indexOf(word) === index) // Remove duplicates
    .slice(0, 50); // Limit to most important keywords
}

/**
 * Find matching keywords in resume text (for fallback analysis)
 */
function findMatchingKeywords(resumeText: string, keywords: string[]): string[] {
  if (!resumeText || !keywords.length) return [];
  
  const resumeLower = resumeText.toLowerCase();
  return keywords.filter(keyword => resumeLower.includes(keyword));
}

/**
 * Extract structured analysis from the raw text returned by the AI
 */
function extractStructuredAnalysis(text: string): any {
  // Default values
  const result = {
    compatibilityScore: "Análise Realizada",
    keySkills: [] as string[],
    relevantExperiences: [] as string[],
    identifiedGaps: [] as string[]
  };
  
  try {
    // Look for strengths section
    const strengthsMatch = text.match(/Strengths|Pontos Fortes|Forças|:[\s\S]*?(?=Gaps|Lacunas|Missing|$)/i);
    if (strengthsMatch && strengthsMatch[0]) {
      const strengthsText = strengthsMatch[0].replace(/Strengths|Pontos Fortes|Forças|:|\*\*/gi, '').trim();
      // Extract bullet points
      const strengthBullets = strengthsText.split(/\n-|\n•|\n\*/).filter(Boolean).map(s => s.trim());
      if (strengthBullets.length > 0) {
        result.keySkills = strengthBullets.slice(0, 5); // Limit to first 5 skills
        result.relevantExperiences = strengthBullets.slice(0, 5); // Use some strengths for experiences too
      }
    }
    
    // Look for gaps section
    const gapsMatch = text.match(/Gaps|Lacunas|Missing[\s\S]*?(?=$)/i);
    if (gapsMatch && gapsMatch[0]) {
      const gapsText = gapsMatch[0].replace(/Gaps|Lacunas|Missing|:|\*\*/gi, '').trim();
      // Extract bullet points
      const gapBullets = gapsText.split(/\n-|\n•|\n\*/).filter(Boolean).map(s => s.trim());
      if (gapBullets.length > 0) {
        result.identifiedGaps = gapBullets.slice(0, 5); // Limit to first 5 gaps
      }
    }
    
    return result;
  } catch (error) {
    console.error("Error extracting structured analysis:", error);
    // Return partial analysis
    return result;
  }
}
