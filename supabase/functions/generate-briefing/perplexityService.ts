
import { BriefingResponse } from "./types.ts";
import { callPerplexityAPI } from "./apiService.ts";
import { cleanText } from "./utils/textUtils.ts";

// Call Perplexity API to get the analysis
export const getPerplexityAnalysis = async (prompt: string, perplexityApiKey: string): Promise<string> => {
  return await callPerplexityAPI(prompt, perplexityApiKey);
};

// Process the raw Perplexity API response into our expected format
export const processPerplexityResponse = (content: string, companyName: string): BriefingResponse => {
  try {
    // Split the response into paragraphs
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    
    // Extract the first paragraph as overview
    const overview = paragraphs.length > 0 ? cleanText(paragraphs[0]) : `Análise da empresa ${companyName}`;
    
    // Extract potential highlights (bullet points or numbered items)
    const highlightRegex = /\n([-•*]|\d+\.)\s+([^\n]+)/g;
    const matches = [...content.matchAll(highlightRegex)];
    const highlights = matches.map(match => cleanText(match[2]));
    
    // Default highlights if none found
    const defaultHighlights = [
      `Informações sobre ${companyName}`,
      "Consulte o site oficial da empresa para mais detalhes"
    ];
    
    // Last paragraph as summary
    const summary = paragraphs.length > 1 ? cleanText(paragraphs[paragraphs.length - 1]) : "Veja a análise completa acima.";
    
    // Simple extraction of potential URLs as sources
    const sourceRegex = /(https?:\/\/[^\s)]+)/g;
    const sourceMatches = [...content.matchAll(sourceRegex)];
    const sources = Array.from(new Set(sourceMatches.map(match => match[1]))).map(url => {
      return {
        title: getDomainName(url),
        url: url
      };
    });
    
    // Try to find news by looking for date patterns
    const newsRegex = /(\d{1,2}\/\d{1,2}\/\d{4})\s*[-–—]\s*([^\n-–—]+)(?:\s*[-–—]\s*([^\n]+))?/g;
    const newsMatches = [...content.matchAll(newsRegex)];
    const recentNews = newsMatches.map(match => {
      const date = match[1] || '';
      const title = cleanText(match[2]) || '';
      const source = match[3] || '';
      
      // Extract URL from source if available
      const urlMatch = source.match(/(https?:\/\/[^\s)]+)/);
      const url = urlMatch ? urlMatch[1] : '';
      
      return {
        title,
        date,
        url
      };
    });
    
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
      overview: content.substring(0, 400) + (content.length > 400 ? "..." : ""),
      highlights: ["Veja a análise completa acima"],
      summary: content.substring(content.length - 400) + (content.length > 400 ? "..." : ""),
      sources: [
        { 
          title: `Pesquisar ${companyName}`, 
          url: `https://www.google.com/search?q=${encodeURIComponent(companyName)}`
        }
      ],
      recentNews: []
    };
  }
};

function getDomainName(url: string): string {
  try {
    return url.split("//")[1]?.split("/")[0] || url;
  } catch {
    return url;
  }
}
