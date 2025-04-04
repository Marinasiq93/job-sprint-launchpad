
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
    
    // Check for demo content markers
    if (isDemoContent(content)) {
      console.log("Content contains demo markers, treating as demo content");
      throw new Error("Demo content detected");
    }
    
    // Extract sources using the source extractor
    const sources = extractSources(content);
    console.log(`Extracted ${sources.length} sources`);
    
    // Preserve the original format as much as possible
    // Only remove the source section since we extract it separately
    let processedContent = content;
    
    // Look for source sections with different possible headings and formats
    const sourceSectionRegex = /(?:^|\n)(?:Sources|Fontes|References|Referências|Fonte)(?::|)\s*\n?((?:.|\n)*$)/i;
    const sourceSectionMatch = processedContent.match(sourceSectionRegex);
    if (sourceSectionMatch) {
      processedContent = processedContent.substring(0, processedContent.indexOf(sourceSectionMatch[0])).trim();
    }
    
    // Apply minimal formatting to preserve structure
    processedContent = preserveMarkdownStructure(processedContent);
    processedContent = removeDuplicateHeaders(processedContent);
    
    // Look for and fix any potential repetition of founders in executive section
    const foundersSectionRegex = /##\s*Fundadores([\s\S]*?)(?=##|$)/i;
    const executiveSectionRegex = /##\s*Equipe\s*Executiva([\s\S]*?)(?=##|$)/i;
    
    const foundersMatch = processedContent.match(foundersSectionRegex);
    const executiveMatch = processedContent.match(executiveSectionRegex);
    
    if (foundersMatch && executiveMatch) {
      console.log("Found both founders and executive sections, checking for repetitions");
      // We have both sections, extract names from founders section to check for repetitions
      const foundersText = foundersMatch[1];
      const executiveText = executiveMatch[1];
      
      // Simple name extraction (looking for bold names or names followed by colon/dash)
      const nameExtractor = /\*\*([^*]+)\*\*|(?:^|\n)([A-Z][a-zÀ-ÿ]+(?: [A-Z][a-zÀ-ÿ]+)+)(?=\s*[:-])/g;
      const founderNames: string[] = [];
      let match;
      
      while ((match = nameExtractor.exec(foundersText)) !== null) {
        if (match[1]) founderNames.push(match[1].toLowerCase());
        if (match[2]) founderNames.push(match[2].toLowerCase());
      }
      
      // If we found founder names, add a note to executive section if needed
      if (founderNames.length > 0 && !executiveText.includes("não inclui fundadores") && !executiveText.includes("sem os fundadores")) {
        console.log("Adding clarification note about founders in executive section");
        const updatedExecutiveSection = `## Equipe Executiva
*(Nota: Esta seção lista apenas executivos que não são fundadores)*
${executiveText.replace(/##\s*Equipe\s*Executiva\s*/i, '')}`;
        
        processedContent = processedContent.replace(executiveSectionRegex, updatedExecutiveSection);
      }
    }
    
    console.log("Processed content sample:", processedContent.substring(0, 200) + "...");
    
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
