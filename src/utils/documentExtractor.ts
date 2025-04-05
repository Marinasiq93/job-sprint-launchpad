
import { readFileAsText } from './fileUtils';
import { extractPDFContent } from './pdfUtils';

/**
 * Creates a placeholder message when content extraction fails
 */
export const generatePlaceholderMessage = (file: File): string => {
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
  
  // For PDFs, use our enhanced extraction methods
  if (file.type === 'application/pdf') {
    try {
      // Extract text from PDF using our improved methods
      let text = await extractPDFContent(file);
      const extractedLength = text.length;
      console.log(`PDF extraction complete. Extracted ${extractedLength} characters`);
      
      // If we got a reasonable amount of content, add file metadata and return it
      if (extractedLength >= 100) {
        // Add file metadata to the extraction
        const metadata = `Arquivo: ${file.name}\nTipo: PDF\nTamanho: ${(file.size / 1024).toFixed(2)} KB\nData de upload: ${new Date().toLocaleString()}\n\n`;
        return metadata + text;
      }
      
      // If we got very little content, generate a placeholder message
      console.log("Extracted text too short, using placeholder message");
      return generatePlaceholderMessage(file);
    } catch (e) {
      console.error("Error extracting PDF content:", e);
      return generatePlaceholderMessage(file);
    }
  } else if (file.type === 'text/plain') {
    // For text files, read directly
    try {
      const text = await readFileAsText(file);
      return `Arquivo: ${file.name}\nTipo: Texto\nTamanho: ${(file.size / 1024).toFixed(2)} KB\nData de upload: ${new Date().toLocaleString()}\n\n${text}`;
    } catch (e) {
      console.error("Error reading text file:", e);
      return generatePlaceholderMessage(file);
    }
  }
  
  // For Word docs and other types, use placeholder as we can't easily extract content in browser
  return generatePlaceholderMessage(file);
};
