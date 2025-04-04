
// Extract news items from content
export const extractRecentNews = (content: string, companyName: string): Array<{title: string, date?: string, url?: string}> => {
  const recentNews: Array<{title: string, date?: string, url?: string}> = [];
  const urlRegex = /(https?:\/\/[^\s\)\"\'\]]+)/g;
  
  // Look for the NOTÍCIAS RECENTES section
  const newsSectionRegex = /(?:##\s+)?(?:NOTÍCIAS RECENTES|RECENT NEWS|NOTÍCIAS|NEWS):?\s*([\s\S]*?)(?:\n\n|\n##|\n?Citations:|\n?$)/i;
  const newsSection = content.match(newsSectionRegex);
  
  if (newsSection && newsSection[1]) {
    // Look for the numbered news items in format: 1. [DATE] - TITLE - SOURCE: URL
    const newsItemRegex = /(\d+)\.\s+\[?(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}\s+de\s+[a-zç]+(?:\s+de\s+\d{2,4})?)\]?\s*[-–]\s*([^-\n]+)(?:[-–]\s*(?:[Ff]onte:?\s*)?(.*?))?(?:\n|$)/g;
    let match;
    
    while ((match = newsItemRegex.exec(newsSection[1])) !== null) {
      const originalIndex = parseInt(match[1]);
      const date = match[2]?.trim();
      const title = match[3]?.trim();
      const source = match[4]?.trim();
      
      // Extract URL if it exists in the source
      const urlMatch = source ? source.match(urlRegex) : null;
      const url = urlMatch ? urlMatch[0] : undefined;
      
      if (title && title.length > 0) {
        recentNews.push({
          title,
          date,
          url,
          originalIndex // Preserve the original index if needed
        });
      }
      
      if (recentNews.length >= 3) break;
    }
  }
  
  // If no news items found with the above format, try an alternative format
  if (recentNews.length === 0) {
    const alternativeNewsRegex = /(?:^|\n)(\d+)\.\s+(?:\*\*)?(\[?(?:\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}\s+de\s+[a-zç]+(?:\s+de\s+\d{2,4})?)\]?)\s*[-–]\s*([^\n]*?)(?:\s*[-–]\s*(.*?))?(?:\n|$)/g;
    let match;
    
    while ((match = alternativeNewsRegex.exec(content)) !== null) {
      const date = match[2]?.trim();
      const title = match[3]?.trim();
      const source = match[4]?.trim();
      
      // Extract URL if it exists in the source
      const urlMatch = source ? source.match(urlRegex) : null;
      const url = urlMatch ? urlMatch[0] : undefined;
      
      if (title && title.length > 0) {
        recentNews.push({
          title,
          date,
          url
        });
      }
      
      if (recentNews.length >= 3) break;
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
