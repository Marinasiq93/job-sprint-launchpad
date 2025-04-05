
import React, { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { extractFileContent } from "@/utils/documentExtractor";
import { readFileAsText } from "@/utils/fileUtils";

interface FileUploaderProps {
  onFileUpload: (fileName: string, fileContent: string) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Check file size (max 5MB - increased from previous 2MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande. O tamanho máximo é 5MB.");
      return;
    }

    try {
      if (file.type === 'text/plain') {
        // If it's a text file, read it directly
        const text = await readFileAsText(file);
        onFileUpload(file.name, text);
      } else {
        // For PDFs and DOCs, extract what we can
        const extractedText = await extractFileContent(file);
        onFileUpload(file.name, extractedText);
      }
      
      toast.success("Arquivo carregado com sucesso!");
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
      toast.error("Erro ao processar arquivo. Tente novamente.");
    }

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      >
        <Upload className="mr-2 h-4 w-4" />
        Atualizar Currículo
      </Button>
      <p className="text-sm text-gray-500">
        Formatos aceitos: PDF, DOC, DOCX, TXT (máx. 5MB)
      </p>
    </div>
  );
};
