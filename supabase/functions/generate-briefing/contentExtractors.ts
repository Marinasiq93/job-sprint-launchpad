
// Utility functions for extracting different content types from API responses

// Extract highlights from content
export const extractHighlights = (content: string): string[] => {
  let highlights: string[] = [];
  
  // Look for bullet points or numbered lists
  const bulletRegex = /[•\-*]\s+([^\n]+)/g;
  const numberedRegex = /\d+\.\s+([^\n]+)/g;
  const highlightSectionRegex = /(?:principais pontos|destaques|valores|princípios|características)(?:[:\n]+)([\s\S]*?)(?:\n\n|\n###|$)/i;
  
  // First try to find a dedicated highlights section
  const highlightSection = content.match(highlightSectionRegex);
  if (highlightSection && highlightSection[1]) {
    const sectionContent = highlightSection[1];
    
    let bulletMatch;
    while ((bulletMatch = bulletRegex.exec(sectionContent)) !== null) {
      if (bulletMatch[1].trim().length > 0) {
        highlights.push(bulletMatch[1].trim());
      }
    }
    
    let numberedMatch;
    while ((numberedMatch = numberedRegex.exec(sectionContent)) !== null) {
      if (numberedMatch[1].trim().length > 0) {
        highlights.push(numberedMatch[1].trim());
      }
    }
  }
  
  // If no highlights found in specific section, look throughout the content
  if (highlights.length === 0) {
    let bulletMatch;
    while ((bulletMatch = bulletRegex.exec(content)) !== null) {
      if (bulletMatch[1].trim().length > 0) {
        highlights.push(bulletMatch[1].trim());
      }
    }
  }
  
  // Extract any quoted text as potential highlights
  if (highlights.length < 3) {
    const quoteRegex = /"([^"]+)"|"([^"]+)"|'([^']+)'/g;
    let quoteMatch;
    while ((quoteMatch = quoteRegex.exec(content)) !== null && highlights.length < 5) {
      const quote = quoteMatch[1] || quoteMatch[2] || quoteMatch[3];
      if (quote && quote.length > 10 && quote.length < 150) {
        highlights.push(`"${quote}"`);
      }
    }
  }
  
  // If still no highlights, extract key sentences from the middle of the content
  if (highlights.length === 0) {
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
    // Skip first few and last few sentences (likely intro and conclusion)
    if (sentences.length > 6) {
      highlights = sentences.slice(2, 7)
        .map(s => s.trim())
        .filter(s => s.length > 20 && s.length < 150); // Filter out very short or long sentences
    } else if (sentences.length > 0) {
      highlights = sentences
        .slice(0, Math.min(5, sentences.length))
        .map(s => s.trim())
        .filter(s => s.length > 20 && s.length < 150);
    }
  }
  
  // Limit to 5 highlights
  highlights = highlights.slice(0, 5);
  
  return highlights;
};

