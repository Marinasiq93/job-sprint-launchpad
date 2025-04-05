
import React from "react";
import { FileCheck, FileText } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from "./FileUploader";

interface CoverLetterSectionProps {
  coverLetterFileName: string | null;
  coverLetterText: string | null;
  isEditing: boolean;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFileUpload?: (fileName: string, fileContent: string) => void;
}

export const CoverLetterSection: React.FC<CoverLetterSectionProps> = ({
  coverLetterFileName,
  coverLetterText,
  isEditing,
  onChange,
  onFileUpload
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5 text-jobsprint-pink" />
          Carta de Apresentação
        </CardTitle>
        <CardDescription>
          Sua carta de apresentação atual (limite: 1)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {coverLetterFileName && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md flex items-center">
            <FileCheck className="h-5 w-5 text-green-600 mr-2" />
            <span>{coverLetterFileName}</span>
          </div>
        )}

        {isEditing && onFileUpload && (
          <FileUploader 
            onFileUpload={onFileUpload}
            uploadButtonLabel="Atualizar Carta de Apresentação" 
          />
        )}

        {isEditing ? (
          <Textarea
            value={coverLetterText || ""}
            onChange={onChange}
            placeholder="Cole o texto da sua carta de apresentação aqui..."
            rows={5}
          />
        ) : (
          coverLetterText ? (
            <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md max-h-[300px] overflow-y-auto">
              {coverLetterText}
            </div>
          ) : (
            <div className="text-gray-500 italic">Nenhuma carta de apresentação fornecida</div>
          )
        )}
      </CardContent>
    </Card>
  );
};
