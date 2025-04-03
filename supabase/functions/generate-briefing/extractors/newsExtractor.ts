
// Extract news items from content
export const extractRecentNews = (content: string, companyName: string): Array<{title: string, date?: string, url?: string}> => {
  const recentNews: Array<{title: string, date?: string, url?: string}> = [];
  const urlRegex = /(https?:\/\/[^\s\)\"\'\]]+)/g;
  
  // First look for the NOTÍCIAS RECENTES section
  const newsSectionRegex = /(?:NOTÍCIAS RECENTES|RECENT NEWS|NOTÍCIAS|NEWS):?\s*([\s\S]*?)(?:\n\n|\n##|\n$)/i;
  const newsSection = content.match(newsSectionRegex);
  
  if (newsSection && newsSection[1]) {
    // Process dedicated NEWS section
    const newsItems = newsSection[1].split(/\n+/).filter(line => line.trim().length > 0);
    
    for (const item of newsItems) {
      // Try to parse in format: NUMBER. [DATE] - TITLE - SOURCE: URL
      const newsItemMatch = item.match(/(?:\d+\.?\s+)?(?:\[?(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}\s+de\s+[a-zç]+(?:\s+de\s+\d{2,4})?)\]?)?\s*[-–]?\s*([^-\n]+)(?:[-–]\s*(?:[Ff]onte:?\s*)?(.+?))?$/);
      
      if (newsItemMatch) {
        const date = newsItemMatch[1] ? newsItemMatch[1].trim() : undefined;
        const title = newsItemMatch[2] ? newsItemMatch[2].trim() : "";
        const source = newsItemMatch[3] ? newsItemMatch[3].trim() : undefined;
        
        // Extract URL if it exists in the source
        const urlMatch = source ? source.match(urlRegex) : null;
        const url = urlMatch ? urlMatch[0] : undefined;
        
        if (title && title.length > 10) {
          recentNews.push({
            title,
            date,
            url
          });
        }
      }
    }
  }
  
  // Look for numbered list items with dates that might be news
  if (recentNews.length === 0) {
    const dateNewsRegex = /(\d+)\.\s+(?:\[?(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}\s+de\s+[a-zç]+(?:\s+de\s+\d{2,4})?)\]?)?\s*[-–]?\s*([^-\n]+)(?:[-–]\s*(?:[Ff]onte:?\s*)?(.+?))?(?:\n|$)/g;
    let newsMatch;
    
    while ((newsMatch = dateNewsRegex.exec(content)) !== null && recentNews.length < 3) {
      const date = newsMatch[2] ? newsMatch[2].trim() : undefined;
      const title = newsMatch[3] ? newsMatch[3].trim() : "";
      const source = newsMatch[4] ? newsMatch[4].trim() : undefined;
      
      // Extract URL if it exists in the source or title
      const sourceUrlMatch = source ? source.match(urlRegex) : null;
      const titleUrlMatch = title ? title.match(urlRegex) : null;
      const url = sourceUrlMatch ? sourceUrlMatch[0] : (titleUrlMatch ? titleUrlMatch[0] : undefined);
      
      // Clean title to remove any URLs
      const cleanTitle = title.replace(urlRegex, '').trim();
      
      if (cleanTitle && cleanTitle.length > 10 && date) {
        recentNews.push({
          title: cleanTitle,
          date,
          url
        });
      }
    }
  }
  
  // If we still have no news items, scan the whole content for any sentences with dates
  if (recentNews.length === 0) {
    const fullContent = content.replace(/\n+/g, ' ');
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{2,4})/,  // DD/MM/YYYY
      /(\d{1,2}\s+de\s+[a-zç]+(?:\s+de\s+\d{2,4})?)/  // DD de Month [de YYYY]
    ];
    
    for (const datePattern of datePatterns) {
      const dateRegex = new RegExp(`${datePattern.source}[\\s\\-:]*([^.\\n]{10,100})`, 'g');
      let dateMatch;
      
      while ((dateMatch = dateRegex.exec(fullContent)) !== null && recentNews.length < 3) {
        const date = dateMatch[1].trim();
        const title = dateMatch[2].trim();
        
        // Look for a URL near this date/title
        const contextRegex = new RegExp(`.{0,100}${dateMatch[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.{0,100}`, 'g');
        const contextMatch = contextRegex.exec(fullContent);
        let url;
        
        if (contextMatch) {
          const urlMatch = contextMatch[0].match(urlRegex);
          url = urlMatch ? urlMatch[0] : undefined;
        }
        
        if (title && !title.match(/^https?:\/\//) && 
            !recentNews.some(news => news.title.includes(title.substring(0, 20)))) {
          recentNews.push({
            title,
            date,
            url
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
