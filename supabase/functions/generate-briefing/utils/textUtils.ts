
// Clean text by removing unnecessary markdown, HTML and formatting
export const cleanText = (text: string): string => {
  if (!text) return "";
  
  // Remove markdown headings
  let cleaned = text.replace(/^#+\s+/gm, '');
  
  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  
  // Remove extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  // Remove markdown formatting
  cleaned = cleaned.replace(/\*\*|\*|__|\[\d+\]/g, '');
  
  // Remove list markers
  cleaned = cleaned.replace(/^\s*[-–•]\s+/gm, '');
  cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, '');
  
  // Remove extra spaces or tabs at beginning of line
  cleaned = cleaned.replace(/^\s+/gm, '');
  
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
  
  // Check for capitalized headers
  const hasCapitalizedHeaders = text.match(/^[A-Z][A-Z\s]+[A-Z]:?$/gm);
  if (hasCapitalizedHeaders && hasCapitalizedHeaders.length > 2) return "capitalized";
  
  // Check for numbered lists
  const hasNumberedLists = text.match(/^\d+\.\s+.+$/gm);
  if (hasNumberedLists && hasNumberedLists.length > 4) return "numbered";
  
  // Check for bullet lists
  const hasBulletLists = text.match(/^[-–•]\s+.+$/gm);
  if (hasBulletLists && hasBulletLists.length > 4) return "bullets";
  
  return "paragraph"; // Default to paragraph mode
};
