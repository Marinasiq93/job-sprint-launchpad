
/**
 * Clean up extracted text for better readability
 */
export const cleanExtractedText = (text: string): string => {
  return text
    .replace(/\\(\d{3}|n|r|t|b|f|\\|\(|\))/g, " ") // Replace escape sequences
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "")   // Keep only printable characters
    .replace(/\s+/g, " ")                    // Normalize whitespace
    .replace(/\( \)/g, " ")                  // Remove empty parentheses
    .replace(/\[\]/g, " ")                   // Remove empty brackets
    .replace(/\s+/g, " ")                    // Normalize whitespace again
    .trim();
};

/**
 * Post-process extracted text to improve quality
 */
export const postProcessText = (text: string): string => {
  if (!text) return "";
  
  return text
    // Fix common OCR/extraction issues
    .replace(/([a-z])([A-Z])/g, '$1 $2')     // Add space between lowercase and uppercase
    .replace(/([A-Za-z])(\d)/g, '$1 $2')     // Add space between letter and number
    .replace(/(\d)([A-Za-z])/g, '$1 $2')     // Add space between number and letter
    .replace(/\s{2,}/g, ' ')                 // Normalize spaces
    .replace(/\n+/g, '\n')                   // Normalize newlines
    .replace(/[•·]/g, '- ')                  // Replace bullets with dashes
    .replace(/[\u2018\u2019]/g, "'")         // Normalize quotes
    .replace(/[\u201C\u201D]/g, '"')         // Normalize double quotes
    .trim();
};
