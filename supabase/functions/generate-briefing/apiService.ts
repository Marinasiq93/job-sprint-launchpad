
// Core API service to handle API calls to Perplexity
export const callPerplexityAPI = async (prompt: string, perplexityApiKey: string): Promise<string> => {
  if (!perplexityApiKey) {
    throw new Error("PERPLEXITY_API_KEY is not set in the environment");
  }
  
  console.log("Calling Perplexity API with key:", perplexityApiKey ? "API key is set" : "No API key");
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente especializado em análise de empresas para candidatos a emprego.
            Forneça uma análise detalhada, estruturada e COMPLETA baseada em informações disponíveis online.
            
            DIRETRIZES IMPORTANTES:
            - Estruture claramente seu conteúdo usando cabeçalhos markdown (##) para cada seção principal
            - Concentre sua análise no site institucional da empresa, citando seções específicas
            - Use linguagem formal e profissional em português
            - Inclua citações diretas relevantes entre aspas
            - Seja específico e factual, evitando generalizações
            - Inclua URLs específicas de suas fontes
            - Para cada valor ou ponto importante, use marcadores com asterisco (*)
            - Formate as notícias recentes (exatamente 3 notícias) com numeração, data, título completo e fonte com URL
            - A análise deve ser estruturada e abrangente, seguindo o formato solicitado pelo usuário
            - Ao final, liste todas as fontes utilizadas com URLs completas
            
            FORMATO DA SEÇÃO DE NOTÍCIAS:
            ## Notícias Recentes
            
            1. [DATA DD/MM/AAAA] - [TÍTULO completo da notícia] - [FONTE: URL]
            2. [DATA DD/MM/AAAA] - [TÍTULO completo da notícia] - [FONTE: URL]
            3. [DATA DD/MM/AAAA] - [TÍTULO completo da notícia] - [FONTE: URL]
            
            Citations:
            [1] URL completa
            [2] URL completa
            etc.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2500,
        top_p: 0.95
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error("Perplexity API error:", errorData);
      throw new Error(`API responded with status ${response.status}: ${errorData}`);
    }
    
    const data = await response.json();
    console.log("Perplexity API response received");
    
    // Extract the content from the response
    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in Perplexity API response");
    }
    
    return content;
  } catch (error) {
    console.error("Error calling Perplexity API:", error);
    throw error;
  }
};
