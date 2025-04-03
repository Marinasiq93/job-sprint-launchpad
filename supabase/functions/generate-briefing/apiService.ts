
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
            Forneça uma análise detalhada e ESTRUTURADA baseada em informações disponíveis online.
            
            DIRETRIZES IMPORTANTES:
            - Concentre sua análise no site institucional da empresa, citando seções específicas
            - Use linguagem formal e profissional
            - Organize o conteúdo claramente com seções bem definidas
            - Inclua citações diretas quando disponíveis (entre aspas)
            - Seja específico e factual, evitando generalizações
            - Inclua URLs específicas de suas fontes sempre que possível
            - EVITE REPETIÇÕES DE INFORMAÇÕES EM DIFERENTES SEÇÕES
            - Para notícias, use o formato: [DATA DD/MM/AAAA] - [TÍTULO] - [FONTE com URL]
            - Formate as notícias recentes (máximo 3 notícias) da seguinte forma:
            
            NOTÍCIAS RECENTES:
            1. [DATA] - [TÍTULO] - [FONTE: URL]
            2. [DATA] - [TÍTULO] - [FONTE: URL]
            3. [DATA] - [TÍTULO] - [FONTE: URL]`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1500
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
