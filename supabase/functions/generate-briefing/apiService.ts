
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
    
    // System message to guide the response format
    const systemMessage = `Você é um assistente especializado em análise de empresas e mercados.
    
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
`;

    // Use the Perplexity API to generate a response
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
        temperature: 0.3,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
        return_images: false,
        return_related_questions: false,
        search_domain_filter: ["perplexity.ai"],
        search_recency_filter: "month",
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
  
  Concentre-se em fornecer insights sobre a cultura da empresa, seus valores e propósito, e como eles se alinham com a vaga.`;
  
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
