
// Clean text by removing unnecessary markdown, HTML and formatting
export const cleanText = (text: string): string => {
  if (!text) return "";
  
  // Remove HTML tags
  let cleaned = text.replace(/<[^>]*>/g, '');
  
  // Remove extra whitespace but preserve paragraph breaks
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  // Remove markdown formatting symbols but preserve structure
  cleaned = cleaned.replace(/\*\*|\*|__|\[\d+\]/g, '');
  
  // Remove trailing spaces
  cleaned = cleaned.trim();
  
  return cleaned;
};

// Detect the structure type of a text to apply appropriate formatting
export const detectTextStructure = (text: string): string => {
  if (!text) return "unknown";
  
  // Check for markdown headers
  const hasMarkdownHeaders = text.match(/^#+\s+.+$/gm);
  if (hasMarkdownHeaders && hasMarkdownHeaders.length > 2) return "markdown";
  
  // Check for capitalized headers - must be full line in uppercase with at least 3 characters
  const hasCapitalizedHeaders = text.match(/^[A-Z][A-Z\s]{2,}[A-Z](:|\s*$)/gm);
  if (hasCapitalizedHeaders && hasCapitalizedHeaders.length > 2) return "capitalized";
  
  // Check for numbered lists - improved to catch different numbering styles
  const hasNumberedLists = text.match(/^\d+[.):]\s+.+$/gm);
  if (hasNumberedLists && hasNumberedLists.length > 2) return "numbered";
  
  // Check for bullet lists - improved to catch different bullet styles
  const hasBulletLists = text.match(/^[-–•]\s+.+$/gm);
  if (hasBulletLists && hasBulletLists.length > 2) return "bullets";
  
  return "paragraph"; // Default to paragraph mode
};

// Extract domain name from URL
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

// Preserve original markdown headings and structure
export const preserveMarkdownStructure = (text: string): string => {
  if (!text) return "";
  
  // Replace multiple consecutive newlines with exactly two newlines
  let preserved = text.replace(/\n{3,}/g, '\n\n');
  
  // Ensure headers have proper spacing before them
  preserved = preserved.replace(/([^\n])\n(#+\s+)/g, '$1\n\n$2');
  
  // Ensure lists have consistent formatting
  preserved = preserved.replace(/([^\n])\n([-*•]\s+)/g, '$1\n\n$2');
  preserved = preserved.replace(/([^\n])\n(\d+[.):]\s+)/g, '$1\n\n$2');
  
  // Ensure consistent spacing after headers
  preserved = preserved.replace(/(#+\s+[^\n]+)\n([^\n#])/g, '$1\n\n$2');
  
  return preserved;
};

// Remove duplicate section headers that might appear in the response
export const removeDuplicateHeaders = (text: string): string => {
  if (!text) return "";
  
  // Split the text into lines
  const lines = text.split('\n');
  const processedLines = [];
  const seenHeaders = new Set();
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if it's a header (markdown format)
    const isMarkdownHeader = line.match(/^#+\s+(.+)$/);
    
    // Check if it's a header (all caps format) - improved pattern matching
    const isCapitalizedHeader = line.match(/^([A-Z][A-Z\s]{2,}[A-Z])(:|\s*$)/);
    
    if (isMarkdownHeader) {
      const headerText = isMarkdownHeader[1].toLowerCase();
      if (seenHeaders.has(headerText)) {
        continue; // Skip this duplicate header
      }
      seenHeaders.add(headerText);
    } else if (isCapitalizedHeader) {
      const headerText = isCapitalizedHeader[1].toLowerCase();
      if (seenHeaders.has(headerText)) {
        continue; // Skip this duplicate header
      }
      seenHeaders.add(headerText);
    }
    
    processedLines.push(lines[i]);
  }
  
  return processedLines.join('\n');
};
