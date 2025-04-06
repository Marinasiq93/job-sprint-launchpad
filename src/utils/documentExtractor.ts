
import { readFileAsText } from './fileUtils';
import { supabase } from '@/integrations/supabase/client';
import { extractPDFContent } from './pdf';

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
 * Extract content from files using Eden AI
 */
export const extractFileContent = async (file: File): Promise<string> => {
  console.log(`Extracting content from ${file.name} (${file.type}), size: ${(file.size/1024).toFixed(2)}KB`);
  
  // For text files, read directly without using Eden AI
  if (file.type === 'text/plain') {
    try {
      const text = await readFileAsText(file);
      return `Arquivo: ${file.name}\nTipo: Texto\nTamanho: ${(file.size / 1024).toFixed(2)} KB\nData de upload: ${new Date().toLocaleString()}\n\n${text}`;
    } catch (e) {
      console.error("Error reading text file:", e);
      return generatePlaceholderMessage(file);
    }
  }
  
  // For PDFs, try multiple extraction methods for better results
  if (file.type === 'application/pdf') {
    try {
      console.log('Starting enhanced PDF extraction process...');
      
      // Try our local extraction with multiple methods
      let pdfText = await extractPDFContent(file);
      
      // Check if the extracted text contains binary data or is corrupted
      const hasBinaryData = /[^\x20-\x7E\xA0-\xFF\n\r\t ]/g.test(pdfText);
      
      // Calculate letter ratio for better heuristics
      const letterCount = (pdfText.match(/[a-zA-Z0-9]/g) || []).length;
      const totalLength = pdfText.length || 1; // Avoid division by zero
      const letterRatio = letterCount / totalLength;
      
      console.log(`PDF extraction quality metrics: binary data: ${hasBinaryData}, letter ratio: ${letterRatio.toFixed(2)}, length: ${pdfText.length}`);
      
      // If local extraction is successful and quality is good
      if (!hasBinaryData && letterRatio > 0.3 && pdfText.length > 200 && pdfText.length < 100000) {
        console.log('Local PDF extraction produced good quality text');
        return `Arquivo: ${file.name}\nTipo: PDF\nTamanho: ${(file.size / 1024).toFixed(2)} KB\nData de upload: ${new Date().toLocaleString()}\n\n${pdfText}`;
      }
      
      // If local extraction has issues, try Eden AI
      console.log('Local extraction has quality issues, trying Eden AI...');
      
      // Create form data to send the file
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('Calling extract-document edge function...');
      const { data, error } = await supabase.functions.invoke('extract-document', {
        body: formData,
      });
      
      if (error) {
        console.error('Error calling extract-document function:', error);
        // If we have some text from local extraction that's not too bad, use it
        if (pdfText && pdfText.length > 200 && !hasBinaryData && letterRatio > 0.2) {
          console.log('Using local extraction as fallback despite quality issues');
          return `Arquivo: ${file.name}\nTipo: PDF\nTamanho: ${(file.size / 1024).toFixed(2)} KB\nData de upload: ${new Date().toLocaleString()}\n\n${pdfText}`;
        }
        return generatePlaceholderMessage(file);
      }
      
      if (data && data.success && data.extracted_text && data.extracted_text.length > 200) {
        console.log(`Eden AI extraction successful: ${data.extracted_text.length} characters`);
        
        // Double-check for binary data in the Eden AI result
        const edenHasBinaryData = /[^\x20-\x7E\xA0-\xFF\n\r\t ]/g.test(data.extracted_text);
        if (edenHasBinaryData) {
          console.warn('Eden AI extraction contains binary data');
          // If Eden AI has binary issues but local extraction was decent, use local
          if (pdfText && pdfText.length > 200 && !hasBinaryData && letterRatio > 0.2) {
            return `Arquivo: ${file.name}\nTipo: PDF\nTamanho: ${(file.size / 1024).toFixed(2)} KB\nData de upload: ${new Date().toLocaleString()}\n\n${pdfText}`;
          }
          return generatePlaceholderMessage(file);
        }
        
        return data.extracted_text;
      } 
      
      // If Eden AI failed but local extraction has some text (even if not ideal), use it
      if (pdfText && pdfText.length > 200 && !hasBinaryData && letterRatio > 0.15) {
        console.log('Using local extraction as last resort');
        return `Arquivo: ${file.name}\nTipo: PDF\nTamanho: ${(file.size / 1024).toFixed(2)} KB\nData de upload: ${new Date().toLocaleString()}\n\n${pdfText}`;
      }
      
      // If all methods fail to get good text, use the placeholder
      return generatePlaceholderMessage(file);
    } catch (e) {
      console.error("Error in PDF extraction:", e);
      return generatePlaceholderMessage(file);
    }
  }
  
  // For other document types, use Eden AI via Edge Function
  try {
    // Create form data to send the file
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('Calling extract-document edge function for non-PDF document...');
    const { data, error } = await supabase.functions.invoke('extract-document', {
      body: formData,
    });
    
    if (error) {
      console.error('Error calling extract-document function:', error);
      return generatePlaceholderMessage(file);
    }
    
    if (!data.success || !data.extracted_text || data.extracted_text.length < 200) {
      console.warn('Insufficient text extracted by the service:', data.error || 'Unknown error');
      return generatePlaceholderMessage(file);
    }
    
    // Check for binary data in the result
    const hasBinaryData = /[^\x20-\x7E\xA0-\xFF\n\r\t ]/g.test(data.extracted_text);
    if (hasBinaryData) {
      console.warn('Extracted text contains binary data');
      return generatePlaceholderMessage(file);
    }
    
    console.log(`Eden AI extraction complete. Extracted ${data.extracted_text.length} characters`);
    return data.extracted_text;
    
  } catch (e) {
    console.error("Error in extraction process:", e);
    return generatePlaceholderMessage(file);
  }
};
