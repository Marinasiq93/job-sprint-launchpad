
import React, { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
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
        // For PDFs, try our enhanced local extraction first
        setExtractionProgress("Extraindo texto do PDF localmente...");
        const extractedText = await extractFileContent(file);
        
        // Check if we got a reasonable amount of text
        const textLength = extractedText.length;
        
        if (textLength < 1000) {
          setExtractionProgress("Conteúdo limitado extraído - considerando usar IA para melhorar resultado");
          toast.warning(`Extração básica: ${textLength} caracteres. A análise pode ser imprecisa.`);
        } else {
          setExtractionProgress("Conteúdo extraído com sucesso!");
          toast.success(`PDF processado com sucesso: ${textLength} caracteres extraídos.`);
        }
        
        onFileUpload(file.name, extractedText);
      } else {
        // For other document types, use our AI extraction
        setExtractionProgress("Extraindo conteúdo com assistência de IA...");
        const extractedText = await extractFileContent(file);
        
        // Check if we got a reasonable amount of text
        const textLength = extractedText.length;
        
        if (textLength < 500) {
          setExtractionProgress("Extração limitada - tente copiar o texto manualmente para melhor resultado");
          toast.warning(`Extração limitada: apenas ${textLength} caracteres. A análise pode ser imprecisa.`);
        } else {
          setExtractionProgress("Conteúdo extraído com sucesso pela IA");
          toast.success(`Documento processado! Extraído ${textLength} caracteres.`);
        }
        
        onFileUpload(file.name, extractedText);
      }
      
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
      toast.error("Erro ao processar arquivo. Tente novamente.");
    } finally {
      setIsLoading(false);
      // Keep the extraction progress message for 3 seconds then clear it
      setTimeout(() => setExtractionProgress(null), 3000);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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
        <div className="text-xs text-muted-foreground mb-2">{extractionProgress}</div>
      )}
      <p className="text-sm text-gray-500">
        Formatos aceitos: PDF, DOC, DOCX, TXT, JPG, PNG (máx. 15MB)
      </p>
    </div>
  );
};
