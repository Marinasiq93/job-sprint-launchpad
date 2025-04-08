
/**
 * Shared utility functions and constants for document extraction
 */

// CORS headers for browser requests
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Clean up and normalize extracted text
 */
export function cleanExtractedText(text: string): string {
  return text
    // Replace multiple newlines with double newlines (paragraph breaks)
    .replace(/\n{3,}/g, "\n\n")
    // Remove excessive spaces
    .replace(/[ \t]{3,}/g, " ")
    // Normalize whitespace around punctuation
    .replace(/\s+([.,;:!?])/g, "$1")
    // Remove any non-printable characters
    .replace(/[^\x20-\x7E\xA0-\xFF\n\r\t ]/g, "");
}

/**
 * Check if text contains binary or corrupted data
 */
export function hasBinaryData(text: string): boolean {
  return /[^\x20-\x7E\xA0-\xFF\n\r\t ]/g.test(text);
}

/**
 * Format file metadata and content into a complete document
 */
export function formatDocumentWithMetadata(fileName: string, type: string, content: string): string {
  const metadata = `Arquivo: ${fileName}\nTipo: ${type}\nData de extração: ${new Date().toLocaleString()}\n\n`;
  return metadata + content;
}

// API Key for Eden AI
export const EDEN_AI_API_KEY = Deno.env.get("EDEN_AI_API_KEY");
