
/**
 * Clean up extracted text for better readability
 */
export const cleanExtractedText = (text: string): string => {
  return text
    .replace(/\s+/g, " ")                    // Normalize whitespace
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "")   // Keep only printable characters
    .replace(/\\(\d{3}|n|r|t|b|f|\\|\(|\))/g, " ") // Replace escape sequences
    .replace(/\s+/g, " ")                    // Normalize whitespace again
    .trim();
};
