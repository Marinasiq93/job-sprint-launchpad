
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

interface CoverLetterUploadCardProps {
  coverLetterFile: File | null;
  coverLetterText: string;
  onCoverLetterFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCoverLetterTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const CoverLetterUploadCard = ({
  coverLetterFile,
  coverLetterText,
  onCoverLetterFileChange,
  onCoverLetterTextChange
}: CoverLetterUploadCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5 text-jobsprint-pink" />
          Carta de Apresentação (Opcional)
        </CardTitle>
        <CardDescription>
          Faça upload de uma carta de apresentação base ou cole o texto
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
            <Input
              id="cover-letter-file"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={onCoverLetterFileChange}
              className="hidden"
            />
            <Label 
              htmlFor="cover-letter-file" 
              className="flex flex-col items-center cursor-pointer py-4"
            >
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-700">
                {coverLetterFile ? coverLetterFile.name : "Clique para fazer upload do arquivo"}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                PDF, DOC, DOCX (max 5MB)
              </span>
            </Label>
            {coverLetterFile && (
              <div className="flex items-center justify-center mt-2 text-green-600 text-sm">
                <FileCheck className="h-4 w-4 mr-1" />
                Arquivo selecionado
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover-letter-text">Ou cole o texto da sua carta de apresentação:</Label>
            <Textarea
              id="cover-letter-text"
              placeholder="Cole o conteúdo da sua carta de apresentação aqui..."
              value={coverLetterText}
              onChange={onCoverLetterTextChange}
              rows={5}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
