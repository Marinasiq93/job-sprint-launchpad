import { readFileAsArrayBuffer, arrayBufferToBinaryString } from './fileUtils';

/**
 * Improved PDF text extraction with enhanced methods
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

// Method 1: Extract text between BT and ET markers
const extractTextBetweenBTET = (binary: string): string => {
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

// Method 2: Extract text within parentheses (common in PDF text objects)
const extractTextFromParentheses = (binary: string): string => {
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

// Method 3: Extract text from stream objects in PDF
const extractTextFromStreams = (binary: string): string => {
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

// Clean up extracted text for better readability
const cleanExtractedText = (text: string): string => {
  return text
    .replace(/\s+/g, " ")                    // Normalize whitespace
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "")   // Keep only printable characters
    .replace(/\\(\d{3}|n|r|t|b|f|\\|\(|\))/g, " ") // Replace escape sequences
    .replace(/\s+/g, " ")                    // Normalize whitespace again
    .trim();
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
      directText = cleanExtractedText(directText);
      
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
