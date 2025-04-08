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
 * Validates content quality for analysis
 */
export const validateDocumentContent = (resumeContent: string): { isValid: boolean; error: string | null } => {
  // Check if the resume text appears to be binary or corrupted
  const hasBinaryData = /[^\x20-\x7E\xA0-\xFF\n\r\t ]/g.test(resumeContent);
  
  // More lenient letter ratio check
  const letterCount = (resumeContent.match(/[a-zA-Z]/g) || []).length;
  const hasHighLetterRatio = letterCount > 20; // Just need some letters, not a ratio
  
  if (hasBinaryData) {
    return {
      isValid: false,
      error: "O texto do currículo parece estar corrompido. Por favor, copie e cole o texto manualmente."
    };
  }
  
  // Make the minimum content check more lenient
  if (!resumeContent || resumeContent.trim().length < 50) {
    return {
      isValid: false,
      error: "Conteúdo do currículo insuficiente. Por favor, adicione um currículo mais completo na seção de documentos do seu perfil."
    };
  }
  
  return { isValid: true, error: null };
};
