
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
    
    // Clean up any potential "Análise Geral" sections from the content
    // This pattern will match the section header and all content until the next section header or end of content
    const cleanedContent = content.replace(/\b(Análise Geral|ANÁLISE GERAL)(\s*:|\s*\n|\s*)([\s\S]*?)(?=(\n\s*\n\s*[A-Z#]|$))/gi, '');
    
    // Add appropriate spacing between paragraphs
    const formattedContent = cleanedContent
      // Ensure sections have proper spacing
      .replace(/\n([A-Z][A-Za-záàâãéèêíïóôõöúçñ\s]{2,})(?:\s*da\s+|\s+de\s+|\s+do\s+|\s+dos\s+|\s+das\s+)?([A-Z][A-Za-z0-9áàâãéèêíïóôõöúçñ\s]+)$/gm, '\n\n$1$2')
      // Add proper spacing before section headers
      .replace(/\n([A-Z][A-Za-záàâãéèêíïóôõöúçñ\s]{2,}):$/gm, '\n\n$1:');
    
    // Return the raw content with minimal processing
    return {
      overview: formattedContent, // Use the formatted content as overview
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
