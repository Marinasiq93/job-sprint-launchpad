
import { BriefingResponse } from "./types.ts";
import { callPerplexityAPI } from "./apiService.ts";
import { extractHighlights, extractSources, extractRecentNews } from "./contentExtractors.ts";

// Call Perplexity API to get the analysis
export const getPerplexityAnalysis = async (prompt: string, perplexityApiKey: string): Promise<string> => {
  return await callPerplexityAPI(prompt, perplexityApiKey);
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
        sources: [],
        recentNews: []
      };
    }
    
    // Take first paragraph as overview
    const overview = paragraphs[0];
    
    // Identify potential highlight points
    const highlights = extractHighlights(content);
    
    // If still no highlights, create generic ones
    const defaultHighlights = [
      `Informações sobre ${companyName} extraídas de fontes online`,
      "Consulte o site oficial da empresa para mais detalhes",
      "Procure reviews no Glassdoor para insights de funcionários",
      "Verifique o LinkedIn da empresa para atualizações recentes",
      "Pesquise notícias recentes para contexto atual da empresa"
    ];
    
    // Take last paragraph or second half of content as summary
    const summary = paragraphs[paragraphs.length - 1];
    
    // Extract sources and news from the content
    const sources = extractSources(content, companyName);
    const recentNews = extractRecentNews(content, companyName);
    
    return {
      overview,
      highlights: highlights.length > 0 ? highlights : defaultHighlights,
      summary,
      sources,
      recentNews
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
      ],
      recentNews: [
        {
          title: `Veja notícias recentes sobre ${companyName}`,
          url: `https://www.google.com/search?q=${encodeURIComponent(companyName)}+notícias&tbm=nws`
        }
      ]
    };
  }
};
