
import { getDomainName } from "../utils/textUtils.ts";

// Extract sources from the content
export const extractSources = (content: string): Array<{ title: string; url: string; }> => {
  if (!content) return [];
  
  // Try to find a sources/references section
  const sourcesMatch = content.match(/(?:^|\n)(?:Sources|Fontes|References|Referências|Fonte)(?::|)\s*([\s\S]*)$/i);
  
  if (sourcesMatch) {
    // Extract the sources section
    const sourcesSection = sourcesMatch[1].trim();
    
    // Initialize sources array
    const sources: Array<{ title: string; url: string; }> = [];
    
    // First pattern: numbered sources with titles and URLs
    // Match patterns like [1] Title: https://example.com or 1. Title - https://example.com
    const numberedSourceRegex = /(?:^|\n)(?:\[\d+\]|\d+\.|\d+\))\s+([^:]+(?::|-))\s*(https?:\/\/[^\s]+)/g;
    let match;
    
    while ((match = numberedSourceRegex.exec(sourcesSection)) !== null) {
      // Clean the URL by removing trailing parentheses or invalid characters
      let url = match[2].trim();
      // Remove trailing period, comma, parenthesis or other punctuation
      url = url.replace(/[.,;:)\]}]$/, '');
      
      sources.push({
        title: match[1].trim().replace(/[:|-]$/, ''),
        url: url
      });
    }
    
    // Second pattern: just URLs with optional numbers or bullets
    if (sources.length === 0) {
      const urlOnlyRegex = /(?:^|\n)(?:\[\d+\]|\d+\.|\d+\)|[-•*]|\s+)\s*(https?:\/\/[^\s)]+)(?:\s+-\s+([^\n]+))?/g;
      while ((match = urlOnlyRegex.exec(sourcesSection)) !== null) {
        let url = match[1].trim();
        // Clean URL by removing trailing punctuation
        url = url.replace(/[.,;:)\]}]$/, '');
        
        const title = match[2] ? match[2].trim() : `Source: ${getDomainName(url)}`;
        sources.push({ title, url });
      }
    }
    
    // Third pattern: Look for lines with both text and URLs in them
    if (sources.length === 0) {
      const linesWithUrls = sourcesSection
        .split('\n')
        .filter(line => line.includes('http') && line.trim().length > 0);
      
      linesWithUrls.forEach(line => {
        const urlMatch = line.match(/(https?:\/\/[^\s)]+)/);
        if (urlMatch) {
          let url = urlMatch[1].trim();
          // Clean URL by removing trailing punctuation
          url = url.replace(/[.,;:)\]}]$/, '');
          
          // Get everything before the URL, clean it up
          let title = line.substring(0, line.indexOf(url)).trim();
          // Remove numbering and special characters
          title = title.replace(/^(\[\d+\]|\d+\.|\d+\)|[-•*]|:|-|\s+)+/, '').trim();
          
          if (!title) {
            title = `Source: ${getDomainName(url)}`;
          }
          
          sources.push({ title, url });
        }
      });
    }
    
    // Validate URLs and ensure they are properly formed
    const validatedSources = sources.map(source => {
      let { url, title } = source;
      
      // Fix common URL issues like trailing parentheses or closing brackets
      url = url.replace(/[)\]}]$/, '');
      
      // Ensure URL doesn't end with unexpected characters
      while (/[.,;:)]$/.test(url)) {
        url = url.slice(0, -1);
      }
      
      // Handle special case for EBANX URLs with extra slashes or parentheses
      if (url.includes('ebanx.com')) {
        url = url.replace(/\/{2,}$/, '/');
        url = url.replace(/\)\/$/g, '/');
      }
      
      return { title, url };
    });
    
    return validatedSources;
  }
  
  // If no sources section found, extract URLs from the entire content
  return extractAllUrls(content);
};

// Helper function to extract all URLs from content
const extractAllUrls = (content: string): Array<{ title: string; url: string; }> => {
  const urlRegex = /(https?:\/\/[^\s)]+)/g;
  const sources = [];
  let urlMatch;
  
  while ((urlMatch = urlRegex.exec(content)) !== null) {
    let url = urlMatch[1].trim();
    
    // Clean URL by removing trailing punctuation
    url = url.replace(/[.,;:)\]}]$/, '');
    
    sources.push({
      title: `Source: ${getDomainName(url)}`,
      url: url
    });
  }
  
  return sources;
};
