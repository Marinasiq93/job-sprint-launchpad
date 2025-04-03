
import { BriefingResponse } from "./types.ts";

// Call Perplexity API to get the analysis
export const getPerplexityAnalysis = async (prompt: string, perplexityApiKey: string): Promise<string> => {
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
            Forneça uma análise detalhada baseada em informações disponíveis online.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
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

// Process the raw Perplexity API response into our expected format
export const processPerplexityResponse = (content: string, companyName: string): BriefingResponse => {
  try {
    // Parse content paragraph by paragraph and extract key information
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    
    // If we don't have enough content, fall back to a default structure
    if (paragraphs.length < 2) {
      return {
        overview: content || `Análise da empresa ${companyName}`,
        highlights: ["Informação obtida diretamente da API sem formatação específica"],
        summary: "Veja o conteúdo acima para a análise completa.",
        sources: []
      };
    }
    
    // Take first paragraph as overview
    const overview = paragraphs[0];
    
    // Identify potential highlight points (sentences or bullet points)
    let highlights: string[] = [];
    
    // Look for bullet points or numbered lists
    const bulletRegex = /[•\-*]\s+([^\n]+)/g;
    const numberedRegex = /\d+\.\s+([^\n]+)/g;
    let bulletMatch;
    let numberedMatch;
    
    while ((bulletMatch = bulletRegex.exec(content)) !== null) {
      highlights.push(bulletMatch[1]);
    }
    
    while ((numberedMatch = numberedRegex.exec(content)) !== null) {
      highlights.push(numberedMatch[1]);
    }
    
    // If no bullet points, extract some sentences from the middle of the content
    if (highlights.length === 0) {
      const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
      // Skip first few and last few sentences (likely intro and conclusion)
      if (sentences.length > 6) {
        highlights = sentences.slice(2, 7).map(s => s.trim());
      } else if (sentences.length > 0) {
        highlights = sentences.slice(0, Math.min(5, sentences.length)).map(s => s.trim());
      }
    }
    
    // Limit to 5 highlights
    highlights = highlights.slice(0, 5);
    
    // If still no highlights, create generic ones
    if (highlights.length === 0) {
      highlights = [
        `Informações sobre ${companyName} extraídas de fontes online`,
        "Consulte o site oficial da empresa para mais detalhes",
        "Procure reviews no Glassdoor para insights de funcionários",
        "Verifique o LinkedIn da empresa para atualizações recentes",
        "Pesquise notícias recentes para contexto atual da empresa"
      ];
    }
    
    // Take last paragraph or second half of content as summary
    const summary = paragraphs[paragraphs.length - 1];
    
    // Look for URLs in the content to use as sources
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = content.match(urlRegex) || [];
    
    const sources = urls.slice(0, 5).map(url => ({
      title: `Fonte: ${url.split("//")[1]?.split("/")[0] || url}`,
      url: url
    }));
    
    // If no URLs found, add generic sources
    if (sources.length === 0) {
      sources.push({
        title: `Site oficial de ${companyName}`,
        url: `https://www.google.com/search?q=${encodeURIComponent(companyName)}+site+oficial`
      });
      sources.push({
        title: `${companyName} no LinkedIn`,
        url: `https://www.linkedin.com/company/${encodeURIComponent(companyName.toLowerCase().replace(/\s+/g, '-'))}`
      });
    }
    
    return {
      overview,
      highlights,
      summary,
      sources
    };
  } catch (error) {
    console.error("Error processing Perplexity response:", error);
    // Return a basic structure with the raw content
    return {
      overview: content.slice(0, 200) + "...",
      highlights: ["Veja a análise completa acima"],
      summary: content.slice(-200),
      sources: [
        { 
          title: `Pesquisar ${companyName}`, 
          url: `https://www.google.com/search?q=${encodeURIComponent(companyName)}`
        }
      ]
    };
  }
};
