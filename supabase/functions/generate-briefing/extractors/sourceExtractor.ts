
// Extract sources from content
export const extractSources = (content: string): Array<{title: string, url: string}> => {
  const sources: Array<{title: string, url: string}> = [];
  const urlRegex = /(https?:\/\/[^\s\)\"\'\]]+)/g;
  
  // Look for the "Fontes Utilizadas" or "Citations" sections
  const sourcesSectionRegex = /(?:Fontes Utilizadas|Fontes|Citations|References|Referências):?\s*([\s\S]*?)(?:\n\n|\n?$)/i;
  const sourcesSection = content.match(sourcesSectionRegex);
  
  if (sourcesSection && sourcesSection[1]) {
    // Try extracting numbered citations first (e.g., [1] http://example.com)
    const numberedSourceRegex = /(?:\[(\d+)\]|\(\d+\)|\d+[\.\)])\s+(https?:\/\/[^\s\n]+)/g;
    let match;
    
    while ((match = numberedSourceRegex.exec(sourcesSection[1])) !== null) {
      const url = match[2]?.trim();
      if (url) {
        try {
          // Extract domain name for title
          let domain = getDomainName(url);
          
          sources.push({
            title: domain,
            url
          });
        } catch (e) {
          // Fallback if URL parsing fails
          sources.push({
            title: url,
            url
          });
        }
      }
    }
    
    // If no numbered sources found, look for URLs on separate lines
    if (sources.length === 0) {
      const lineByLineRegex = /^(https?:\/\/[^\s\n]+)$/gm;
      while ((match = lineByLineRegex.exec(sourcesSection[1])) !== null) {
        const url = match[1]?.trim();
        if (url) {
          sources.push({
            title: getDomainName(url),
            url
          });
        }
      }
    }
    
    // If still no sources found, extract all URLs in the section
    if (sources.length === 0) {
      const generalUrlRegex = /(https?:\/\/[^\s\n]+)/g;
      while ((match = generalUrlRegex.exec(sourcesSection[1])) !== null) {
        const url = match[1]?.trim();
        if (url && !sources.some(s => s.url === url)) {
          sources.push({
            title: getDomainName(url),
            url
          });
        }
      }
    }
  }
  
  // If no sources were found in dedicated sections, look for URLs throughout the content
  if (sources.length === 0) {
    // Find all URLs in the content
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
        sources.push({
          title: getDomainName(url),
          url
        });
      } catch (e) {
        // Skip invalid URLs
        console.log("Invalid URL found:", url);
      }
    });
  }
  
  // Return deduplicated sources (by URL)
  return sources
    .filter((source, index, self) => 
      index === self.findIndex((s) => s.url === source.url))
    .slice(0, 10); // Limit to 10 sources
};

// Helper function to get domain name from URL (moved from textUtils.ts)
const getDomainName = (url: string): string => {
  try {
    // Try to create URL object
    const urlObj = new URL(url);
    // Get the hostname and remove 'www.' prefix if present
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    // If URL parsing fails, extract domain using regex
    const domainMatch = url.match(/https?:\/\/(?:www\.)?([^\/]+)/i);
    return domainMatch ? domainMatch[1] : url;
  }
};
