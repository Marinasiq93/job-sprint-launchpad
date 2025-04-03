
// Utility functions for extracting different content types from API responses

// Extract highlights from content
export const extractHighlights = (content: string): string[] => {
  let highlights: string[] = [];
  
  // Look for bullet points or numbered lists
  const bulletRegex = /[•\-*]\s+([^\n]+)/g;
  const numberedRegex = /\d+\.\s+([^\n]+)/g;
  
  // Try to find sections that typically contain highlights
  const valuesSectionRegex = /(?:valores|princípios|cultura|values|principles)(?:[:\n]+)([\s\S]*?)(?:\n\n|\n##|\n\d\.|\n$)/i;
  const highlightSectionRegex = /(?:principais pontos|destaques|highlights)(?:[:\n]+)([\s\S]*?)(?:\n\n|\n##|\n\d\.|\n$)/i;
  
  // First try to find a dedicated values section
  const valuesSection = content.match(valuesSectionRegex);
  if (valuesSection && valuesSection[1]) {
    const sectionContent = valuesSection[1];
    
    let bulletMatch;
    while ((bulletMatch = bulletRegex.exec(sectionContent)) !== null) {
      if (bulletMatch[1].trim().length > 0) {
        highlights.push(bulletMatch[1].trim());
      }
    }
  }
  
  // Then try to find a dedicated highlights section if values not found
  if (highlights.length === 0) {
    const highlightSection = content.match(highlightSectionRegex);
    if (highlightSection && highlightSection[1]) {
      const sectionContent = highlightSection[1];
      
      let bulletMatch;
      while ((bulletMatch = bulletRegex.exec(sectionContent)) !== null) {
        if (bulletMatch[1].trim().length > 0) {
          highlights.push(bulletMatch[1].trim());
        }
      }
    }
  }
  
  // If still no highlights, look for bullet points throughout the content
  if (highlights.length === 0) {
    let bulletMatch;
    while ((bulletMatch = bulletRegex.exec(content)) !== null) {
      if (bulletMatch[1].trim().length > 0 && 
          !highlights.some(h => h.toLowerCase().includes(bulletMatch[1].toLowerCase().substring(0, 20)))) {
        highlights.push(bulletMatch[1].trim());
      }
    }
  }
  
  // Extract any quoted text as potential highlights if we still don't have enough
  if (highlights.length < 3) {
    const quoteRegex = /"([^"]+)"|"([^"]+)"|'([^']+)'/g;
    let quoteMatch;
    while ((quoteMatch = quoteRegex.exec(content)) !== null && highlights.length < 5) {
      const quote = quoteMatch[1] || quoteMatch[2] || quoteMatch[3];
      if (quote && quote.length > 10 && quote.length < 150 && 
          !highlights.some(h => h.includes(quote.substring(0, 20)))) {
        highlights.push(`"${quote}"`);
      }
    }
  }
  
  // If still not enough highlights, extract key sentences from paragraphs
  if (highlights.length < 3) {
    const paragraphs = content.split('\n\n').filter(p => p.length > 0);
    // Skip first and last paragraphs (likely overview and conclusion)
    if (paragraphs.length > 3) {
      const midParagraphs = paragraphs.slice(1, -1);
      for (const paragraph of midParagraphs) {
        const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [];
        if (sentences.length > 0) {
          const keyPoint = sentences[0].trim();
          if (keyPoint.length > 20 && keyPoint.length < 150 && 
              !highlights.some(h => h.toLowerCase().includes(keyPoint.toLowerCase().substring(0, 20)))) {
            highlights.push(keyPoint);
            if (highlights.length >= 5) break;
          }
        }
      }
    }
  }
  
  // Remove duplicative content (check for significant overlaps)
  const uniqueHighlights = [];
  for (const highlight of highlights) {
    const isDuplicate = uniqueHighlights.some(existingHighlight => {
      // Check if there's substantial text overlap
      const shortestLength = Math.min(highlight.length, existingHighlight.length);
      const comparisonLength = Math.floor(shortestLength * 0.7); // 70% overlap threshold
      return highlight.toLowerCase().includes(existingHighlight.toLowerCase().substring(0, comparisonLength)) ||
             existingHighlight.toLowerCase().includes(highlight.toLowerCase().substring(0, comparisonLength));
    });
    
    if (!isDuplicate) {
      uniqueHighlights.push(highlight);
    }
  }
  
  // Limit to 5 highlights and return
  return uniqueHighlights.slice(0, 5);
};

