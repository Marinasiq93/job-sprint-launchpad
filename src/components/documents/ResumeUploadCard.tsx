
import { useState } from "react";
import { FileCheck, FileText, Upload } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ResumeUploadCardProps {
  resumeFile: File | null;
  resumeText: string;
  onResumeFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResumeTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const ResumeUploadCard = ({ 
  resumeFile, 
  resumeText, 
  onResumeFileChange, 
  onResumeTextChange 
}: ResumeUploadCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5 text-jobsprint-blue" />
          Currículo
          <span className="text-red-500 ml-1">*</span>
        </CardTitle>
        <CardDescription>
          Faça upload do seu currículo ou cole o texto
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
            <Input
              id="resume-file"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={onResumeFileChange}
              className="hidden"
            />
            <Label 
              htmlFor="resume-file" 
              className="flex flex-col items-center cursor-pointer py-4"
            >
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-700">
                {resumeFile ? resumeFile.name : "Clique para fazer upload do arquivo"}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                PDF, DOC, DOCX (max 5MB)
              </span>
            </Label>
            {resumeFile && (
              <div className="flex items-center justify-center mt-2 text-green-600 text-sm">
                <FileCheck className="h-4 w-4 mr-1" />
                Arquivo selecionado
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume-text">Ou cole o texto do seu currículo:</Label>
            <Textarea
              id="resume-text"
              placeholder="Cole o conteúdo do seu currículo aqui..."
              value={resumeText}
              onChange={onResumeTextChange}
              rows={5}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
