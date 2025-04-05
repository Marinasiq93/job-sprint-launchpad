
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
    if (file.type !== 'application/pdf' && 
        file.type !== 'application/msword' && 
        file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' &&
        file.type !== 'text/plain') {
      toast.error("Formato inválido. Por favor, envie um arquivo PDF, DOC, DOCX ou TXT.");
      return;
    }

    // Check file size (max 10MB - increased from previous 5MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. O tamanho máximo é 10MB.");
      return;
    }

    try {
      setIsLoading(true);
      setExtractionProgress("Processando arquivo...");
      
      if (file.type === 'text/plain') {
        // If it's a text file, read it directly
        const text = await readFileAsText(file);
        onFileUpload(file.name, text);
        toast.success(`Arquivo ${file.name} carregado com sucesso! (${text.length} caracteres)`);
      } else {
        // For PDFs and DOCs, extract what we can
        setExtractionProgress("Extraindo conteúdo do arquivo...");
        const extractedText = await extractFileContent(file);
        
        // Check if we got a reasonable amount of text
        if (extractedText.length < 200 && file.type === 'application/pdf') {
          setExtractionProgress("Tentando método alternativo de extração...");
          // Give the user feedback but still use what we have
          toast.warning(`Extração limitada: apenas ${extractedText.length} caracteres. A análise pode ser imprecisa.`);
        }
        
        onFileUpload(file.name, extractedText);
        toast.success(`Arquivo ${file.name} processado! Extraído ${extractedText.length} caracteres.`);
      }
      
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
      toast.error("Erro ao processar arquivo. Tente novamente.");
    } finally {
      setIsLoading(false);
      setExtractionProgress(null);
      
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
        accept=".pdf,.doc,.docx,.txt" 
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
        Formatos aceitos: PDF, DOC, DOCX, TXT (máx. 10MB)
      </p>
    </div>
  );
};
