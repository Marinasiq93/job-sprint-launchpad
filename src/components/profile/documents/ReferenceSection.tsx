
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

interface ReferenceSectionProps {
  referenceFiles: Array<{name: string, size: number, type: string}> | null;
  referenceText: string | null;
  isEditing: boolean;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const ReferenceSection: React.FC<ReferenceSectionProps> = ({
  referenceFiles,
  referenceText,
  isEditing,
  onChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5 text-jobsprint-blue" />
          Carta de Recomendação
        </CardTitle>
        <CardDescription>
          Suas cartas de recomendação atuais
        </CardDescription>
      </CardHeader>
      <CardContent>
        {referenceFiles && referenceFiles.length > 0 && (
          <div className="mb-4 space-y-2">
            {referenceFiles.map((file, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-md flex items-center">
                <FileCheck className="h-5 w-5 text-green-600 mr-2" />
                <span>{file.name}</span>
              </div>
            ))}
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
