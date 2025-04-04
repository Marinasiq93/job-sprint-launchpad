
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
            
            ORIENTAÇÕES DE FORMATAÇÃO:
            
            - Estruture sua resposta em seções usando formato markdown (## Título) para seções principais
            - Use apenas um nível de cabeçalho por seção (##)
            - Sempre comece sua análise com um parágrafo introdutório antes de qualquer título de seção
            - Deixe sempre uma linha em branco entre o título e o conteúdo
            - Use negrito (**texto**) apenas para destacar dados importantes como nomes, datas e números
            - Use marcadores para listas de itens relacionados no formato:
               - Item 1
               - Item 2
            - Evite usar texto completamente em maiúsculas para títulos ou subtítulos
            - Mantenha uma linha em branco antes de cada nova seção com título
            - Para listas numeradas, use o formato:
               1. Item primeiro
               2. Item segundo
            - Não crie seções com letras isoladas como "A P" ou "C I" 
            - Evite usar termos como "VALORES:" - use títulos markdown em vez disso
            
            ORIENTAÇÕES DE CONTEÚDO:
            
            - Utilize dados factuais e específicos sobre a empresa
            - Use linguagem simples, direta e profissional
            - Inclua URLs completas ao mencionar fontes em seu texto
            - Use informações do site oficial da empresa e fontes confiáveis
            - Não inclua uma seção de "Fontes" no final da sua resposta
            - Priorize informações atualizadas e relevantes para o candidato`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,  // Slightly lower temperature for more consistent responses
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
