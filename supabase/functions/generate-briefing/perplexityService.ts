
import { BriefingResponse } from "./types.ts";
import { callPerplexityAPI } from "./apiService.ts";
import { extractSources } from "./extractors/sourceExtractor.ts";
import { preserveMarkdownStructure, removeDuplicateHeaders } from "./utils/textUtils.ts";

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
    
    // Preprocessing - preserve original structure as much as possible
    let processedContent = content
      // Normalize line breaks for consistent processing
      .replace(/\r\n/g, '\n');
    
    // Remove source section since we extract it separately
    const sourceSectionMatch = processedContent.match(/(?:Sources|Fontes|References|Referências)(?::|)\s*\n((?:.|\n)*$)/i);
    if (sourceSectionMatch) {
      processedContent = processedContent.substring(0, processedContent.indexOf(sourceSectionMatch[0])).trim();
    }
    
    // Apply minimal processing to preserve original structure
    processedContent = preserveMarkdownStructure(processedContent);
    processedContent = removeDuplicateHeaders(processedContent);
    
    // Return the processed content with minimal modifications
    return {
      overview: processedContent, // Use the minimally processed content as overview
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
