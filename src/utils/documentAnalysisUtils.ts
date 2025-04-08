
/**
 * Utility functions for document analysis and processing
 */

/**
 * Convert a text string to base64
 */
export const textToBase64 = (text: string): string => {
  return btoa(unescape(encodeURIComponent(text)));
};

/**
 * Extract document texts from user documents
 */
export const extractDocumentTexts = (documents: any) => {
  if (!documents) return { 
    resumeText: null,
    coverLetterText: null,
    referenceText: null
  };
  
  // Get resume text from various sources
  let resumeText = '';
  if (documents.resume_text && typeof documents.resume_text === 'string' && documents.resume_text.trim().length > 0) {
    resumeText = documents.resume_text;
    console.log("Using resume text from documents, length:", resumeText.length);
    
    // Check if this is a placeholder message
    if (resumeText.includes("[ATENÇÃO: Este é um texto de preenchimento")) {
      console.warn("Resume text appears to be a placeholder message");
    }
    
    // Check if text appears to be binary or corrupted
    if (resumeText.length > 100000) {
      console.warn("Resume text is suspiciously long");
      
      // Try to extract just the meaningful parts by looking for content after headers
      const parts = resumeText.split('\n\n');
      if (parts.length > 1) {
        // Keep the header but limit the length of content
        const cleanText = parts.slice(0, 1).join('\n\n') + '\n\n' + 
                        parts.slice(1).join('\n\n').substring(0, 50000);
        resumeText = cleanText;
        console.log("Cleaned up resume text, new length:", resumeText.length);
      } else {
        // If we can't split by paragraphs, just truncate
        resumeText = resumeText.substring(0, 50000);
        console.log("Truncated resume text, new length:", resumeText.length);
      }
    }
  } else if (documents.resume_file_name) {
    // If we only have the file name, use that as evidence of a resume
    resumeText = `Currículo: ${documents.resume_file_name}`;
    console.warn("Only resume filename available, no content");
  }
  
  // Get cover letter text
  let coverLetterText = '';
  if (documents.cover_letter_text && typeof documents.cover_letter_text === 'string' && documents.cover_letter_text.trim().length > 0) {
    coverLetterText = documents.cover_letter_text;
    console.log("Using cover letter text, length:", coverLetterText.length);
  } else if (documents.cover_letter_file_name) {
    coverLetterText = `Carta de apresentação: ${documents.cover_letter_file_name}`;
  }
  
  // Get reference text
  let referenceText = '';
  if (documents.reference_text && typeof documents.reference_text === 'string' && documents.reference_text.trim().length > 0) {
    referenceText = documents.reference_text;
    console.log("Using reference text, length:", referenceText.length);
  }
  
  // If the user has reference files, add their names to the reference text
  if (documents.reference_files && Array.isArray(documents.reference_files) && documents.reference_files.length > 0) {
    const fileNames = documents.reference_files.map((file: any) => file.name).join(', ');
    if (referenceText) {
      referenceText += `\n\nArquivos de referência: ${fileNames}`;
    } else {
      referenceText = `Arquivos de referência: ${fileNames}`;
    }
  }
  
  return {
    resumeText,
    coverLetterText,
    referenceText
  };
};

/**
 * Validates content quality for analysis - with more lenient approach
 */
export const validateDocumentContent = (resumeContent: string): { isValid: boolean; error: string | null } => {
  // Check if the resume text appears to be binary or corrupted
  const hasBinaryData = /[^\x20-\x7E\xA0-\xFF\n\r\t ]/g.test(resumeContent);
  
  // More lenient letter ratio check - just need some text content
  const letterCount = (resumeContent.match(/[a-zA-Z]/g) || []).length;
  const hasLetters = letterCount > 10; // Very minimal check
  
  if (hasBinaryData) {
    // Even if it has binary data, we'll try to use it but warn the user
    return {
      isValid: false,
      error: "O texto do currículo pode estar parcialmente corrompido, mas tentaremos analisar o que for possível."
    };
  }
  
  // Much more lenient minimum content check - accept almost anything
  if (!resumeContent || resumeContent.trim().length < 20) {
    return {
      isValid: false,
      error: "Conteúdo do currículo muito limitado. A análise poderá ser menos precisa."
    };
  }
  
  // Accept content that's very short but still has some meaningful text
  if (resumeContent.trim().length < 100) {
    return {
      isValid: true, // Consider it valid but with warning
      error: "Conteúdo do currículo limitado. Para uma análise mais precisa, adicione mais detalhes."
    };
  }
  
  return { isValid: true, error: null };
};
