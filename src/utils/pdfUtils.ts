
import { readFileAsArrayBuffer, arrayBufferToBinaryString } from './fileUtils';

/**
 * Improved PDF text extraction with better pattern recognition
 */
export const extractTextFromPDFBinary = (binary: string): string => {
  const text = [];
  let pos = 0;
  let inText = false;
  let currentWord = '';
  
  try {
    // Look for text markers in PDF with enhanced pattern recognition
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
      
      // Text showing operator with expanded operators
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
      
      // Capture more text content with improved character range
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
    
    // Join text and clean it with improved processing
    let result = text.join(" ")
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/[^\x20-\x7E\xA0-\xFF]/g, "") // Keep extended Latin characters
      .trim();
      
    // Add fallback if extraction is too short
    if (result.length < 100) {
      console.log("Primary extraction method yielded insufficient text, trying secondary method");
      result = extractPDFTextAlternative(binary);
    }
    
    return result;
  } catch (error) {
    console.error("Error in PDF text extraction:", error);
    return extractPDFTextAlternative(binary); // Use alternative method as fallback
  }
};

/**
 * Alternative PDF text extraction method as fallback
 */
const extractPDFTextAlternative = (binary: string): string => {
  try {
    const extractedText = [];
    
    // Look for text surrounded by parentheses (common PDF text encoding)
    const regex = /\(([^\)]+)\)/g;
    let match;
    
    while ((match = regex.exec(binary)) !== null) {
      if (match[1] && match[1].length > 1) {
        // Filter out binary data and control characters
        const cleanText = match[1].replace(/[^\x20-\x7E\xA0-\xFF]/g, "");
        if (cleanText && cleanText.length > 1) {
          extractedText.push(cleanText);
        }
      }
    }
    
    // Extract text using stream markers
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
          extractedText.push(streamContent);
        }
      }
    }
    
    return extractedText.join(" ").replace(/\s+/g, " ").trim();
  } catch (error) {
    console.error("Error in alternative PDF extraction:", error);
    return "";
  }
};

/**
 * Extract text content from a PDF file with enhanced methods
 */
export const extractPDFContent = async (file: File): Promise<string> => {
  try {
    console.log("Starting PDF content extraction");
    // Get the file as an array buffer for better binary processing
    const arrayBuffer = await readFileAsArrayBuffer(file);
    
    // Convert to binary string for text extraction
    const binary = arrayBufferToBinaryString(arrayBuffer);
    console.log("PDF binary converted, length:", binary.length);
    
    // Try primary extraction method
    let text = extractTextFromPDFBinary(binary);
    console.log("Extracted text length:", text.length);
    
    // If still insufficient, try direct buffer processing
    if (text.length < 200) {
      console.log("Still insufficient text, attempting direct buffer processing");
      const bytes = new Uint8Array(arrayBuffer);
      let directText = "";
      
      // Process the buffer directly to find text
      for (let i = 0; i < bytes.length - 1; i++) {
        if (bytes[i] >= 32 && bytes[i] <= 126) {
          directText += String.fromCharCode(bytes[i]);
        }
      }
      
      // If direct processing yields more text, use it
      if (directText.length > text.length) {
        text = directText;
        console.log("Direct processing found more text, length:", text.length);
      }
    }
    
    return text;
  } catch (error) {
    console.error("Error extracting PDF content:", error);
    return "";
  }
};
