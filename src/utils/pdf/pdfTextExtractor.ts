
import { readFileAsArrayBuffer, arrayBufferToBinaryString } from '../fileUtils';
import { 
  extractTextBetweenBTET, 
  extractTextFromParentheses, 
  extractTextFromStreams,
  extractUnicodeText,
  extractFromDictionaries
} from './extractionMethods';
import { cleanExtractedText, postProcessText } from './textCleaner';

/**
 * Extract text from PDF binary data using multiple methods
 */
export const extractTextFromPDFBinary = (binary: string): string => {
  try {
    // Try all extraction methods and combine the results
    const results = [];
    
    // Method 1: BT/ET text extraction (basic PDF text objects)
    const btEtText = extractTextBetweenBTET(binary);
    if (btEtText && btEtText.length > 50) {
      results.push({ text: btEtText, length: btEtText.length, method: "BT/ET" });
    }
    
    // Method 2: Parentheses extraction (text strings in PDF)
    const parenthesesText = extractTextFromParentheses(binary);
    if (parenthesesText && parenthesesText.length > 50) {
      results.push({ text: parenthesesText, length: parenthesesText.length, method: "Parentheses" });
    }
    
    // Method 3: PDF stream content extraction
    const streamText = extractTextFromStreams(binary);
    if (streamText && streamText.length > 50) {
      results.push({ text: streamText, length: streamText.length, method: "Streams" });
    }
    
    // Method 4: Unicode text pattern extraction
    const unicodeText = extractUnicodeText(binary);
    if (unicodeText && unicodeText.length > 50) {
      results.push({ text: unicodeText, length: unicodeText.length, method: "Unicode" });
    }
    
    // Method 5: Dictionary object extraction
    const dictText = extractFromDictionaries(binary);
    if (dictText && dictText.length > 50) {
      results.push({ text: dictText, length: dictText.length, method: "Dictionaries" });
    }
    
    if (results.length === 0) {
      console.warn("No text extraction methods yielded results");
      return "";
    }
    
    // Sort results by length (longest first)
    results.sort((a, b) => b.length - a.length);
    
    // Log what we found
    console.log(`PDF extraction results: ${results.length} methods succeeded`);
    results.forEach(r => console.log(`- ${r.method}: ${r.length} characters`));
    
    // Get the longest result or combine if beneficial
    let finalText = results[0].text;
    
    // If we have multiple good results, try to combine them
    if (results.length > 1) {
      // Check if second method provides significant additional content
      if (results[1].length > results[0].length * 0.5) {
        // Combine the top two methods
        const combinedText = results[0].text + " " + results[1].text;
        finalText = cleanExtractedText(combinedText);
        console.log(`Combined top two methods: ${finalText.length} characters`);
      }
    }
    
    // Final cleaning pass
    finalText = postProcessText(finalText);
    
    return finalText;
  } catch (error) {
    console.error("Error in PDF text extraction:", error);
    return "";
  }
};

/**
 * Process PDF buffer directly as a robust extraction method
 */
export const extractTextFromPDFBuffer = (arrayBuffer: ArrayBuffer): string => {
  try {
    const bytes = new Uint8Array(arrayBuffer);
    const textRuns = [];
    let currentRun = "";
    let consecutiveTextChars = 0;
    
    // Enhanced direct buffer scanning
    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i];
      
      // Only consider printable ASCII and common extended ASCII
      if ((byte >= 32 && byte <= 126) || (byte >= 160 && byte <= 255)) {
        currentRun += String.fromCharCode(byte);
        consecutiveTextChars++;
      } else if (byte === 10 || byte === 13) { // newlines
        if (currentRun && consecutiveTextChars > 0) {
          currentRun += " ";
        }
        consecutiveTextChars = 0;
      } else {
        // End of text run - save if meaningful
        if (currentRun.length >= 4 && /[a-zA-Z]{2,}/.test(currentRun)) {
          textRuns.push(currentRun);
        }
        currentRun = "";
        consecutiveTextChars = 0;
      }
      
      // Save runs when they get long enough
      if (currentRun.length > 200) {
        textRuns.push(currentRun);
        currentRun = "";
        consecutiveTextChars = 0;
      }
    }
    
    // Save the last run if it exists
    if (currentRun.length >= 4 && /[a-zA-Z]{2,}/.test(currentRun)) {
      textRuns.push(currentRun);
    }
    
    // Join all text runs
    let extractedText = textRuns.join(" ");
    
    // Clean and post-process
    extractedText = cleanExtractedText(extractedText);
    extractedText = postProcessText(extractedText);
    
    console.log(`Direct buffer extraction found ${extractedText.length} characters`);
    return extractedText;
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
    
    // Try multiple extraction methods in parallel for better results
    const extractionPromises = [
      // Extraction Method 1: Binary string parsing
      (async () => {
        const binary = arrayBufferToBinaryString(arrayBuffer);
        const text = extractTextFromPDFBinary(binary);
        return { text, method: "binary", length: text.length };
      })(),
      
      // Extraction Method 2: Direct buffer processing
      (async () => {
        const text = extractTextFromPDFBuffer(arrayBuffer);
        return { text, method: "buffer", length: text.length };
      })()
    ];
    
    // Wait for all extraction methods to complete
    const results = await Promise.all(extractionPromises);
    
    // Sort results by text length (longest first)
    results.sort((a, b) => b.length - a.length);
    
    console.log(`PDF extraction complete. Best method: ${results[0].method} with ${results[0].length} characters`);
    
    // If the best result is still very short, try combining methods
    if (results[0].length < 1000 && results.length > 1) {
      const combinedText = results.map(r => r.text).join("\n\n");
      const cleanedCombined = postProcessText(cleanExtractedText(combinedText));
      
      console.log(`Combined methods yielded ${cleanedCombined.length} characters`);
      
      if (cleanedCombined.length > results[0].length) {
        return cleanedCombined;
      }
    }
    
    return results[0].text;
  } catch (error) {
    console.error("Error extracting PDF content:", error);
    return "";
  }
};
