
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
        // For PDFs and DOCs, we'll extract what we can
        // For now, we'll use a placeholder and store the filename
        // In a real-world scenario, we would use a proper PDF extraction service
        const placeholderText = await extractFileContent(file);
        if (onFileUpload) {
          onFileUpload(file.name, placeholderText);
        }
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

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };
  
  // Function to attempt to extract content from files
  const extractFileContent = async (file: File): Promise<string> => {
    // For now, we'll just extract what we can - basic text for PDFs
    if (file.type === 'application/pdf') {
      try {
        // Get at least the first few kb of the file as a binary string
        const binary = await readFileAsBinary(file);
        
        // Very simple text extraction - this will only get plain text
        // that isn't encoded in special ways within the PDF
        const text = extractTextFromPDFBinary(binary);
        
        if (text && text.length > 20) {
          return text;
        } else {
          // If we couldn't extract meaningful text, store information about the file
          return `Arquivo PDF: ${file.name}\nData de upload: ${new Date().toLocaleString()}\nTamanho: ${(file.size / 1024).toFixed(2)} KB`;
        }
      } catch (e) {
        console.error("Error extracting PDF content:", e);
        return `Arquivo PDF: ${file.name}\nData de upload: ${new Date().toLocaleString()}\nTamanho: ${(file.size / 1024).toFixed(2)} KB`;
      }
    }
    
    // For word docs, we don't have a simple way to extract content in browser
    return `Arquivo: ${file.name}\nTipo: ${file.type}\nData de upload: ${new Date().toLocaleString()}\nTamanho: ${(file.size / 1024).toFixed(2)} KB`;
  };
  
  const readFileAsBinary = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  };
  
  // Very simple PDF text extraction - only works for basic PDFs
  // Real implementation would use a proper library
  const extractTextFromPDFBinary = (binary: string): string => {
    const text = [];
    let pos = 0;
    let foundText = false;
    
    // Very naive text extraction that looks for text markers in PDF
    while (pos < binary.length) {
      if (binary.substring(pos, pos + 2) === "BT") {
        // Beginning of text object
        foundText = true;
        pos += 2;
      } else if (binary.substring(pos, pos + 2) === "ET") {
        // End of text object
        foundText = false;
        text.push(" ");
        pos += 2;
      } else if (foundText && binary.substring(pos, pos + 2) === "Tj") {
        // Text element
        text.push(" ");
        pos += 2;
      } else if (foundText && binary.charCodeAt(pos) >= 32 && binary.charCodeAt(pos) <= 126) {
        // Printable ASCII
        text.push(binary.charAt(pos));
        pos += 1;
      } else {
        pos += 1;
      }
    }
    
    return text.join("")
      .replace(/\s+/g, " ")
      .trim();
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
