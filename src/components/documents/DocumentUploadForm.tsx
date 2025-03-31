
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { AlertCircle } from "lucide-react";

import { ResumeUploadCard } from "./ResumeUploadCard";
import { CoverLetterUploadCard } from "./CoverLetterUploadCard";
import { ReferenceUploadCard } from "./ReferenceUploadCard";
import { DocumentHeader } from "./DocumentHeader";

export const DocumentUploadForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [coverLetterText, setCoverLetterText] = useState("");
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [referenceText, setReferenceText] = useState("");

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleCoverLetterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCoverLetterFile(e.target.files[0]);
    }
  };

  const handleReferenceFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setReferenceFiles([...referenceFiles, ...fileArray]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate that at least resume is provided (file or text)
    if (!resumeFile && !resumeText.trim()) {
      toast.error("É necessário fornecer pelo menos o currículo.");
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Save document data to localStorage (for demo only)
      localStorage.setItem('userDocuments', JSON.stringify({
        resume: resumeFile ? resumeFile.name : "texto do currículo",
        coverLetter: coverLetterFile ? coverLetterFile.name : (coverLetterText ? "texto da carta" : null),
        references: referenceFiles.length ? referenceFiles.map(f => f.name) : (referenceText ? "texto das referências" : null),
      }));

      toast.success("Documentos salvos com sucesso!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Erro ao salvar documentos. Tente novamente.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    toast("Você pode adicionar seus documentos mais tarde no seu perfil.", {
      icon: <AlertCircle className="h-4 w-4" />,
    });
    navigate("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <DocumentHeader />
      
      <ResumeUploadCard 
        resumeFile={resumeFile}
        resumeText={resumeText}
        onResumeFileChange={handleResumeFileChange}
        onResumeTextChange={(e) => setResumeText(e.target.value)}
      />
      
      <CoverLetterUploadCard 
        coverLetterFile={coverLetterFile}
        coverLetterText={coverLetterText}
        onCoverLetterFileChange={handleCoverLetterFileChange}
        onCoverLetterTextChange={(e) => setCoverLetterText(e.target.value)}
      />
      
      <ReferenceUploadCard 
        referenceFiles={referenceFiles}
        referenceText={referenceText}
        onReferenceFilesChange={handleReferenceFilesChange}
        onReferenceTextChange={(e) => setReferenceText(e.target.value)}
      />

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleSkip}
        >
          Pular por agora
        </Button>
        <Button 
          type="submit" 
          className="bg-jobsprint-blue hover:bg-jobsprint-blue/90"
          disabled={isLoading || (!resumeFile && !resumeText.trim())}
        >
          {isLoading ? "Salvando..." : "Salvar e Acessar meu Dashboard"}
        </Button>
      </div>
    </form>
  );
};
