
import { readFileAsArrayBuffer, arrayBufferToBinaryString } from '../fileUtils';
import { extractTextBetweenBTET, extractTextFromParentheses, extractTextFromStreams } from './extractionMethods';
import { cleanExtractedText } from './textCleaner';

/**
 * Extract text from PDF binary data using multiple methods
 */
export const extractTextFromPDFBinary = (binary: string): string => {
  try {
    let extractedText = '';
    
    // Method 1: Extract text between BT/ET markers
    extractedText = extractTextBetweenBTET(binary);
    
    // Method 2: If first method returns insufficient text, try parentheses extraction
    if (extractedText.length < 300) {
      console.log("BT/ET extraction yielded insufficient text, trying parentheses extraction");
      const parenthesesText = extractTextFromParentheses(binary);
      
      // Use the longer of the two methods
      if (parenthesesText.length > extractedText.length) {
        extractedText = parenthesesText;
      }
    }
    
    // Method 3: Try stream content extraction if still insufficient
    if (extractedText.length < 300) {
      console.log("Still insufficient text, trying stream extraction");
      const streamText = extractTextFromStreams(binary);
      
      // Use the longest extraction method
      if (streamText.length > extractedText.length) {
        extractedText = streamText;
      }
    }
    
    // If we got some content, clean it up
    if (extractedText.length > 0) {
      extractedText = cleanExtractedText(extractedText);
    }
    
    console.log(`PDF extraction complete. Final text length: ${extractedText.length} characters`);
    return extractedText;
  } catch (error) {
    console.error("Error in PDF text extraction:", error);
    return "";
  }
};

/**
 * Process PDF buffer directly as a last resort method
 */
export const extractTextFromPDFBuffer = (arrayBuffer: ArrayBuffer): string => {
  try {
    const bytes = new Uint8Array(arrayBuffer);
    let directText = "";
    
    // Direct processing of buffer to find text content
    for (let i = 0; i < bytes.length - 1; i++) {
      // Only add printable characters
      if ((bytes[i] >= 32 && bytes[i] <= 126) || (bytes[i] >= 160 && bytes[i] <= 255)) {
        directText += String.fromCharCode(bytes[i]);
      } else if (bytes[i] === 10 || bytes[i] === 13) { // newlines
        directText += " ";
      }
    }
    
    // Clean the direct extraction
    return cleanExtractedText(directText);
  } catch (error) {
    console.error("Error in direct PDF buffer extraction:", error);
    return "";
  }
};

/**
 * Extract text content from a PDF file
 */
export const extractPDFContent = async (file: File): Promise<string> => {
  try {
    console.log(`Starting PDF content extraction for ${file.name}, size: ${(file.size/1024).toFixed(2)}KB`);
    
    // Get the file as an array buffer
    const arrayBuffer = await readFileAsArrayBuffer(file);
    
    // Convert to binary string for text extraction
    const binary = arrayBufferToBinaryString(arrayBuffer);
    console.log("PDF binary converted, length:", binary.length);
    
    // Extract text using our enhanced methods
    let text = extractTextFromPDFBinary(binary);
    console.log(`Initial extraction yielded ${text.length} characters`);
    
    // If extraction yielded very little text, try direct buffer processing as last resort
    if (text.length < 300) {
      console.log("Still insufficient text, attempting direct buffer processing");
      const directText = extractTextFromPDFBuffer(arrayBuffer);
      
      // If direct processing yields more text, use it
      if (directText.length > text.length) {
        text = directText;
        console.log(`Direct processing found more text: ${text.length} characters`);
      }
    }
    
    // Log the extraction results
    if (text.length < 100) {
      console.warn("PDF extraction yielded very little text");
    } else {
      console.log(`PDF extraction successful: ${text.length} characters extracted`);
    }
    
    return text;
  } catch (error) {
    console.error("Error extracting PDF content:", error);
    return "";
  }
};
