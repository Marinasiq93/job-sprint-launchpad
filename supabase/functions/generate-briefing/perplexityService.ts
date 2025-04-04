
import { BriefingResponse } from "./types.ts";
import { callPerplexityAPI } from "./apiService.ts";
import { extractSources } from "./extractors/sourceExtractor.ts";
import { preserveMarkdownStructure, removeDuplicateHeaders } from "./utils/textUtils.ts";

// Call Perplexity API to get the analysis
export const getPerplexityAnalysis = async (prompt: string, perplexityApiKey: string): Promise<string> => {
  return await callPerplexityAPI(prompt, perplexityApiKey);
};

// Check if content is a demo/placeholder response
const isDemoContent = (content: string): boolean => {
  const demoTerms = [
    'demonstração:', 
    'esta é uma versão de demonstração',
    'esta é uma análise de demonstração', 
    'modo de demonstração'
  ];
  
  return demoTerms.some(term => content.toLowerCase().includes(term.toLowerCase()));
};

// Process the raw Perplexity API response into our expected format
export const processPerplexityResponse = (content: string, companyName: string): BriefingResponse => {
  try {
    console.log("Processing raw response: " + content.substring(0, 200) + "...");
    
    // Se o conteúdo explicitamente tem termos de demonstração, ele deve ser tratado como tal
    if (isDemoContent(content)) {
      console.log("Content contains demo markers, treating as demo content");
      throw new Error("Demo content detected");
    }
    
    // Extract sources using the source extractor
    const sources = extractSources(content);
    
    // Only perform minimal processing to maintain the original format from Perplexity
    let processedContent = content
      // Normalize line breaks for consistent processing
      .replace(/\r\n/g, '\n');
    
    // Remove source section since we extract it separately
    const sourceSectionMatch = processedContent.match(/(?:Sources|Fontes|References|Referências)(?::|)\s*\n((?:.|\n)*$)/i);
    if (sourceSectionMatch) {
      processedContent = processedContent.substring(0, processedContent.indexOf(sourceSectionMatch[0])).trim();
    }
    
    console.log("Minimally processed content sample:", processedContent.substring(0, 200) + "...");
    
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
