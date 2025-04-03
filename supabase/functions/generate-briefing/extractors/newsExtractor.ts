
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
