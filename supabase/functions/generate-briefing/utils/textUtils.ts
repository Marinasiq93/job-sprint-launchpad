
// Helper function to get domain name from URL
export const getDomainName = (url: string): string => {
  try {
    return url.split("//")[1]?.split("/")[0] || url;
  } catch {
    return url;
  }
};

// Clean text by removing duplicate paragraphs and excessive whitespace
export const cleanText = (text: string): string => {
  if (!text) return '';
  
  // Split into paragraphs
  const paragraphs = text.split('\n\n').map(p => p.trim()).filter(p => p.length > 0);
  
  // Remove duplicate paragraphs
  const uniqueParagraphs: string[] = [];
  for (const paragraph of paragraphs) {
    const isDuplicate = uniqueParagraphs.some(existing => {
      // Consider paragraphs duplicates if they share significant content
      const shortestLength = Math.min(paragraph.length, existing.length);
      const similarityThreshold = Math.floor(shortestLength * 0.7); // 70% similarity threshold
      
      return (
        paragraph.toLowerCase().includes(existing.toLowerCase().substring(0, similarityThreshold)) ||
        existing.toLowerCase().includes(paragraph.toLowerCase().substring(0, similarityThreshold))
      );
    });
    
    if (!isDuplicate) {
      uniqueParagraphs.push(paragraph);
    }
  }
  
  // Rejoin paragraphs with double newlines
  return uniqueParagraphs.join('\n\n');
};
