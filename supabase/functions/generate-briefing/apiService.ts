
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
            Forneça uma análise detalhada, estruturada e completa baseada em informações disponíveis online.
            
            DIRETRIZES DE FORMATAÇÃO:
            - Use títulos e subtítulos em Markdown (## para seções principais, sem numeração)
            - Inclua informações factuais e específicas sobre a empresa
            - Formate as notícias recentes exatamente como no exemplo abaixo
            - Para cada fonte utilizada, inclua uma referência no formato [N] no texto
            - Apresente uma lista completa de fontes no final (Citations)
            
            ESTRUTURA OBRIGATÓRIA:
            
            ## Visão Geral da [NOME DA EMPRESA]
            
            [Parágrafo introdutório com informações gerais sobre a empresa]
            
            [Segundo parágrafo com detalhes sobre mercado, tamanho, etc.]
            
            ## [TÍTULO DA SEGUNDA SEÇÃO PRINCIPAL (Valores Corporativos/Missão e Visão/etc.)]
            
            [Texto descritivo sobre o tópico principal da seção]
            
            * [Primeiro ponto importante ou valor destacado]
            * [Segundo ponto importante ou valor destacado]
            * [Continue listando outros pontos com asterisco]
            
            [Parágrafo de conclusão ou exemplos da seção]
            
            ## Notícias Recentes
            
            1. [DATA DD/MM/AAAA] - [TÍTULO completo da notícia] - [FONTE: nome do site e URL completo]
            2. [DATA DD/MM/AAAA] - [TÍTULO completo da notícia] - [FONTE: nome do site e URL completo]
            3. [DATA DD/MM/AAAA] - [TÍTULO completo da notícia] - [FONTE: nome do site e URL completo]
            
            Citations:
            [1] URL completa
            [2] URL completa
            [etc.]
            
            Siga RIGOROSAMENTE esta estrutura e formatação. Seja específico e factual em toda a análise.`
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
