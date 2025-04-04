
import { BriefingResponse } from "./types.ts";
import { callPerplexityAPI } from "./apiService.ts";
import { extractSources } from "./contentExtractors.ts";
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
    
    // Check for demo content markers
    if (isDemoContent(content)) {
      console.log("Content contains demo markers, treating as demo content");
      throw new Error("Demo content detected");
    }
    
    // Extract sources using the source extractor
    const sources = extractSources(content);
    
    // Preserve the original format as much as possible
    // Only remove the source section since we extract it separately
    let processedContent = content;
    
    const sourceSectionMatch = processedContent.match(/(?:Sources|Fontes|References|Referências)(?::|)\s*\n((?:.|\n)*$)/i);
    if (sourceSectionMatch) {
      processedContent = processedContent.substring(0, processedContent.indexOf(sourceSectionMatch[0])).trim();
    }
    
    // Apply minimal formatting to preserve structure
    processedContent = preserveMarkdownStructure(processedContent);
    processedContent = removeDuplicateHeaders(processedContent);
    
    console.log("Minimally processed content sample:", processedContent.substring(0, 200) + "...");
    
    // Return the processed content with minimal modifications
    return {
      overview: processedContent,   // Keep the main content with minimal processing
      highlights: [],               // We're not extracting highlights separately anymore
      summary: "",                  // We're not extracting summary separately anymore
      sources: sources,             // Include extracted sources
      recentNews: []                // We're not extracting news separately anymore
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