// Extract sources from content
export const extractSources = (content: string, companyName: string): Array<{title: string, url: string}> => {
  const sources: Array<{title: string, url: string}> = [];
  const urlRegex = /(https?:\/\/[^\s\)\"\'\]]+)/g;
  const urls = [...new Set(content.match(urlRegex) || [])]; // Use Set to remove duplicates
  
  // Look for explicit mentions of sources
  const sourceSectionRegex = /(?:fontes|sources|referências|referencias|links)(?:[:\n]+)([\s\S]*?)(?:\n\n|\n###|$)/i;
  const sourceSection = content.match(sourceSectionRegex);
  
  if (sourceSection && sourceSection[1]) {
    const sectionContent = sourceSection[1];
    
    // Look for formatted sources with titles
    const formattedSourceRegex = /(?:[-•*]|\d+\.)\s+([^:]+):\s*(https?:\/\/[^\s\)\"\'\]]+)/g;
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
          // Try to find any text preceding the URL
          const titleRegex = new RegExp(`([^\\n.]+)\\s*${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
          const titleMatch = sectionContent.match(titleRegex);
          
          sources.push({
            title: titleMatch ? titleMatch[1].trim() : getDomainName(url),
            url: url
          });
        }
      });
    }
  }
  
  // If no explicit sources found, look for URLs throughout the content
  if (sources.length === 0) {
    urls.slice(0, 5).forEach(url => {
      if (!sources.some(s => s.url === url)) {
        // Try to extract domain name for better readability
        const domain = getDomainName(url);
        let title = domain;
        
        // Try to identify common domains
        if (domain.includes("linkedin.com")) {
          title = `LinkedIn: ${companyName}`;
        } else if (domain.includes("glassdoor")) {
          title = `Glassdoor: Avaliações de ${companyName}`;
        } else if (companyName && domain.includes(companyName.toLowerCase().replace(/\s+/g, ''))) {
          title = `Site oficial: ${domain}`;
        } else {
          // Try to find context around the URL
          const contextRegex = new RegExp(`.{0,50}${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.{0,30}`, 'i');
          const contextMatch = content.match(contextRegex);
          if (contextMatch) {
            // Extract potential title from context
            const beforeUrl = contextMatch[0].split(url)[0].trim();
            if (beforeUrl && beforeUrl.length > 5) {
              const lastSentence = beforeUrl.split(/[.!?]\s+/).pop() || beforeUrl;
              title = lastSentence;
            }
          }
        }
        
        sources.push({
          title,
          url
        });
      }
    });
  }
  
  // If still no sources found, add generic ones
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
  
  // Look for a dedicated news section
  const newsSectionRegex = /(?:notícias|novidades|recentes|últimas)(?:[:\n]+)([\s\S]*?)(?:\n\n|\n###|$)/i;
  const newsSection = content.match(newsSectionRegex);
  
  // First pattern: [DATE] - [TITLE] - [SOURCE/URL]
  const newsPatternRegex = /(?:[-•*]|\d+\.)\s*(?:\[?(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}\s+de\s+[a-zç]+(?:\s+de\s+\d{2,4})?)\]?)?\s*[-–]\s*([^-–\n]+)(?:[-–]\s*(.+?))?(?:\n|$)/gi;
  
  if (newsSection && newsSection[1]) {
    let newsMatch;
    // Try to parse using the specified format first
    while ((newsMatch = newsPatternRegex.exec(newsSection[1])) !== null && recentNews.length < 3) {
      const date = newsMatch[1] ? newsMatch[1].trim() : undefined;
      const title = newsMatch[2] ? newsMatch[2].trim() : "";
      const sourceOrUrl = newsMatch[3] ? newsMatch[3].trim() : undefined;
      
      // Extract URL if it exists in the source
      const urlMatch = sourceOrUrl ? sourceOrUrl.match(urlRegex) : null;
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
  
  // If no news found using the pattern, try numbered list (often returned by the API)
  if (recentNews.length === 0) {
    const numberedNewsRegex = /(\d+)\.\s+(?:\[?(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}\s+de\s+[a-zç]+(?:\s+de\s+\d{2,4})?)\]?)?\s*[-–]?\s*([^\n]+)/g;
    let numberedMatch;
    
    while ((numberedMatch = numberedNewsRegex.exec(content)) !== null && recentNews.length < 3) {
      const date = numberedMatch[2] ? numberedMatch[2].trim() : undefined;
      const title = numberedMatch[3] ? numberedMatch[3].trim() : "";
      
      // Extract URL if it exists in the title
      const urlMatch = title ? title.match(urlRegex) : null;
      const url = urlMatch ? urlMatch[0] : undefined;
      const cleanTitle = url ? title.replace(url, '').trim() : title;
      
      if (cleanTitle) {
        recentNews.push({
          title: cleanTitle,
          date,
          url
        });
      }
    }
  }
  
  // If still no news, check if content mentions any news with dates
  if (recentNews.length === 0) {
    const dateNewsRegex = /(?:\b(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}\s+de\s+[a-zç]+(?:\s+de\s+\d{2,4})?))[^\n.]*?([^.\n]{10,100})/g;
    let dateMatch;
    
    while ((dateMatch = dateNewsRegex.exec(content)) !== null && recentNews.length < 3) {
      const date = dateMatch[1];
      const title = dateMatch[2].trim();
      
      if (title) {
        recentNews.push({
          title,
          date
        });
      }
    }
  }
  
  // Still no news, add generic placeholders
  if (recentNews.length === 0) {
    recentNews.push({
      title: `Veja as últimas notícias sobre ${companyName}`,
      url: `https://www.google.com/search?q=${encodeURIComponent(companyName)}+notícias&tbm=nws`
    });
  }
  
  return recentNews.slice(0, 3); // Limit to 3 news items
};
