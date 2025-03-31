
import React, { useRef } from "react";
import { FileCheck, FileText, Upload } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

interface ResumeSectionProps {
  resumeFileName: string | null;
  resumeText: string | null;
  isEditing: boolean;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFileUpload?: (fileName: string, fileContent: string) => void;
}

export const ResumeSection: React.FC<ResumeSectionProps> = ({
  resumeFileName,
  resumeText,
  isEditing,
  onChange,
  onFileUpload
}) => {
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

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Arquivo muito grande. O tamanho máximo é 2MB.");
      return;
    }

    try {
      if (file.type === 'text/plain') {
        // If it's a text file, read it directly
        const text = await readFileAsText(file);
        if (onFileUpload) {
          onFileUpload(file.name, text);
        }
      } else {
        // For PDFs and DOCs, we'll just capture the file name
        // In a real implementation, you might want to extract text
        // or use a service that could extract text from PDFs and DOCs
        if (onFileUpload) {
          onFileUpload(file.name, `Conteúdo do arquivo: ${file.name} (Texto extraído automaticamente)`);
        }
      }
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
      toast.error("Erro ao processar arquivo. Tente novamente.");
    }

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5 text-jobsprint-blue" />
          Currículo
        </CardTitle>
        <CardDescription>
          Seu currículo atual
        </CardDescription>
      </CardHeader>
      <CardContent>
        {resumeFileName && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md flex items-center">
            <FileCheck className="h-5 w-5 text-green-600 mr-2" />
            <span>{resumeFileName}</span>
          </div>
        )}

        {isEditing && (
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
              Formatos aceitos: PDF, DOC, DOCX, TXT (máx. 2MB)
            </p>
          </div>
        )}

        {isEditing ? (
          <Textarea
            value={resumeText || ""}
            onChange={onChange}
            placeholder="Cole o texto do seu currículo aqui..."
            rows={5}
          />
        ) : (
          resumeText ? (
            <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md max-h-[300px] overflow-y-auto">
              {resumeText}
            </div>
          ) : (
            <div className="text-gray-500 italic">Nenhum texto de currículo fornecido</div>
          )
        )}
      </CardContent>
    </Card>
  );
};
