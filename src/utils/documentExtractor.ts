
import { readFileAsText } from './fileUtils';
import { extractPDFContent } from './pdfUtils';

/**
 * Fallback text extraction using file metadata
 */
export const fallbackTextExtraction = (file: File): string => {
  // For this fallback, prompt the user to manually input resume text
  const fileName = file.name || "unknown";
  const fileType = file.type || "unknown";
  const fileSize = (file.size / 1024).toFixed(2);
  const uploadDate = new Date().toLocaleString();
  
  // Create a descriptive message for manual handling
  return `[ATENÇÃO: Este é um texto de preenchimento pois não foi possível extrair o conteúdo completo do arquivo]
  
Arquivo: ${fileName}
Tipo: ${fileType}
Tamanho: ${fileSize} KB
Data de upload: ${uploadDate}

Para obter melhores resultados na análise, por favor copie e cole o texto do seu currículo diretamente no campo de texto abaixo.
  
Este arquivo pode conter informações sobre sua formação acadêmica, experiência profissional, habilidades técnicas, certificações, e outras qualificações relevantes que serão usadas para análise.`;
};

/**
 * Enhanced function to extract content from files
 */
export const extractFileContent = async (file: File): Promise<string> => {
  console.log(`Extracting content from ${file.name} (${file.type}), size: ${(file.size/1024).toFixed(2)}KB`);
  
  // For PDFs, use an improved text extraction approach
  if (file.type === 'application/pdf') {
    try {
      // Extract text from PDF
      let text = await extractPDFContent(file);
      console.log(`PDF extraction complete. Extracted ${text.length} characters`);
      
      // If extracted text is too short, try using file metadata as a fallback
      if (!text || text.length < 100) {
        console.log("Extracted text too short, using fallback extraction method");
        text = fallbackTextExtraction(file);
      }
      
      // Add file metadata to the extraction
      const metadata = `Arquivo: ${file.name}\nTipo: PDF\nTamanho: ${(file.size / 1024).toFixed(2)} KB\nData de upload: ${new Date().toLocaleString()}\n\n`;
      
      return metadata + text;
    } catch (e) {
      console.error("Error extracting PDF content:", e);
      return fallbackTextExtraction(file);
    }
  }
  
  // For Word docs, use metadata as we can't easily extract content in browser
  return fallbackTextExtraction(file);
};
