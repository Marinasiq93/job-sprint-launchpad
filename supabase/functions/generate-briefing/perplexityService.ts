
import { BriefingResponse } from "./types.ts";
import { callPerplexityAPI } from "./apiService.ts";
import { extractSources } from "./extractors/sourceExtractor.ts";
import { preserveMarkdownStructure, removeDuplicateHeaders } from "./utils/textUtils.ts";

// Call Perplexity API to get the analysis
export const getPerplexityAnalysis = async (prompt: string, perplexityApiKey: string): Promise<string> => {
  console.log("Calling Perplexity API with prompt:", prompt.substring(0, 100) + "...");
  
  if (!perplexityApiKey || perplexityApiKey.trim() === '') {
    throw new Error("Perplexity API Key is missing or invalid");
  }
  
  try {
    return await callPerplexityAPI(prompt, perplexityApiKey);
  } catch (error) {
    console.error("Error calling Perplexity API:", error);
    throw new Error(`Failed to get analysis from Perplexity API: ${error.message}`);
  }
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
    
    if (!content || content.trim() === '') {
      console.log("Empty content received from API");
      throw new Error("Empty response received from Perplexity API");
    }
    
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
    
    // Remove any "visit the website" instructions that might have been echoed back
    const visitWebsiteRegex = /Visite o site (institucional |oficial )?(da empresa|de|do) [^:]+: https?:\/\/[^\s]+\/?/gi;
    processedContent = processedContent.replace(visitWebsiteRegex, '');
    
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
      
      // Enhanced name extraction for founders (looking for names followed by titles/roles)
      const nameExtractor = /\*\*([^*]+)\*\*|(?:^|\n)([A-Z][a-zÀ-ÿ]+(?: [A-Z][a-zÀ-ÿ]+)+)(?=\s*[:-]|\s+é|\s+(atual|co-fundador|fundador|CEO|CTO|COO|CFO))/gi;
      const founderNames: string[] = [];
      let match;
      
      while ((match = nameExtractor.exec(foundersText)) !== null) {
        if (match[1]) founderNames.push(match[1].toLowerCase());
        if (match[2]) founderNames.push(match[2].toLowerCase());
      }
      
      // Check for duplicate content - looking for founders mentioned in executive section
      let duplicatesFound = false;
      const cleanedExecutiveText = executiveText.replace(/Co-fundador|Fundador|CEO|CTO|COO|CFO/gi, (match) => {
        duplicatesFound = true;
        return match; // Just marking that we found duplicates, not changing the text yet
      });
      
      // If we found founder names, add a note to executive section if needed
      if ((founderNames.length > 0 && duplicatesFound) || 
          (founderNames.length > 0 && !executiveText.includes("não inclui fundadores") && !executiveText.includes("sem os fundadores"))) {
        console.log("Adding clarification note about founders in executive section");
        
        // If the executive section starts with "Principais Executivos" rather than the heading,
        // we need to handle it differently
        if (executiveText.trim().startsWith("Principais Executivos") || 
            executiveText.trim().startsWith("- Cargo Atual:")) {
          // This might be a duplicate section - let's remove it completely if short enough
          // or add a clarification note if it's substantial
          if (executiveText.length < 400) { // If it's a short section, likely just duplicated content
            processedContent = processedContent.replace(executiveMatch[0], "");
          } else {
            const updatedExecutiveSection = `## Equipe Executiva
*(Nota: Esta seção lista apenas executivos que não são fundadores)*
${executiveText.replace(/^Principais Executivos[^]*?(##|$)/m, '')}`;
            processedContent = processedContent.replace(executiveSectionRegex, updatedExecutiveSection);
          }
        } else {
          // Standard case - add clarification note
          const updatedExecutiveSection = `## Equipe Executiva
*(Nota: Esta seção lista apenas executivos que não são fundadores)*
${executiveText.replace(/##\s*Equipe\s*Executiva\s*/i, '')}`;
          
          processedContent = processedContent.replace(executiveSectionRegex, updatedExecutiveSection);
        }
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
