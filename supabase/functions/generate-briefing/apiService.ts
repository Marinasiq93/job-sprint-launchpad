
// Import required modules
import { BriefingPrompt } from "./types.ts";

// Headers for API requests
const headers = {
  "Content-Type": "application/json",
};

// Call the Perplexity API
export const callPerplexityAPI = async (prompt: string, apiKey: string): Promise<string> => {
  try {
    console.log("Calling Perplexity API with key:", apiKey ? "API key is set" : "No API key provided");
    
    if (!apiKey || apiKey.trim() === '') {
      throw new Error("Perplexity API key is missing or invalid");
    }
    
    // Enhanced system message to guide the response format and improve web exploration
    const systemMessage = `Você é um assistente especializado em análise de empresas e mercados.

Como parte dessa análise:
1. Priorize sempre fontes oficiais da empresa (site corporativo, relatórios anuais, páginas institucionais)
2. Explore profundamente o website da empresa, incluindo seções específicas como "Sobre nós", "Valores", "Cultura", "Código de Conduta"
3. Verifique subdomínios diferentes (.com, .com.br, /en/, /pt-br/) se um link específico não estiver acessível
4. Sempre busque múltiplas fontes para validar as informações
5. Inclua apenas URLs que você verificou serem válidas e acessíveis

Forneça uma análise clara e estruturada seguindo estas diretrizes:
1. Use markdown para formatar sua resposta:
   - Use ## para títulos principais (use no máximo 3 títulos principais)
   - Use ### para subtítulos (use com moderação)
   - Use • para listas com bullets (não use - para bullets de lista)
   - Use formatação **negrito** para conceitos importantes

2. Mantenha sua resposta direta e concisa, sem repetições
3. Organize as informações de forma lógica e fluida
4. Inclua dados, métricas e fatos objetivos quando disponíveis
5. Liste suas fontes no final usando formato numerado [1] com URLs completas
6. Inclua os nomes dos sites nas fontes antes das URLs quando possível
7. Seja imparcial e objetivo, baseando-se em fatos verificáveis
8. Formate listas sempre com • para bullets (não use - para bullets)
9. Quando falar sobre a liderança, não repita informações sobre fundadores na seção da equipe executiva
10. Na seção de Fundadores, sempre mencione seus cargos atuais (se ainda estiverem na empresa)
11. Não repita URLs ou instruções de visita a sites na sua resposta
12. FUNDAMENTAL: Insista em acessar o código de conduta/valores da empresa se disponível
`;

    // Use the Perplexity API to generate a response with improved settings
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        ...headers,
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: systemMessage
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.1,           // Lowered from 0.3 for more precise responses
        top_p: 0.9,                 // Slightly adjusted for better focus
        frequency_penalty: 0.1,     // Keep only one penalty parameter
        // presence_penalty: 0.1,   // REMOVED this parameter as it conflicts with frequency_penalty
        return_images: false,
        return_related_questions: false,
        search_domain_filter: [],   // Removed domain filter for better search
        search_recency_filter: "month",
        search_depth: "deep"        // Added to increase search depth
      }),
    });

    // Check if the response is successful
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Perplexity API error:", errorData);
      throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    // Parse and return the response
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    if (!content || content.trim() === '') {
      console.error("Received empty content from Perplexity API");
      throw new Error("Empty response from Perplexity API");
    }
    
    console.log("Perplexity API response received");
    console.log("Raw API response excerpt:", content.substring(0, 100) + "...\n");
    
    // Return the generated content
    return content;
  } catch (error) {
    console.error("Error calling Perplexity API:", error);
    throw error;
  }
};

// Generate a prompt based on the company and request type
export const generatePrompt = (request: BriefingPrompt): string => {
  const { companyName, companyWebsite, jobDescription, currentQuestionIndex } = request;
  
  // Define the base prompt
  let prompt = `Analise detalhadamente a empresa ${companyName}, com base nas seguintes informações:
  - Website: ${companyWebsite}
  - Descrição da vaga: ${jobDescription}
  
  Concentre-se em fornecer insights sobre a cultura da empresa, seus valores e propósito, e como eles se alinham com a vaga.
  
  IMPORTANTE: procure os valores e cultura da empresa no site oficial (${companyWebsite}). Explore seções como "Sobre Nós", "Valores", "Cultura", "Código de Conduta", etc. Verifique também subdomínios como .com/.com.br ou caminhos como /en/, /pt-br/ caso não encontre as informações inicialmente.`;
  
  // Add specific questions based on the current question index
  if (currentQuestionIndex === 0) {
    prompt += `\n\nResponda à pergunta: "Você se sente alinhado com a cultura e os valores da empresa? Por quê?"`;
  } else if (currentQuestionIndex === 1) {
    prompt += `\n\nResponda à pergunta: "Você se identifica com a missão da empresa? O que mais ressoou com você?"`;
  } else if (currentQuestionIndex === 2) {
    prompt += `\n\nResponda à pergunta: "Você tem alguma conexão pessoal ou profissional com o produto, mercado ou público dessa empresa? Já trabalhou com algo parecido ou com esse perfil de cliente?"`;
  } else if (currentQuestionIndex === 3) {
    prompt += `\n\nResponda à pergunta: "Você vê o time de liderança como alguém em quem confiaria e aprenderia? Por quê?"`;
  } else if (currentQuestionIndex === 4) {
    prompt += `\n\nResponda à pergunta: "Algum pensamento ou conexão sobre a história da fundação da empresa? O que mais chamou sua atenção?"`;
  }
  
  prompt += `\n\nDivida sua resposta em seções claras com títulos e subtítulos. Inclua um breve resumo no início da sua análise. Liste suas fontes claramente no final.`;
  
  return prompt;
};
