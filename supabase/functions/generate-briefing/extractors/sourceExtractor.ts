
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
      
      // Make sure URLs don't end with a parenthesis or invalid characters
      while (/[.,;:)\]}]$/.test(url)) {
        url = url.slice(0, -1);
      }
      
      // Fix common URL format issues
      url = fixUrlFormat(url);
      
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
        
        // Make sure URLs don't end with a parenthesis or invalid characters
        while (/[.,;:)\]}]$/.test(url)) {
          url = url.slice(0, -1);
        }
        
        // Fix common URL format issues
        url = fixUrlFormat(url);
        
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
          
          // Make sure URLs don't end with a parenthesis or invalid characters
          while (/[.,;:)\]}]$/.test(url)) {
            url = url.slice(0, -1);
          }
          
          // Fix common URL format issues
          url = fixUrlFormat(url);
          
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
    
    // Fourth pattern: Extract markdown link format [Title](URL)
    if (sources.length === 0) {
      const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      while ((match = markdownLinkRegex.exec(sourcesSection)) !== null) {
        let url = match[2].trim();
        // Fix common URL format issues
        url = fixUrlFormat(url);
        
        sources.push({
          title: match[1].trim(),
          url: url
        });
      }
    }
    
    // Return unique sources (remove duplicates based on URL)
    const uniqueSources = Array.from(
      new Map(sources.map(source => [source.url, source])).values()
    );
    
    return uniqueSources;
  }
  
  // If no sources section found, extract URLs from the entire content
  return extractAllUrls(content);
};

// Helper function to fix common URL format issues
const fixUrlFormat = (url: string): string => {
  // Remove trailing parentheses or closing brackets
  url = url.replace(/[)\]}]$/, '');
  
  // Remove trailing slashes if followed by punctuation or closing parenthesis
  url = url.replace(/\/[.,;:)]$/, '');
  
  // Fix common error with closing parenthesis in middle of URL
  url = url.replace(/\)\//, '/');
  
  // Fix common error with trailing slashes and periods
  url = url.replace(/\.\/$/, '/');
  url = url.replace(/\.$/, '');
  
  // Handle incomplete URLs or domains without http/https
  if (url.match(/^www\./)) {
    url = `https://${url}`;
  }
  
  // Fix specific error with EBANX URL format
  if (url.includes('ebanx.com')) {
    // Remove trailing parenthesis and fix double slashes
    url = url.replace(/\)$/, '');
    url = url.replace(/\/\/$/, '/');
    
    // Fix common error with trailing context in URL
    url = url.replace(/\)\/$/, '/');
    
    // Fix possible broken URL formats
    if (url.includes('ebanx.com/pt-br/valores)/')) {
      url = url.replace('ebanx.com/pt-br/valores)/', 'ebanx.com/pt-br/valores/');
    }
    
    // Ensure URL correctness for common paths
    if (url.includes('/valores') && !url.endsWith('/')) {
      url = `${url}/`;
    }
    
    // Try to fix code of conduct URL if it's malformed
    if (url.includes('code-of-conduct') && url.endsWith(')')) {
      url = url.replace(/\)$/, '');
    }
  }
  
  return url;
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
    
    // Fix common URL format issues
    url = fixUrlFormat(url);
    
    sources.push({
      title: `Source: ${getDomainName(url)}`,
      url: url
    });
  }
  
  // Return unique sources (remove duplicates based on URL)
  return Array.from(
    new Map(sources.map(source => [source.url, source])).values()
  );
};
