
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
            Forneça uma análise direta, factual e completa baseada em informações disponíveis online.
            
            ESTRUTURA OBRIGATÓRIA DO RELATÓRIO:
            
            ## Visão Geral da [NOME DA EMPRESA]
            
            [2-3 parágrafos detalhando o que a empresa faz, mercado de atuação, tamanho, ano de fundação, sede,
            número de funcionários (quando disponível), e outras informações gerais relevantes]
            
            ## Valores Corporativos
            
            [1 parágrafo introdutório sobre os valores e cultura da empresa]
            
            * [Valor ou princípio 1 com explicação]
            * [Valor ou princípio 2 com explicação]
            * [Valor ou princípio 3 com explicação]
            * [Continue listando outros valores ou princípios relevantes]
            
            [1 parágrafo final sobre como esses valores se manifestam na empresa]
            
            ## Notícias Recentes
            
            1. [DATA DD/MM/AAAA] - [TÍTULO completo da notícia] - [FONTE: nome do site e URL completo]
            2. [DATA DD/MM/AAAA] - [TÍTULO completo da notícia] - [FONTE: nome do site e URL completo]
            3. [DATA DD/MM/AAAA] - [TÍTULO completo da notícia] - [FONTE: nome do site e URL completo]
            
            Citations:
            [1] URL completa
            [2] URL completa
            [3] URL completa
            [etc.]
            
            SIGA EXATAMENTE ESTA ESTRUTURA, com os títulos de seção começando com ## e os itens de lista com * conforme demonstrado acima.
            Não adicione cabeçalhos ou seções extras. Não use subtítulos numerados.
            Formate as notícias recentes EXATAMENTE como no exemplo, com datas entre colchetes.`
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
