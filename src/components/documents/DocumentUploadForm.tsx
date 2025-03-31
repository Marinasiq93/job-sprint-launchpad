
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Você precisa estar logado para salvar documentos.");
        navigate("/login");
        return;
      }

      // Prepare reference files data for JSON storage
      const referenceFilesData = referenceFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }));

      // Save document data to Supabase using raw query to bypass TypeScript errors
      const { error } = await supabase
        .from('user_documents' as any)
        .upsert({
          user_id: session.user.id,
          resume_file_name: resumeFile ? resumeFile.name : null,
          resume_text: resumeText || null,
          cover_letter_file_name: coverLetterFile ? coverLetterFile.name : null,
          cover_letter_text: coverLetterText || null,
          reference_files: referenceFiles.length > 0 ? referenceFilesData : null,
          reference_text: referenceText || null
        }, { onConflict: 'user_id' });

      if (error) {
        console.error("Erro ao salvar documentos:", error);
        toast.error("Erro ao salvar documentos. Tente novamente.");
        setIsLoading(false);
        return;
      }

      toast.success("Documentos salvos com sucesso!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro não esperado:", error);
      toast.error("Erro ao salvar documentos. Tente novamente.");
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
