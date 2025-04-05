
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
  
  // For PDFs and other document types, use Eden AI via Edge Function
  try {
    // Create form data to send the file
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('Calling extract-document edge function...');
    const { data, error } = await supabase.functions.invoke('extract-document', {
      body: formData,
    });
    
    if (error) {
      console.error('Error calling extract-document function:', error);
      return generatePlaceholderMessage(file);
    }
    
    if (!data.success || !data.extracted_text) {
      console.warn('No text extracted by the service:', data.error || 'Unknown error');
      return data.extracted_text || generatePlaceholderMessage(file);
    }
    
    console.log(`Eden AI extraction complete. Extracted ${data.extracted_text.length} characters`);
    return data.extracted_text;
    
  } catch (e) {
    console.error("Error in extraction process:", e);
    return generatePlaceholderMessage(file);
  }
};
