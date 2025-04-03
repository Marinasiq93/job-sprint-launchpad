
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
    console.log("Processing raw response: " + content.substring(0, 200) + "...");
    
    // Split the response by sections marked with ## (markdown headers)
    const sections = content.split(/##\s+/).filter(section => section.trim().length > 0);
    
    // Get the company overview (first section after "Visão Geral")
    let overview = '';
    const overviewSectionIndex = sections.findIndex(section => 
      section.toLowerCase().includes('visão geral') || 
      section.toLowerCase().includes('overview')
    );
    
    if (overviewSectionIndex !== -1) {
      overview = sections[overviewSectionIndex];
    } else if (sections.length > 0) {
      // If no Visão Geral section, use the first section
      overview = sections[0];
    } else {
      // If no sections were identified, use the entire content
      overview = content;
    }
    
    // Extract all bullet points from all sections for highlights
    let highlights: string[] = [];
    const entireContentBulletRegex = /(?:^|\n)\s*[•\*-]\s+([^\n]+)/g;
    let match;
    
    while ((match = entireContentBulletRegex.exec(content)) !== null) {
      const highlight = cleanText(match[1]);
      if (highlight && highlight.length > 0) {
        highlights.push(highlight);
      }
    }
    
    // If no highlights found, look for values in the second section
    if (highlights.length === 0 && sections.length > 1) {
      const valuesSectionIndex = sections.findIndex(s => 
        s.toLowerCase().includes('valores') || 
        s.toLowerCase().includes('missão') ||
        s.toLowerCase().includes('princípios')
      );
      
      if (valuesSectionIndex !== -1) {
        const valuesSection = sections[valuesSectionIndex];
        const bulletRegex = /(?:^|\n)\s*[•\*-]\s+([^\n]+)/g;
        
        while ((match = bulletRegex.exec(valuesSection)) !== null) {
          const highlight = cleanText(match[1]);
          if (highlight && highlight.length > 0) {
            highlights.push(highlight);
          }
        }
      }
    }
    
    // If still no highlights, extract sentences from the values section (if it exists)
    if (highlights.length === 0 && sections.length > 1) {
      const valuesSectionIndex = sections.findIndex(s => 
        s.toLowerCase().includes('valores') || 
        s.toLowerCase().includes('missão') ||
        s.toLowerCase().includes('princípios')
      );
      
      if (valuesSectionIndex !== -1) {
        const valuesSection = sections[valuesSectionIndex];
        const sentences = valuesSection.split(/\.\s+/);
        
        for (const sentence of sentences) {
          const cleanSentence = cleanText(sentence);
          if (cleanSentence && cleanSentence.length > 20 && cleanSentence.length < 200) {
            highlights.push(cleanSentence);
            if (highlights.length >= 5) break;
          }
        }
      }
    }
    
    // Default highlights if none found
    if (highlights.length === 0) {
      highlights = [
        `Consulte as informações completas sobre ${companyName} no site oficial`,
        "Visite o LinkedIn da empresa para mais detalhes sobre sua cultura e valores",
        "Explore notícias recentes para entender o posicionamento atual da empresa"
      ];
    }
    
    // Find a summary paragraph from the content
    let summary = '';
    
    // Try to get the last paragraph of a values section if it exists
    const valuesSectionIndex = sections.findIndex(s => 
      s.toLowerCase().includes('valores') || 
      s.toLowerCase().includes('missão') ||
      s.toLowerCase().includes('princípios')
    );
    
    if (valuesSectionIndex !== -1) {
      const valuesSection = sections[valuesSectionIndex];
      const paragraphs = valuesSection.split(/\n{2,}/);
      
      if (paragraphs.length > 0) {
        const lastParagraph = paragraphs[paragraphs.length - 1].trim();
        if (lastParagraph.length > 50) {
          summary = cleanText(lastParagraph);
        }
      }
    }
    
    // If no summary found from values section, use a paragraph from the overview
    if (!summary && overview) {
      const paragraphs = overview.split(/\n{2,}/);
      for (const paragraph of paragraphs) {
        const cleaned = cleanText(paragraph);
        if (cleaned.length > 50 && cleaned.length < 300) {
          summary = cleaned;
          break;
        }
      }
    }
    
    // If still no summary, use a default one
    if (!summary) {
      summary = `${companyName} é uma empresa que oferece soluções inovadoras para seus clientes. Consulte o site oficial para mais informações.`;
    }
    
    // Extract news directly using the news extractor
    const recentNews = extractRecentNews(content, companyName);
    
    // Extract sources using the source extractor
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
    
    // Return a basic structure with error information
    return {
      overview: `Não foi possível processar completamente a resposta para ${companyName}. Erro: ${error.message}`,
      highlights: ["Visite o site oficial da empresa para informações precisas"],
      summary: "Ocorreu um erro ao processar a análise da empresa. Tente novamente ou consulte diretamente o site da empresa.",
      sources: [{ 
        title: `Site oficial de ${companyName}`, 
        url: `https://www.google.com/search?q=${encodeURIComponent(companyName)}+site+oficial`
      }],
      recentNews: []
    };
  }
};
