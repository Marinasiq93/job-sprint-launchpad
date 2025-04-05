import { cleanExtractedText } from './textCleaner';

/**
 * Extract text between BT and ET markers in PDF content
 */
export const extractTextBetweenBTET = (binary: string): string => {
  const text = [];
  let pos = 0;
  let inText = false;
  let currentWord = '';
  
  while (pos < binary.length - 1) {
    // Beginning of text object
    if (binary.substring(pos, pos + 2) === "BT") {
      inText = true;
      pos += 2;
      continue;
    }
    
    // End of text object
    if (binary.substring(pos, pos + 2) === "ET") {
      inText = false;
      if (currentWord.trim()) {
        text.push(currentWord.trim());
        currentWord = '';
      }
      text.push(" ");
      pos += 2;
      continue;
    }
    
    // Text showing operators with expanded detection
    if (inText && (binary.substring(pos, pos + 2) === "Tj" || 
                   binary.substring(pos, pos + 2) === "TJ" ||
                   binary.substring(pos, pos + 2) === "Tm" ||
                   binary.substring(pos, pos + 2) === "Td" ||
                   binary.substring(pos, pos + 2) === "TD" ||
                   binary.substring(pos, pos + 3) === "'T*")) {
      if (currentWord.trim()) {
        text.push(currentWord.trim());
        currentWord = '';
      }
      text.push(" ");
      pos += 2;
      continue;
    }
    
    // Capture text content with improved range
    if (inText && ((binary.charCodeAt(pos) >= 32 && binary.charCodeAt(pos) <= 126) ||
                   (binary.charCodeAt(pos) >= 128 && binary.charCodeAt(pos) <= 255))) {
      currentWord += binary.charAt(pos);
    } else if (inText && (binary.charAt(pos) === '\n' || binary.charAt(pos) === '\r')) {
      if (currentWord.trim()) {
        text.push(currentWord.trim());
        currentWord = '';
      }
      text.push(" ");
    }
    
    pos += 1;
  }
  
  if (currentWord.trim()) {
    text.push(currentWord.trim());
  }
  
  return text.join(" ");
};

/**
 * Extract text within parentheses (common in PDF text objects)
 */
export const extractTextFromParentheses = (binary: string): string => {
  const extractedTexts = [];
  const regex = /\(([^\)]+)\)/g;
  let match;
  
  while ((match = regex.exec(binary)) !== null) {
    if (match[1] && match[1].length > 1) {
      // Filter out control characters and keep only printable text
      const cleanText = match[1].replace(/[^\x20-\x7E\xA0-\xFF]/g, "");
      if (cleanText && cleanText.length > 1) {
        extractedTexts.push(cleanText);
      }
    }
  }
  
  return extractedTexts.join(" ");
};

/**
 * Extract text from stream objects in PDF
 */
export const extractTextFromStreams = (binary: string): string => {
  const streamTexts = [];
  const streamRegex = /stream([\s\S]*?)endstream/g;
  let streamMatch;
  
  while ((streamMatch = streamRegex.exec(binary)) !== null) {
    if (streamMatch[1]) {
      // Extract readable text from streams
      const streamContent = streamMatch[1]
        .replace(/[^\x20-\x7E\xA0-\xFF\n]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
        
      if (streamContent && streamContent.length > 10 && 
          streamContent.split(" ").length > 3) {
        streamTexts.push(streamContent);
      }
    }
  }
  
  return streamTexts.join(" ");
};
