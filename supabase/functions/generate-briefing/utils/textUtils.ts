
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
  cleaned = cleaned.replace(/^\s*[-•*]\s+/gm, '');
  cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, '');
  
  // Remove extra spaces or tabs at beginning of line
  cleaned = cleaned.replace(/^\s+/gm, '');
  
  // Remove trailing spaces
  cleaned = cleaned.trim();
  
  return cleaned;
};

// Helper function to get domain name from URL
export const getDomainName = (url: string): string => {
  try {
    return url.split("//")[1]?.split("/")[0] || url;
  } catch {
    return url;
  }
};
