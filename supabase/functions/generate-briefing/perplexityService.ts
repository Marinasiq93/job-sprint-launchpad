
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
    // Split the response by sections marked with ## (markdown headers)
    const sections = content.split(/##\s+/g).filter(section => section.trim().length > 0);
    
    // First section is typically the overview or might not have a header
    let overview = sections.length > 0 ? sections[0] : '';
    if (sections.length > 1 && !content.startsWith('##')) {
      // If the content doesn't start with ##, then the first item isn't a section
      overview = sections[0];
    } else if (content.startsWith('##')) {
      // If there's no introduction before the first ##, create a basic overview
      overview = `Análise da empresa ${companyName}`;
    }
    
    // Clean and trim the overview
    overview = cleanText(overview);
    
    // Extract highlights from values or key points sections
    let highlights: string[] = [];
    const valuesSection = sections.find(s => 
      s.toLowerCase().startsWith('valores') || 
      s.toLowerCase().includes('corporativos') ||
      s.toLowerCase().includes('principais pontos')
    );
    
    if (valuesSection) {
      // Extract bullet points using regex for different bullet formats
      const bulletRegex = /(?:^|\n)[-•*]\s+([^\n]+)/g;
      const numberRegex = /(?:^|\n)\d+\.\s+([^\n]+)/g;
      
      let match;
      // Get bulleted items
      while ((match = bulletRegex.exec(valuesSection)) !== null) {
        highlights.push(cleanText(match[1]));
      }
      
      // Get numbered items
      while ((match = numberRegex.exec(valuesSection)) !== null) {
        highlights.push(cleanText(match[1]));
      }
    }
    
    // If no highlights were found, extract potential highlights from entire content
    if (highlights.length === 0) {
      const entireContentBulletRegex = /(?:^|\n)[-•*]\s+([^\n]+)/g;
      const entireContentNumberRegex = /(?:^|\n)\d+\.\s+([^\n]+)/g;
      
      let match;
      while ((match = entireContentBulletRegex.exec(content)) !== null) {
        highlights.push(cleanText(match[1]));
      }
      
      while ((match = entireContentNumberRegex.exec(content)) !== null) {
        highlights.push(cleanText(match[1]));
      }
    }
    
    // Default highlights if none found
    if (highlights.length === 0) {
      highlights = [
        `Informações sobre ${companyName}`,
        "Consulte o site oficial da empresa para mais detalhes"
      ];
    }
    
    // Extract the summary section or use the last paragraph of the content
    let summary = '';
    const newsSection = sections.find(s => 
      s.toLowerCase().startsWith('notícias') || 
      s.toLowerCase().includes('recentes')
    );
    
    if (newsSection) {
      // Use the paragraph before the news section as the summary
      const newsSectionIndex = sections.indexOf(newsSection);
      if (newsSectionIndex > 0) {
        const previousSection = sections[newsSectionIndex - 1];
        const paragraphs = previousSection.split('\n\n').filter(p => p.trim().length > 0);
        summary = paragraphs.length > 0 ? cleanText(paragraphs[paragraphs.length - 1]) : '';
      }
    }
    
    // If no summary found yet, use the last paragraph of the last non-news section
    if (!summary) {
      const nonNewsSections = sections.filter(s => 
        !s.toLowerCase().startsWith('notícias') && 
        !s.toLowerCase().includes('recentes') &&
        !s.toLowerCase().startsWith('citations')
      );
      
      if (nonNewsSections.length > 0) {
        const lastSection = nonNewsSections[nonNewsSections.length - 1];
        const paragraphs = lastSection.split('\n\n').filter(p => p.trim().length > 0);
        summary = paragraphs.length > 0 ? cleanText(paragraphs[paragraphs.length - 1]) : '';
      }
    }
    
    // If still no summary, use a simple default
    if (!summary) {
      summary = `Consulte a análise completa da empresa ${companyName} acima.`;
    }
    
    // Extract sources - both from citations and direct URLs
    const sources: { title: string; url: string }[] = [];
    
    // Extract from Citations section
    const citationsRegex = /\[(\d+)\]\s+(https?:\/\/[^\s]+)/g;
    let citationMatch;
    while ((citationMatch = citationsRegex.exec(content)) !== null) {
      const url = citationMatch[2];
      sources.push({
        title: getDomainName(url),
        url: url
      });
    }
    
    // Extract direct URLs as well
    const directUrlRegex = /(?<!\[|\()]https?:\/\/[^\s)]+/g;
    let urlMatch;
    while ((urlMatch = directUrlRegex.exec(content)) !== null) {
      const url = urlMatch[0];
      if (!sources.some(source => source.url === url)) {
        sources.push({
          title: getDomainName(url),
          url: url
        });
      }
    }
    
    // Extract recent news
    const recentNews: { title: string; date?: string; url?: string }[] = [];
    
    // Try to find the news section
    if (newsSection) {
      // Look for date patterns followed by news title
      const newsItemRegex = /(?:^|\n)(?:(\d{1,2}\/\d{1,2}\/\d{4})|(\d{1,2}\s+(?:de\s+)?(?:janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)(?:\s+de\s+)?\d{4}))\s*[-–—]\s*([^\n]*?)(?:\s*[-–—]\s*([^\n]*))?/gi;
      
      let newsMatch;
      while ((newsMatch = newsItemRegex.exec(newsSection)) !== null) {
        const date = newsMatch[1] || newsMatch[2] || '';
        const title = cleanText(newsMatch[3]) || '';
        const source = newsMatch[4] || '';
        
        // Extract URL from source if available
        const urlInSourceMatch = source.match(/(https?:\/\/[^\s)]+)/);
        const url = urlInSourceMatch ? urlInSourceMatch[1] : '';
        
        if (title) {
          recentNews.push({ title, date, url });
        }
      }
      
      // If no news found with above regex, try simpler pattern
      if (recentNews.length === 0) {
        const simpleNewsRegex = /(?:^|\n)(\d+)\.\s*(?:\*\*)?([^*\n]+)(?:\*\*)?(?:\s*[-–—]\s*([^\n]*))?/g;
        
        while ((newsMatch = simpleNewsRegex.exec(newsSection)) !== null) {
          const title = cleanText(newsMatch[2]) || '';
          const source = newsMatch[3] || '';
          
          // Extract URL from source if available
          const urlInSourceMatch = source.match(/(https?:\/\/[^\s)]+)/);
          const url = urlInSourceMatch ? urlInSourceMatch[1] : '';
          
          if (title) {
            recentNews.push({ title, date: '', url });
          }
        }
      }
    }
    
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
