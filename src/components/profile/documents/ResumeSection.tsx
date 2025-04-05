
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

    // Check file size (max 5MB - increased from previous 2MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande. O tamanho máximo é 5MB.");
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
        // For PDFs and DOCs, extract what we can
        const extractedText = await extractFileContent(file);
        if (onFileUpload) {
          onFileUpload(file.name, extractedText);
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
  
  // Enhanced function to extract content from files
  const extractFileContent = async (file: File): Promise<string> => {
    // For PDFs, use an improved text extraction approach
    if (file.type === 'application/pdf') {
      try {
        // Get the file as an array buffer for better binary processing
        const arrayBuffer = await readFileAsArrayBuffer(file);
        
        // Convert to binary string for text extraction
        const binary = arrayBufferToBinaryString(arrayBuffer);
        
        // Improved PDF text extraction
        let text = extractTextFromPDFBinary(binary);
        
        // If extracted text is too short, try using file metadata as a fallback
        if (!text || text.length < 100) {
          console.log("Extracted text too short, using fallback extraction method");
          text = await fallbackTextExtraction(file);
        }
        
        // Add file metadata to the extraction
        const metadata = `Arquivo: ${file.name}\nTipo: PDF\nTamanho: ${(file.size / 1024).toFixed(2)} KB\nData de upload: ${new Date().toLocaleString()}\n\n`;
        
        return metadata + text;
      } catch (e) {
        console.error("Error extracting PDF content:", e);
        return fallbackTextExtraction(file);
      }
    }
    
    // For Word docs, use metadata as we can't easily extract content in browser
    return fallbackTextExtraction(file);
  };
  
  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };
  
  const arrayBufferToBinaryString = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return binary;
  };
  
  // Improved PDF text extraction - more aggressive pattern matching
  const extractTextFromPDFBinary = (binary: string): string => {
    const text = [];
    let pos = 0;
    let inText = false;
    let currentWord = '';
    
    try {
      // Look for text markers in PDF
      while (pos < binary.length - 1) {
        // Beginning of text object
        if (binary.substring(pos, pos + 2) === "BT") {
          inText = true;
          pos += 2;
          continue;
        }
        
        // End of text object
        if (binary.substring(pos, pos + 2) === "ET") {
          inText = false;
          if (currentWord.trim()) {
            text.push(currentWord.trim());
            currentWord = '';
          }
          text.push(" ");
          pos += 2;
          continue;
        }
        
        // Text showing operator
        if (inText && (binary.substring(pos, pos + 2) === "Tj" || 
                       binary.substring(pos, pos + 2) === "TJ" ||
                       binary.substring(pos, pos + 3) === "Tm")) {
          if (currentWord.trim()) {
            text.push(currentWord.trim());
            currentWord = '';
          }
          text.push(" ");
          pos += 2;
          continue;
        }
        
        // Capture more text content
        if (inText && binary.charCodeAt(pos) >= 32 && binary.charCodeAt(pos) <= 126) {
          currentWord += binary.charAt(pos);
        } else if (inText && binary.charAt(pos) === '\n') {
          if (currentWord.trim()) {
            text.push(currentWord.trim());
            currentWord = '';
          }
          text.push(" ");
        }
        
        pos += 1;
      }
      
      if (currentWord.trim()) {
        text.push(currentWord.trim());
      }
      
      // Join text and clean it
      return text.join(" ")
        .replace(/\s+/g, " ")
        .replace(/[^\x20-\x7E]/g, "") // Remove non-printable characters
        .trim();
    } catch (error) {
      console.error("Error in PDF text extraction:", error);
      return "";
    }
  };
  
  // Fallback text extraction using file metadata
  const fallbackTextExtraction = async (file: File): Promise<string> => {
    // For this fallback, prompt the user to manually input resume text
    const fileName = file.name || "unknown";
    const fileType = file.type || "unknown";
    const fileSize = (file.size / 1024).toFixed(2);
    const uploadDate = new Date().toLocaleString();
    
    // Create a descriptive message for manual handling
    return `[ATENÇÃO: Este é um texto de preenchimento pois não foi possível extrair o conteúdo completo do arquivo]
    
Arquivo: ${fileName}
Tipo: ${fileType}
Tamanho: ${fileSize} KB
Data de upload: ${uploadDate}

Para obter melhores resultados na análise, por favor copie e cole o texto do seu currículo diretamente no campo de texto abaixo.
    
Este arquivo pode conter informações sobre sua formação acadêmica, experiência profissional, habilidades técnicas, certificações, e outras qualificações relevantes que serão usadas para análise.`;
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
              Formatos aceitos: PDF, DOC, DOCX, TXT (máx. 5MB)
            </p>
          </div>
        )}

        {isEditing ? (
          <Textarea
            value={resumeText || ""}
            onChange={onChange}
            placeholder="Cole o texto do seu currículo aqui..."
            rows={10}
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
