
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
      sources.push({
        title: match[1].trim().replace(/[:|-]$/, ''),
        url: match[2].trim()
      });
    }
    
    // Second pattern: just URLs with optional numbers or bullets
    if (sources.length === 0) {
      const urlOnlyRegex = /(?:^|\n)(?:\[\d+\]|\d+\.|\d+\)|[-•*]|\s+)\s*(https?:\/\/[^\s]+)(?:\s+-\s+([^\n]+))?/g;
      while ((match = urlOnlyRegex.exec(sourcesSection)) !== null) {
        const url = match[1].trim();
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
        const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) {
          const url = urlMatch[1].trim();
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
    
    // If we still have no sources, extract URLs from the entire content
    if (sources.length === 0) {
      return extractAllUrls(content);
    }
    
    return sources;
  }
  
  // If no sources section found, extract URLs from the entire content
  return extractAllUrls(content);
};

// Helper function to extract all URLs from content
const extractAllUrls = (content: string): Array<{ title: string; url: string; }> => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const sources = [];
  let urlMatch;
  
  while ((urlMatch = urlRegex.exec(content)) !== null) {
    sources.push({
      title: `Source: ${getDomainName(urlMatch[1])}`,
      url: urlMatch[1].trim()
    });
  }
  
  return sources;
};
