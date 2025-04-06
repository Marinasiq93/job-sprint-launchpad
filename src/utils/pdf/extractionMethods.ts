
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
    
    // Capture text content with improved range - only include printable ASCII characters
    if (inText && ((binary.charCodeAt(pos) >= 32 && binary.charCodeAt(pos) <= 126) ||
                   (binary.charCodeAt(pos) >= 160 && binary.charCodeAt(pos) <= 255))) {
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

/**
 * New method: Enhanced text extraction using Unicode text patterns
 */
export const extractUnicodeText = (binary: string): string => {
  // Look for common text patterns with Unicode characters
  let extracted = '';
  let textChunks: string[] = [];
  let currentChunk = '';
  let consecutivePrintable = 0;
  
  for (let i = 0; i < binary.length; i++) {
    const charCode = binary.charCodeAt(i);
    
    // Consider only printable characters including extended ASCII
    const isPrintable = (charCode >= 32 && charCode <= 126) || 
                        (charCode >= 161 && charCode <= 255);
    
    if (isPrintable) {
      currentChunk += binary.charAt(i);
      consecutivePrintable++;
    } else if (charCode === 10 || charCode === 13) { // newlines
      if (currentChunk.length > 0) {
        currentChunk += ' ';
      }
      consecutivePrintable = 0;
    } else {
      // If we have a good chunk of text, save it
      if (consecutivePrintable > 3) {
        textChunks.push(currentChunk);
      }
      currentChunk = '';
      consecutivePrintable = 0;
    }
    
    // Save chunks when they get long enough
    if (currentChunk.length > 100) {
      textChunks.push(currentChunk);
      currentChunk = '';
      consecutivePrintable = 0;
    }
  }
  
  // Add the last chunk if it exists
  if (currentChunk.length > 3) {
    textChunks.push(currentChunk);
  }
  
  // Filter out chunks that are likely not meaningful text
  textChunks = textChunks.filter(chunk => {
    // Skip chunks that are mostly numbers or special characters
    const letterCount = (chunk.match(/[a-zA-Z]/g) || []).length;
    return letterCount > chunk.length * 0.15;
  });
  
  extracted = textChunks.join(" ");
  return cleanExtractedText(extracted);
};

/**
 * Extract object/dictionary content from PDF
 */
export const extractFromDictionaries = (binary: string): string => {
  const dictTexts = [];
  const dictRegex = /<<([\s\S]*?)>>/g;
  let dictMatch;
  
  while ((dictMatch = dictRegex.exec(binary)) !== null) {
    if (dictMatch[1]) {
      const content = dictMatch[1];
      // Extract text parts from the dictionary
      const textMatches = content.match(/\(([^\)]+)\)/g);
      
      if (textMatches && textMatches.length > 0) {
        const extractedText = textMatches
          .map(m => m.substring(1, m.length - 1))
          .filter(t => t.length > 1 && /[a-zA-Z]/.test(t))
          .join(' ');
          
        if (extractedText.length > 10) {
          dictTexts.push(extractedText);
        }
      }
    }
  }
  
  return dictTexts.join(" ");
};
