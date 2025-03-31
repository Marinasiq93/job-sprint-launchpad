
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

interface ReferenceUploadCardProps {
  referenceFiles: File[];
  referenceText: string;
  onReferenceFilesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReferenceTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const ReferenceUploadCard = ({
  referenceFiles,
  referenceText,
  onReferenceFilesChange,
  onReferenceTextChange
}: ReferenceUploadCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5 text-jobsprint-blue" />
          Cartas de Recomendação (Opcional)
        </CardTitle>
        <CardDescription>
          Faça upload de cartas de recomendação ou cole o texto
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
            <Input
              id="reference-files"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={onReferenceFilesChange}
              multiple
              className="hidden"
            />
            <Label 
              htmlFor="reference-files" 
              className="flex flex-col items-center cursor-pointer py-4"
            >
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-700">
                {referenceFiles.length > 0 
                  ? `${referenceFiles.length} arquivo(s) selecionado(s)` 
                  : "Clique para fazer upload dos arquivos"}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                PDF, DOC, DOCX (max 5MB por arquivo)
              </span>
            </Label>
            {referenceFiles.length > 0 && (
              <div className="flex items-center justify-center mt-2 text-green-600 text-sm">
                <FileCheck className="h-4 w-4 mr-1" />
                {referenceFiles.length} arquivo(s) selecionado(s)
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference-text">Ou cole o texto das suas referências:</Label>
            <Textarea
              id="reference-text"
              placeholder="Cole o conteúdo das suas cartas de recomendação aqui..."
              value={referenceText}
              onChange={(e) => onReferenceTextChange(e)}
              rows={5}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