// Extract sources from content
export const extractSources = (content: string, companyName: string): Array<{title: string, url: string}> => {
  const sources: Array<{title: string, url: string}> = [];
  const urlRegex = /(https?:\/\/[^\s\)\"\'\]]+)/g;
  
  // Look for explicit mentions of sources
  const sourceSectionRegex = /(?:fontes|sources|referências|referencias|links)(?:[:\n]+)([\s\S]*?)(?:\n\n|\n##|\n\d\.|\n$)/i;
  const sourceSection = content.match(sourceSectionRegex);
  
  if (sourceSection && sourceSection[1]) {
    const sectionContent = sourceSection[1];
    
    // Look for formatted sources with titles
    const formattedSourceRegex = /(?:[-•*]|\d+\.)\s+(.+?)(?::|-)?\s*(https?:\/\/[^\s\)\"\'\]]+)/g;
    let formattedMatch;
    
    while ((formattedMatch = formattedSourceRegex.exec(sectionContent)) !== null) {
      if (formattedMatch[1] && formattedMatch[2]) {
        sources.push({
          title: formattedMatch[1].trim(),
          url: formattedMatch[2].trim()
        });
      }
    }
    
    // If no formatted sources found, extract all URLs from the section
    if (sources.length === 0) {
      const sectionUrls = [...new Set(sectionContent.match(urlRegex) || [])];
      sectionUrls.forEach(url => {
        if (!sources.some(s => s.url === url)) {
          const titleRegex = new RegExp(`([^\\n.]+)[\\s:]+${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
          const titleMatch = sectionContent.match(titleRegex);
          
          sources.push({
            title: titleMatch ? titleMatch[1].trim() : getDomainName(url),
            url: url
          });
        }
      });
    }
  }
  
  // Look for URLs throughout the content if we don't have enough
  if (sources.length < 2) {
    const urls = [...new Set(content.match(urlRegex) || [])];
    urls.slice(0, 5).forEach(url => {
      if (!sources.some(s => s.url === url)) {
        const domain = getDomainName(url);
        
        // Try to find context around the URL
        const contextRegex = new RegExp(`.{0,50}${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.{0,30}`, 'i');
        const contextMatch = content.match(contextRegex);
        let title = domain;
        
        if (contextMatch) {
          // Extract potential title from context
          const beforeUrl = contextMatch[0].split(url)[0].trim();
          if (beforeUrl && beforeUrl.length > 3) {
            // Get the last sentence fragment before the URL
            const lastSentence = beforeUrl.split(/[.!?]\s+/).pop() || beforeUrl;
            title = lastSentence;
          }
        }
        
        // Clean up title if it's just a fragment
        if (title.length < 5) {
          if (domain.includes("linkedin")) {
            title = `LinkedIn: ${companyName}`;
          } else if (domain.includes(companyName.toLowerCase().replace(/\s+/g, ''))) {
            title = `Site oficial: ${companyName}`;
          } else {
            title = `Fonte: ${domain}`;
          }
        }
        
        sources.push({
          title,
          url
        });
      }
    });
  }
  
  // Add default sources if we still don't have enough
  if (sources.length === 0) {
    sources.push({
      title: `Site oficial de ${companyName}`,
      url: `https://www.google.com/search?q=${encodeURIComponent(companyName)}+site+oficial`
    });
    sources.push({
      title: `${companyName} no LinkedIn`,
      url: `https://www.linkedin.com/company/${encodeURIComponent(companyName.toLowerCase().replace(/\s+/g, '-'))}`
    });
  }
  
  return sources;
};

// Helper function to get domain name from URL
const getDomainName = (url: string): string => {
  try {
    return url.split("//")[1]?.split("/")[0] || url;
  } catch {
    return url;
  }
};

// Extract news items from content
export const extractRecentNews = (content: string, companyName: string): Array<{title: string, date?: string, url?: string}> => {
  const recentNews: Array<{title: string, date?: string, url?: string}> = [];
  const urlRegex = /(https?:\/\/[^\s\)\"\'\]]+)/g;
  
  // First look for the NOTÍCIAS RECENTES section
  const newsSectionRegex = /NOTÍCIAS RECENTES:?\s*([\s\S]*?)(?:\n\n|\n##|\n$)/i;
  const newsSection = content.match(newsSectionRegex);
  
  // If no dedicated section, look for "notícias recentes" in any format
  if (!newsSection) {
    const altNewsSectionRegex = /(?:notícias|notícias recentes|recentes|recent news|últimas)(?:[:\n]+)([\s\S]*?)(?:\n\n|\n##|\n$)/i;
    const altNewsSection = content.match(altNewsSectionRegex);
    
    if (altNewsSection && altNewsSection[1]) {
      // Process news in the format NUMBER. [DATE] - TITLE - SOURCE: URL
      const newsItemRegex = /(\d+)\.\s+(?:\[?(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}\s+de\s+[a-zç]+(?:\s+de\s+\d{2,4})?)\]?)?\s*[-–]?\s*([^-\n]+)(?:[-–]\s*(?:[Ff]onte:?\s*)?(.+?))?(?:\n|$)/g;
      let newsMatch;
      
      while ((newsMatch = newsItemRegex.exec(altNewsSection[1])) !== null && recentNews.length < 3) {
        const date = newsMatch[2] ? newsMatch[2].trim() : undefined;
        const title = newsMatch[3] ? newsMatch[3].trim() : "";
        const source = newsMatch[4] ? newsMatch[4].trim() : undefined;
        
        // Extract URL if it exists in the source
        const urlMatch = source ? source.match(urlRegex) : null;
        const url = urlMatch ? urlMatch[0] : undefined;
        
        if (title) {
          recentNews.push({
            title,
            date,
            url
          });
        }
      }
    }
  } else {
    // Process dedicated NOTÍCIAS RECENTES section
    const newsItems = newsSection[1].split(/\n+/).filter(line => line.trim().length > 0);
    
    for (const item of newsItems) {
      // Try to parse in format: NUMBER. [DATE] - TITLE - SOURCE: URL
      const newsItemMatch = item.match(/(\d+)\.\s+(?:\[?(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}\s+de\s+[a-zç]+(?:\s+de\s+\d{2,4})?)\]?)?\s*[-–]?\s*([^-\n]+)(?:[-–]\s*(?:[Ff]onte:?\s*)?(.+?))?$/);
      
      if (newsItemMatch) {
        const date = newsItemMatch[2] ? newsItemMatch[2].trim() : undefined;
        const title = newsItemMatch[3] ? newsItemMatch[3].trim() : "";
        const source = newsItemMatch[4] ? newsItemMatch[4].trim() : undefined;
        
        // Extract URL if it exists in the source
        const urlMatch = source ? source.match(urlRegex) : null;
        const url = urlMatch ? urlMatch[0] : undefined;
        
        if (title) {
          recentNews.push({
            title,
            date,
            url
          });
        }
      }
    }
  }
  
  // If we still have no news items, look for any sentences with dates
  if (recentNews.length === 0) {
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{2,4})/,  // DD/MM/YYYY
      /(\d{1,2}\s+de\s+[a-zç]+(?:\s+de\s+\d{2,4})?)/  // DD de Month [de YYYY]
    ];
    
    for (const datePattern of datePatterns) {
      const dateRegex = new RegExp(`${datePattern.source}[^\\n.]*?([^.\\n]{10,100})`, 'g');
      let dateMatch;
      
      while ((dateMatch = dateRegex.exec(content)) !== null && recentNews.length < 3) {
        const date = dateMatch[1];
        const title = dateMatch[2].trim();
        
        if (title && !recentNews.some(news => news.title.includes(title.substring(0, 20)))) {
          recentNews.push({
            title,
            date
          });
        }
      }
      
      if (recentNews.length > 0) break;
    }
  }
  
  // If we still have no news, add a generic item
  if (recentNews.length === 0) {
    recentNews.push({
      title: `Pesquise as últimas notícias sobre ${companyName}`,
      url: `https://www.google.com/search?q=${encodeURIComponent(companyName)}+notícias&tbm=nws`
    });
  }
  
  return recentNews.slice(0, 3); // Limit to 3 news items
};
