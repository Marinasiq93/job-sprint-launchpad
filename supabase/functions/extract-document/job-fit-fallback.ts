
import { corsHeaders } from "./utils.ts";

/**
 * Generate a fallback analysis when Eden AI workflows are not available
 */
export async function generateFallbackAnalysis(resumeBase64: string, jobDescription: string): Promise<Response> {
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
export function decodeBase64Text(base64Text: string): string {
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
export function extractKeywords(text: string): string[] {
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
export function findMatchingKeywords(resumeText: string, keywords: string[]): string[] {
  if (!resumeText || !keywords.length) return [];
  
  const resumeLower = resumeText.toLowerCase();
  return keywords.filter(keyword => resumeLower.includes(keyword));
}
