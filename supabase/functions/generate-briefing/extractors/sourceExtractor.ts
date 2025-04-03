
// Extract sources from content
export const extractSources = (content: string): Array<{title: string, url: string}> => {
  const sources: Array<{title: string, url: string}> = [];
  const urlRegex = /(https?:\/\/[^\s\)\"\'\]]+)/g;
  
  // Look for the Citations section
  const citationsSectionRegex = /Citations:?\s*([\s\S]*?)(?:\n\n|\n?$)/i;
  const citationsSection = content.match(citationsSectionRegex);
  
  if (citationsSection && citationsSection[1]) {
    // Extract sources in the format [n] URL
    const sourceRegex = /\[(\d+)\]\s+(https?:\/\/[^\s\n]+)/g;
    let match;
    
    while ((match = sourceRegex.exec(citationsSection[1])) !== null) {
      const url = match[2]?.trim();
      if (url) {
        try {
          // Try to extract domain name for title
          const urlObj = new URL(url);
          const domain = urlObj.hostname.replace(/^www\./, '');
          
          sources.push({
            title: domain,
            url
          });
        } catch (e) {
          // If URL parsing fails, still include the source with the URL as title
          sources.push({
            title: url,
            url
          });
        }
      }
    }
  }
  
  // If no sources found in Citations section, look for URLs throughout the content
  if (sources.length === 0) {
    // Check for URLs in the content
    let urls: string[] = [];
    let match;
    
    while ((match = urlRegex.exec(content)) !== null) {
      urls.push(match[0]);
    }
    
    // Deduplicate URLs
    urls = [...new Set(urls)];
    
    // Add unique URLs as sources
    urls.forEach(url => {
      try {
        const urlObj = new URL(url);
        const domain = urlObj.hostname.replace(/^www\./, '');
        
        sources.push({
          title: domain,
          url
        });
      } catch (e) {
        // Skip invalid URLs
        console.log("Invalid URL found:", url);
      }
    });
  }
  
  // If still no sources, add a search link
  if (sources.length === 0) {
    sources.push({
      title: "Pesquisar mais informações",
      url: "https://www.google.com"
    });
  }
  
  return sources.slice(0, 10); // Limit to 10 sources
};
