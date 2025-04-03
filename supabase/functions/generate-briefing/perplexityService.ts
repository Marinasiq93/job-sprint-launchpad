
import { BriefingResponse } from "./types.ts";
import { callPerplexityAPI } from "./apiService.ts";
import { cleanText } from "./utils/textUtils.ts";
import { extractRecentNews } from "./extractors/newsExtractor.ts";
import { extractSources } from "./extractors/sourceExtractor.ts";

// Call Perplexity API to get the analysis
export const getPerplexityAnalysis = async (prompt: string, perplexityApiKey: string): Promise<string> => {
  return await callPerplexityAPI(prompt, perplexityApiKey);
};

// Process the raw Perplexity API response into our expected format
export const processPerplexityResponse = (content: string, companyName: string): BriefingResponse => {
  try {
    // Split the response by sections marked with ## (markdown headers)
    const sections = content.split(/##\s+/).filter(section => section.trim().length > 0);
    
    // First section is typically the overview or might not have a header
    let overview = '';
    if (sections.length > 0) {
      if (content.startsWith('##')) {
        // If the content starts with ##, then the first item is the first section
        overview = sections[0];
      } else {
        // If there's content before the first ##, use that as overview
        const beforeFirstSection = content.split(/##\s+/)[0];
        if (beforeFirstSection && beforeFirstSection.trim().length > 0) {
          overview = beforeFirstSection;
        } else {
          overview = sections[0];
        }
      }
    } else {
      // If no sections are found, use the whole content
      overview = content;
    }
    
    // Extract highlights (bullet points with * from all sections)
    let highlights: string[] = [];
    const entireContentBulletRegex = /(?:^|\n)\s*\*\s+([^\n]+)/g;
    let match;
    
    while ((match = entireContentBulletRegex.exec(content)) !== null) {
      const highlight = cleanText(match[1]);
      if (highlight && highlight.length > 0) {
        highlights.push(highlight);
      }
    }
    
    // If no highlights found, extract from any section that might contain values or key points
    if (highlights.length === 0) {
      const valuesSectionIndex = sections.findIndex(s => 
        s.toLowerCase().includes('valores') || 
        s.toLowerCase().includes('missão') ||
        s.toLowerCase().includes('pontos')
      );
      
      if (valuesSectionIndex !== -1) {
        const valuesSection = sections[valuesSectionIndex];
        const bulletRegex = /(?:^|\n)\s*[-•*]\s+([^\n]+)/g;
        
        while ((match = bulletRegex.exec(valuesSection)) !== null) {
          const highlight = cleanText(match[1]);
          if (highlight && highlight.length > 0) {
            highlights.push(highlight);
          }
        }
      }
    }
    
    // Default highlights if none found
    if (highlights.length === 0) {
      highlights = [
        `Consulte as informações completas sobre ${companyName} acima`,
        "Visite o site oficial da empresa para mais detalhes"
      ];
    }
    
    // Find a good summary paragraph from the content
    let summary = '';
    const paragraphs = content.split(/\n{2,}/);
    // Try to get a paragraph from the end of a non-news section
    for (let i = paragraphs.length - 1; i >= 0; i--) {
      const paragraph = paragraphs[i].trim();
      if (paragraph.length > 50 && 
          !paragraph.toLowerCase().includes('notícias recentes') &&
          !paragraph.toLowerCase().includes('citations') &&
          !paragraph.match(/^\d+\.\s+\[/)) {
        summary = cleanText(paragraph);
        break;
      }
    }
    
    // If no summary found, use a simple default
    if (!summary) {
      summary = `Consulte a análise completa da empresa ${companyName} acima.`;
    }
    
    // Extract news directly using the extractor
    const recentNews = extractRecentNews(content, companyName);
    
    // Extract sources using the extractor
    const sources = extractSources(content);
    
    return {
      overview,
      highlights,
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
      sources: [{ 
        title: `Pesquisar ${companyName}`, 
        url: `https://www.google.com/search?q=${encodeURIComponent(companyName)}`
      }],
      recentNews: []
    };
  }
};
