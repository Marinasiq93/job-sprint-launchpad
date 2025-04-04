
import { getDomainName } from "../utils/textUtils.ts";

// Extract sources from the content
export const extractSources = (content: string): Array<{ title: string; url: string; }> => {
  if (!content) return [];
  
  // Try to find a sources/references section
  const sourcesMatch = content.match(/(?:^|\n)(?:Sources|Fontes|References|Referências|Fonte)(?::|)\s*([\s\S]*)$/i);
  
  if (sourcesMatch) {
    // Extract the sources section
    const sourcesSection = sourcesMatch[1].trim();
    
    // Match numbered sources (1. Source title - http://example.com)
    // or bulleted sources (- Source title - http://example.com)
    const sources: Array<{ title: string; url: string; }> = [];
    
    // First pattern: numbered sources with titles and URLs
    const numberedSourceRegex = /(?:^|\n)(?:\d+\.|\d+\)|\d+\s+[-–]|\[\d+\])\s+(.+?)(?:[-–—]|\s+[-–])\s+(https?:\/\/[^\s]+)/g;
    let match;
    
    while ((match = numberedSourceRegex.exec(sourcesSection)) !== null) {
      sources.push({
        title: match[1].trim(),
        url: match[2].trim()
      });
    }
    
    // If no sources found with first pattern, try second pattern: just URLs with optional numbers
    if (sources.length === 0) {
      const urlRegex = /(?:^|\n)(?:\d+\.|\d+\)|[-•*]|\[\d+\])?\s*(https?:\/\/[^\s]+)/g;
      while ((match = urlRegex.exec(sourcesSection)) !== null) {
        const url = match[1].trim();
        sources.push({
          title: `Source: ${getDomainName(url)}`,
          url: url
        });
      }
    }
    
    // If still no sources, try third pattern: lines with URLs anywhere in them
    if (sources.length === 0) {
      const linesWithUrls = sourcesSection.split('\n')
        .filter(line => line.includes('http'));
      
      linesWithUrls.forEach(line => {
        const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) {
          const url = urlMatch[1].trim();
          const title = line.replace(url, '').replace(/[-–—:]/, '').trim();
          
          sources.push({
            title: title || `Source: ${getDomainName(url)}`,
            url: url
          });
        }
      });
    }
    
    return sources;
  }
  
  // If no sources section found, try to extract URLs from the entire content
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = [];
  let urlMatch;
  
  while ((urlMatch = urlRegex.exec(content)) !== null) {
    urls.push({
      title: `Source: ${getDomainName(urlMatch[1])}`,
      url: urlMatch[1].trim()
    });
  }
  
  return urls;
};

// Extract domain name from URL - moved from utils/textUtils.ts for direct use
export const getDomainName = (url: string): string => {
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
