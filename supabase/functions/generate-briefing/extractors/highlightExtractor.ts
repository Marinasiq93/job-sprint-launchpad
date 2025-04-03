
// Extract highlights from content
export const extractHighlights = (content: string): string[] => {
  let highlights: string[] = [];
  
  // Look for bullet points or numbered lists
  const bulletRegex = /[•\-*]\s+([^\n]+)/g;
  const numberedRegex = /\d+\.\s+([^\n]+)/g;
  
  // Try to find sections that typically contain highlights
  const valuesSectionRegex = /(?:valores|princípios|cultura|values|principles)(?:[:\n]+)([\s\S]*?)(?:\n\n|\n##|\n\d\.|\n$)/i;
  const highlightSectionRegex = /(?:principais pontos|destaques|highlights)(?:[:\n]+)([\s\S]*?)(?:\n\n|\n##|\n\d\.|\n$)/i;
  
  // First try to find a dedicated values section
  const valuesSection = content.match(valuesSectionRegex);
  if (valuesSection && valuesSection[1]) {
    const sectionContent = valuesSection[1];
    
    let bulletMatch;
    while ((bulletMatch = bulletRegex.exec(sectionContent)) !== null) {
      if (bulletMatch[1].trim().length > 0) {
        highlights.push(bulletMatch[1].trim());
      }
    }
  }
  
  // Then try to find a dedicated highlights section if values not found
  if (highlights.length === 0) {
    const highlightSection = content.match(highlightSectionRegex);
    if (highlightSection && highlightSection[1]) {
      const sectionContent = highlightSection[1];
      
      let bulletMatch;
      while ((bulletMatch = bulletRegex.exec(sectionContent)) !== null) {
        if (bulletMatch[1].trim().length > 0) {
          highlights.push(bulletMatch[1].trim());
        }
      }
    }
  }
  
  // If still no highlights, look for bullet points throughout the content
  if (highlights.length === 0) {
    let bulletMatch;
    while ((bulletMatch = bulletRegex.exec(content)) !== null) {
      if (bulletMatch[1].trim().length > 0 && 
          !highlights.some(h => h.toLowerCase().includes(bulletMatch[1].toLowerCase().substring(0, 20)))) {
        highlights.push(bulletMatch[1].trim());
      }
    }
  }
  
  // Extract any quoted text as potential highlights if we still don't have enough
  if (highlights.length < 3) {
    const quoteRegex = /"([^"]+)"|"([^"]+)"|'([^']+)'/g;
    let quoteMatch;
    while ((quoteMatch = quoteRegex.exec(content)) !== null && highlights.length < 5) {
      const quote = quoteMatch[1] || quoteMatch[2] || quoteMatch[3];
      if (quote && quote.length > 10 && quote.length < 150 && 
          !highlights.some(h => h.includes(quote.substring(0, 20)))) {
        highlights.push(`"${quote}"`);
      }
    }
  }
  
  // If still not enough highlights, extract key sentences from paragraphs
  if (highlights.length < 3) {
    const paragraphs = content.split('\n\n').filter(p => p.length > 0);
    // Skip first and last paragraphs (likely overview and conclusion)
    if (paragraphs.length > 3) {
      const midParagraphs = paragraphs.slice(1, -1);
      for (const paragraph of midParagraphs) {
        const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [];
        if (sentences.length > 0) {
          const keyPoint = sentences[0].trim();
          if (keyPoint.length > 20 && keyPoint.length < 150 && 
              !highlights.some(h => h.toLowerCase().includes(keyPoint.toLowerCase().substring(0, 20)))) {
            highlights.push(keyPoint);
            if (highlights.length >= 5) break;
          }
        }
      }
    }
  }
  
  // Remove duplicative content (check for significant overlaps)
  const uniqueHighlights = [];
  for (const highlight of highlights) {
    const isDuplicate = uniqueHighlights.some(existingHighlight => {
      // Check if there's substantial text overlap
      const shortestLength = Math.min(highlight.length, existingHighlight.length);
      const comparisonLength = Math.floor(shortestLength * 0.7); // 70% overlap threshold
      return highlight.toLowerCase().includes(existingHighlight.toLowerCase().substring(0, comparisonLength)) ||
             existingHighlight.toLowerCase().includes(highlight.toLowerCase().substring(0, comparisonLength));
    });
    
    if (!isDuplicate) {
      uniqueHighlights.push(highlight);
    }
  }
  
  // Limit to 5 highlights and return
  return uniqueHighlights.slice(0, 5);
};
