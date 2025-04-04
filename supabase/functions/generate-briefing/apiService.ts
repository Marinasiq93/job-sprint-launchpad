
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
            
            ORIENTAÇÕES:
            
            - Utilize dados factuais e específicos sobre a empresa
            - Escreva em linguagem natural e fluida
            - Estruture sua resposta de forma organizada mas conversacional
            - Inclua URLs completas ao mencionar fontes
            - Use informações do site oficial da empresa e fontes confiáveis
            
            Ao final, liste as fontes utilizadas no formato:
            
            Sources:
            [1] URL completa
            [2] URL completa
            [etc.]`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
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
