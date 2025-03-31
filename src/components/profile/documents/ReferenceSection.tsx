
import React, { useRef } from "react";
import { FileCheck, FileText, Upload, X } from "lucide-react";
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

interface ReferenceSectionProps {
  referenceFiles: Array<{name: string, size: number, type: string}> | null;
  referenceText: string | null;
  isEditing: boolean;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFileUpload?: (fileName: string, fileSize: number, fileType: string) => void;
  onRemoveFile?: (fileName: string) => void;
}

export const ReferenceSection: React.FC<ReferenceSectionProps> = ({
  referenceFiles,
  referenceText,
  isEditing,
  onChange,
  onFileUpload,
  onRemoveFile
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
      // Add file to reference files list
      if (onFileUpload) {
        onFileUpload(file.name, file.size, file.type);
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

  const handleRemoveFile = (fileName: string) => {
    if (onRemoveFile) {
      onRemoveFile(fileName);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5 text-jobsprint-blue" />
          Carta de Recomendação
        </CardTitle>
        <CardDescription>
          Suas cartas de recomendação atuais (múltiplas permitidas)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {referenceFiles && referenceFiles.length > 0 && (
          <div className="mb-4 space-y-2">
            {referenceFiles.map((file, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-md flex items-center justify-between">
                <div className="flex items-center">
                  <FileCheck className="h-5 w-5 text-green-600 mr-2" />
                  <span>{file.name}</span>
                </div>
                {isEditing && onRemoveFile && (
                  <button 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveFile(file.name)}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
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
              Adicionar Carta de Recomendação
            </Button>
            <p className="text-sm text-gray-500">
              Formatos aceitos: PDF, DOC, DOCX, TXT (máx. 2MB)
            </p>
          </div>
        )}

        {isEditing ? (
          <Textarea
            value={referenceText || ""}
            onChange={onChange}
            placeholder="Cole o texto das suas cartas de recomendação aqui..."
            rows={5}
          />
        ) : (
          referenceText ? (
            <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md max-h-[300px] overflow-y-auto">
              {referenceText}
            </div>
          ) : (
            <div className="text-gray-500 italic">Nenhuma carta de recomendação fornecida</div>
          )
        )}
      </CardContent>
    </Card>
  );
};
