
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

interface ResumeSectionProps {
  resumeFileName: string | null;
  resumeText: string | null;
  isEditing: boolean;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const ResumeSection: React.FC<ResumeSectionProps> = ({
  resumeFileName,
  resumeText,
  isEditing,
  onChange
}) => {
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
