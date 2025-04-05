
import { readFileAsArrayBuffer, arrayBufferToBinaryString } from './fileUtils';

/**
 * Improved PDF text extraction - uses pattern matching to extract text from PDF binary
 */
export const extractTextFromPDFBinary = (binary: string): string => {
  const text = [];
  let pos = 0;
  let inText = false;
  let currentWord = '';
  
  try {
    // Look for text markers in PDF
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
      
      // Text showing operator
      if (inText && (binary.substring(pos, pos + 2) === "Tj" || 
                     binary.substring(pos, pos + 2) === "TJ" ||
                     binary.substring(pos, pos + 3) === "Tm")) {
        if (currentWord.trim()) {
          text.push(currentWord.trim());
          currentWord = '';
        }
        text.push(" ");
        pos += 2;
        continue;
      }
      
      // Capture more text content
      if (inText && binary.charCodeAt(pos) >= 32 && binary.charCodeAt(pos) <= 126) {
        currentWord += binary.charAt(pos);
      } else if (inText && binary.charAt(pos) === '\n') {
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
    
    // Join text and clean it
    return text.join(" ")
      .replace(/\s+/g, " ")
      .replace(/[^\x20-\x7E]/g, "") // Remove non-printable characters
      .trim();
  } catch (error) {
    console.error("Error in PDF text extraction:", error);
    return "";
  }
};

/**
 * Extract text content from a PDF file
 */
export const extractPDFContent = async (file: File): Promise<string> => {
  try {
    // Get the file as an array buffer for better binary processing
    const arrayBuffer = await readFileAsArrayBuffer(file);
    
    // Convert to binary string for text extraction
    const binary = arrayBufferToBinaryString(arrayBuffer);
    
    // Improved PDF text extraction
    const text = extractTextFromPDFBinary(binary);
    
    return text;
  } catch (error) {
    console.error("Error extracting PDF content:", error);
    return "";
  }
};
