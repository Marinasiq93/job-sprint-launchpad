
import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";

interface EmptyDocumentsProps {
  isEditing: boolean;
  resumeText: string;
  coverLetterText: string;
  referenceText: string;
  onResumeTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onCoverLetterTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onReferenceTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const EmptyDocuments: React.FC<EmptyDocumentsProps> = ({
  isEditing,
  resumeText,
  coverLetterText,
  referenceText,
  onResumeTextChange,
  onCoverLetterTextChange,
  onReferenceTextChange
}) => {
  if (!isEditing) {
    return (
      <Alert variant="default" className="mb-4 bg-gray-50 border-gray-200">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Você ainda não possui documentos. Clique em "Adicionar Documentos" para começar.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resume */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-jobsprint-blue" />
            Currículo
          </CardTitle>
          <CardDescription>
            Adicione seu currículo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={resumeText}
            onChange={onResumeTextChange}
            placeholder="Cole o texto do seu currículo aqui..."
            rows={5}
          />
        </CardContent>
      </Card>

      {/* Cover Letter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-jobsprint-pink" />
            Carta de Apresentação
          </CardTitle>
          <CardDescription>
            Adicione sua carta de apresentação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={coverLetterText}
            onChange={onCoverLetterTextChange}
            placeholder="Cole o texto da sua carta de apresentação aqui..."
            rows={5}
          />
        </CardContent>
      </Card>

      {/* References */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-jobsprint-blue" />
            Carta de Recomendação
          </CardTitle>
          <CardDescription>
            Adicione suas cartas de recomendação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={referenceText}
            onChange={onReferenceTextChange}
            placeholder="Cole o texto das suas cartas de recomendação aqui..."
            rows={5}
          />
        </CardContent>
      </Card>
    </div>
  );
};
