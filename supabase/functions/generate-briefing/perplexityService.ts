
import { BriefingResponse } from "./types.ts";
import { callPerplexityAPI } from "./apiService.ts";
import { extractSources } from "./extractors/sourceExtractor.ts";

// Call Perplexity API to get the analysis
export const getPerplexityAnalysis = async (prompt: string, perplexityApiKey: string): Promise<string> => {
  return await callPerplexityAPI(prompt, perplexityApiKey);
};

// Process the raw Perplexity API response into our expected format
export const processPerplexityResponse = (content: string, companyName: string): BriefingResponse => {
  try {
    console.log("Processing raw response: " + content.substring(0, 200) + "...");
    
    // Extract sources using the source extractor
    const sources = extractSources(content);
    
    // Return the raw content with minimal processing
    return {
      overview: content, // Use the entire content as overview
      highlights: [],    // We're not using highlights anymore
      summary: "",       // We're not using summary anymore
      sources: sources,  // Still extract sources for reference links
      recentNews: []     // We're not using recentNews anymore
    };
  } catch (error) {
    console.error("Error processing Perplexity response:", error);
    
    // Return a basic structure with error information
    return {
      overview: `Não foi possível processar completamente a resposta para ${companyName}. Erro: ${error.message}`,
      highlights: [],
      summary: "",
      sources: [{ 
        title: `Site oficial de ${companyName}`, 
        url: `https://www.google.com/search?q=${encodeURIComponent(companyName)}+site+oficial`
      }],
      recentNews: []
    };
  }
};
