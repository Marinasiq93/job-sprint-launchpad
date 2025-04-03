
// Utility functions for extracting different content types from API responses

// Extract highlights from content
export const extractHighlights = (content: string): string[] => {
  let highlights: string[] = [];
  
  // Look for bullet points or numbered lists
  const bulletRegex = /[•\-*]\s+([^\n]+)/g;
  const numberedRegex = /\d+\.\s+([^\n]+)/g;
  let bulletMatch;
  let numberedMatch;
  
  while ((bulletMatch = bulletRegex.exec(content)) !== null) {
    highlights.push(bulletMatch[1]);
  }
  
  while ((numberedMatch = numberedRegex.exec(content)) !== null) {
    highlights.push(numberedMatch[1]);
  }
  
  // If no bullet points, extract some sentences from the middle of the content
  if (highlights.length === 0) {
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
    // Skip first few and last few sentences (likely intro and conclusion)
    if (sentences.length > 6) {
      highlights = sentences.slice(2, 7).map(s => s.trim());
    } else if (sentences.length > 0) {
      highlights = sentences.slice(0, Math.min(5, sentences.length)).map(s => s.trim());
    }
  }
  
  // Limit to 5 highlights
  highlights = highlights.slice(0, 5);
  
  return highlights;
};

// Extract sources from content
export const extractSources = (content: string, companyName: string): Array<{title: string, url: string}> => {
  const sources: Array<{title: string, url: string}> = [];
  const urlRegex = /(https?:\/\/[^\s\)\"\']+)/g;
  const urls = [...new Set(content.match(urlRegex) || [])]; // Use Set to remove duplicates
  
  // Look for explicit mentions of sources
  const sourceRegex = /(?:fonte|source|referência|referencia|link)s?:\s*(https?:\/\/[^\s\)\"\']+)/gi;
  let sourceMatch;
  
  while ((sourceMatch = sourceRegex.exec(content)) !== null) {
    const url = sourceMatch[1];
    if (url && !sources.some(s => s.url === url)) {
      sources.push({
        title: `Fonte: ${url.split("//")[1]?.split("/")[0] || url}`,
        url: url
      });
    }
  }
  
  // If no explicit sources found, use all URLs in the content
  if (sources.length === 0) {
    urls.slice(0, 5).forEach(url => {
      if (!sources.some(s => s.url === url)) {
        // Try to extract domain name for better readability
        const domain = url.split("//")[1]?.split("/")[0] || url;
        let title = `${domain}`;
        
        // Try to identify common domains
        if (domain.includes("linkedin.com")) {
          title = `LinkedIn: ${companyName}`;
        } else if (domain.includes("glassdoor")) {
          title = `Glassdoor: Avaliações de ${companyName}`;
        } else if (domain.includes(companyName.toLowerCase().replace(/\s+/g, ''))) {
          title = `Site oficial: ${domain}`;
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

// Extract news items from content
export const extractRecentNews = (content: string, companyName: string): Array<{title: string, date?: string, url?: string}> => {
  const recentNews: Array<{title: string, date?: string, url?: string}> = [];
  const urlRegex = /(https?:\/\/[^\s\)\"\']+)/g;
  
  // Look for news sections
  const newsRegex = /(?:notícias|novidades|recentes|últimas).*?\n(.*?)(?:\n\n|\n###)/gis;
  const newsMatch = content.match(newsRegex);
  
  if (newsMatch) {
    // Extract individual news items
    const newsItems = newsMatch[0].split('\n').filter(line => 
      line.trim().length > 0 && 
      !line.match(/notícias|novidades|recentes|últimas/i)
    );
    
    // Process each news item (up to 3)
    for (let i = 0; i < Math.min(3, newsItems.length); i++) {
      const item = newsItems[i];
      
      // Try to extract date if present
      const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{2,4})|(\d{1,2}\s+de\s+[a-zç]+\s+de\s+\d{2,4})/i;
      const dateMatch = item.match(dateRegex);
      
      // Try to extract URL if present
      const newsUrl = item.match(urlRegex)?.[0];
      
      recentNews.push({
        title: item.replace(dateRegex, '').replace(newsUrl || '', '').trim(),
        date: dateMatch ? dateMatch[0] : undefined,
        url: newsUrl
      });
    }
  }
  
  // If no news found via regex, create generic ones
  if (recentNews.length === 0) {
    // Check if content mentions any news or events
    const contentLower = content.toLowerCase();
    const newsKeywords = ['lançou', 'anunciou', 'publicou', 'divulgou', 'recentemente', 'este ano', 'este mês'];
    
    if (newsKeywords.some(keyword => contentLower.includes(keyword))) {
      // Extract sentences that might be news
      const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
      for (const sentence of sentences) {
        if (newsKeywords.some(keyword => sentence.toLowerCase().includes(keyword)) && recentNews.length < 3) {
          // Try to extract URL if present
          const newsUrl = sentence.match(urlRegex)?.[0];
          
          recentNews.push({
            title: sentence.replace(newsUrl || '', '').trim(),
            date: undefined,
            url: newsUrl
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
  }
  
  return recentNews.slice(0, 3); // Limit to 3 news items
};
