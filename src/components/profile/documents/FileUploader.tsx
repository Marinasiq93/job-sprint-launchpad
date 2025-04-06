import React, { useRef, useState } from "react";
import { Upload, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { extractFileContent } from "@/utils/documentExtractor";
import { readFileAsText } from "@/utils/fileUtils";

interface FileUploaderProps {
  onFileUpload: (fileName: string, fileContent: string) => void;
  uploadButtonLabel?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ 
  onFileUpload,
  uploadButtonLabel = "Atualizar Arquivo" 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const validFileTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png'
    ];
    
    if (!validFileTypes.includes(file.type)) {
      toast.error("Formato inválido. Por favor, envie um arquivo PDF, DOC, DOCX, TXT, JPEG ou PNG.");
      return;
    }

    // Check file size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Arquivo muito grande. O tamanho máximo é 15MB.");
      return;
    }

    try {
      setIsLoading(true);
      setExtractionProgress("Processando arquivo...");
      
      if (file.type === 'text/plain') {
        // If it's a text file, read it directly
        setExtractionProgress("Lendo arquivo de texto...");
        const text = await readFileAsText(file);
        onFileUpload(file.name, text);
        toast.success(`Arquivo ${file.name} carregado com sucesso! (${text.length} caracteres)`);
      } else if (file.type === 'application/pdf') {
        // For PDFs, try enhanced extraction
        setExtractionProgress("Extraindo texto do PDF...");
        const extractedText = await extractFileContent(file);
        
        // Check if the text appears to be a placeholder message or corrupted
        if (extractedText.includes("ATENÇÃO: Este é um texto de preenchimento") || 
            extractedText.includes("Não foi possível extrair o texto") || 
            /[^\x20-\x7E\xA0-\xFF\n\r\t ]/g.test(extractedText)) {
          
          // If this is our first try, retry with different extraction method
          if (retryCount === 0) {
            setRetryCount(1);
            setExtractionProgress("Tentando método alternativo de extração...");
            
            // Try again with a slight delay to ensure different approach
            setTimeout(async () => {
              try {
                const retryText = await extractFileContent(file);
                processPdfResult(retryText, file.name);
              } catch (retryError) {
                handleExtractionError(file.name);
              }
            }, 500);
            return;
          }
          
          handleExtractionError(file.name);
        } else {
          // Success with extracted text
          const wordCount = extractedText.split(/\s+/).length;
          setExtractionProgress("Texto extraído com sucesso!");
          toast.success(`PDF processado: ${wordCount} palavras extraídas.`);
          onFileUpload(file.name, extractedText);
        }
      } else {
        // For other document types
        setExtractionProgress("Extraindo conteúdo do documento...");
        const extractedText = await extractFileContent(file);
        
        // Check if we got a proper extraction or a placeholder message
        if (extractedText.includes("ATENÇÃO: Este é um texto de preenchimento") || 
            extractedText.includes("Não foi possível extrair o texto")) {
          handleExtractionError(file.name);
        } else {
          const wordCount = extractedText.split(/\s+/).length;
          setExtractionProgress("Conteúdo extraído com sucesso!");
          toast.success(`Documento processado: ${wordCount} palavras extraídas.`);
          onFileUpload(file.name, extractedText);
        }
      }
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
      handleExtractionError(file.name);
    } finally {
      setIsLoading(false);
      setRetryCount(0);
      
      // Keep the extraction progress message for 3 seconds then clear it
      setTimeout(() => setExtractionProgress(null), 3000);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Helper to process PDF extraction result
  const processPdfResult = (extractedText: string, fileName: string) => {
    // Check for binary data in the extracted text
    const hasBinaryData = /[^\x20-\x7E\xA0-\xFF\n\r\t ]/g.test(extractedText);
    
    // Calculate letter ratio
    const letterCount = (extractedText.match(/[a-zA-Z0-9]/g) || []).length;
    const totalLength = extractedText.length || 1;
    const letterRatio = letterCount / totalLength;
    
    console.log(`PDF quality check: binary=${hasBinaryData}, letterRatio=${letterRatio.toFixed(2)}, length=${extractedText.length}`);
    
    if (hasBinaryData || letterRatio < 0.2 || extractedText.length > 100000 || 
        extractedText.includes("ATENÇÃO: Este é um texto de preenchimento") ||
        extractedText.includes("Não foi possível extrair o texto")) {
      handleExtractionError(fileName);
    } else if (letterRatio < 0.3 || extractedText.length < 1000) {
      setExtractionProgress("Extração limitada - considere inserir o texto manualmente");
      toast.warning(`Extração limitada do PDF. A análise pode ser imprecisa.`);
      onFileUpload(fileName, extractedText);
    } else {
      const wordCount = extractedText.split(/\s+/).length;
      setExtractionProgress("Texto extraído com sucesso!");
      toast.success(`PDF processado: ${wordCount} palavras extraídas.`);
      onFileUpload(fileName, extractedText);
    }
  };
  
  // Helper for handling extraction errors
  const handleExtractionError = (fileName: string) => {
    setExtractionProgress("Falha na extração - por favor insira o texto manualmente");
    toast.error("Não foi possível extrair o texto corretamente. Por favor, copie e cole manualmente o texto.", {
      duration: 6000,
      icon: <AlertCircle className="h-4 w-4 text-destructive" />
    });
    
    // Still upload the file name but with a placeholder message
    onFileUpload(fileName, `Arquivo: ${fileName}\nTipo: Documento\nData de upload: ${new Date().toLocaleString()}\n\n[Por favor, copie e cole o conteúdo do documento aqui manualmente]`);
  };

  return (
    <div className="mb-4">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png" 
        onChange={handleFileChange}
      />
      <Button 
        variant="outline" 
        size="sm" 
        className="mb-3 flex items-center" 
        onClick={handleFileSelect}
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
        {isLoading ? "Processando..." : uploadButtonLabel}
      </Button>
      {extractionProgress && (
        <div className={`text-xs mb-2 ${extractionProgress.includes("Falha") ? "text-destructive" : "text-muted-foreground"}`}>
          {extractionProgress.includes("Falha") && <AlertCircle className="inline h-3 w-3 mr-1" />}
          {extractionProgress}
        </div>
      )}
      <p className="text-sm text-gray-500">
        Formatos aceitos: PDF, DOC, DOCX, TXT, JPG, PNG (máx. 15MB)
      </p>
    </div>
  );
};
