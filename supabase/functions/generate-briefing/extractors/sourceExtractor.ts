
// Helper function to get domain name from URL
const getDomainName = (url: string): string => {
  try {
    return url.split("//")[1]?.split("/")[0] || url;
  } catch {
    return url;
  }
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
