
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast";

// Define a type for the user document that matches our database schema
export interface UserDocument {
  id: string;
  user_id: string;
  resume_file_name: string | null;
  resume_text: string | null;
  cover_letter_file_name: string | null;
  cover_letter_text: string | null;
  reference_files: Array<{name: string, size: number, type: string}> | null;
  reference_text: string | null;
  created_at: string;
  updated_at: string;
}

export const useUserDocuments = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userDocuments, setUserDocuments] = useState<UserDocument | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [coverLetterText, setCoverLetterText] = useState("");
  const [referenceText, setReferenceText] = useState("");
  const [referenceFiles, setReferenceFiles] = useState<Array<{name: string, size: number, type: string}>>([]);

  useEffect(() => {
    fetchUserDocuments();
  }, []);

  const fetchUserDocuments = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar documentos:", error);
        toast.error("Erro ao carregar documentos");
        setIsLoading(false);
        return;
      }

      if (data) {
        setUserDocuments(data as UserDocument);
        setResumeText(data.resume_text || "");
        setCoverLetterText(data.cover_letter_text || "");
        setReferenceText(data.reference_text || "");
        setReferenceFiles(data.reference_files || []);
      } else {
        setUserDocuments(null);
      }
    } catch (error) {
      console.error("Erro não esperado:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing && userDocuments) {
      // Reset text fields to current values when entering edit mode
      setResumeText(userDocuments.resume_text || "");
      setCoverLetterText(userDocuments.cover_letter_text || "");
      setReferenceText(userDocuments.reference_text || "");
      setReferenceFiles(userDocuments.reference_files || []);
    }
  };

  const handleResumeFileUpload = (fileName: string, fileContent: string) => {
    // Enforce the rule: only one resume allowed
    setResumeText(fileContent);
    // Update user documents state to reflect the new file name
    if (userDocuments) {
      setUserDocuments({
        ...userDocuments,
        resume_file_name: fileName
      });
    }
    toast.success("Currículo carregado com sucesso!");
  };

  const handleCoverLetterFileUpload = (fileName: string, fileContent: string) => {
    // Enforce the rule: only one cover letter allowed
    setCoverLetterText(fileContent);
    if (userDocuments) {
      setUserDocuments({
        ...userDocuments,
        cover_letter_file_name: fileName
      });
    }
    toast.success("Carta de apresentação carregada com sucesso!");
  };

  const handleReferenceFileUpload = (fileName: string, fileSize: number, fileType: string) => {
    // Allow multiple reference files
    const newReferenceFile = { name: fileName, size: fileSize, type: fileType };
    const updatedReferenceFiles = [...(referenceFiles || []), newReferenceFile];
    setReferenceFiles(updatedReferenceFiles);
    
    // Update user documents state
    if (userDocuments) {
      setUserDocuments({
        ...userDocuments,
        reference_files: updatedReferenceFiles
      });
    }
    toast.success("Carta de recomendação adicionada com sucesso!");
  };

  const handleRemoveReferenceFile = (fileName: string) => {
    // Remove specific reference file
    const updatedReferenceFiles = referenceFiles.filter(file => file.name !== fileName);
    setReferenceFiles(updatedReferenceFiles);
    
    // Update user documents state
    if (userDocuments) {
      setUserDocuments({
        ...userDocuments,
        reference_files: updatedReferenceFiles
      });
    }
    toast.success("Carta de recomendação removida com sucesso!");
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Sessão expirada. Faça login novamente.");
        return;
      }

      const { error } = await supabase
        .from('user_documents')
        .upsert({
          user_id: session.user.id,
          resume_file_name: userDocuments?.resume_file_name || null,
          resume_text: resumeText || null,
          cover_letter_file_name: userDocuments?.cover_letter_file_name || null,
          cover_letter_text: coverLetterText || null,
          reference_files: referenceFiles.length > 0 ? referenceFiles : null,
          reference_text: referenceText || null
        }, { onConflict: 'user_id' });

      if (error) {
        console.error("Erro ao atualizar documentos:", error);
        toast.error("Erro ao salvar alterações");
        return;
      }

      if (userDocuments) {
        setUserDocuments({
          ...userDocuments,
          resume_text: resumeText,
          cover_letter_text: coverLetterText,
          reference_text: referenceText,
          reference_files: referenceFiles.length > 0 ? referenceFiles : null,
          updated_at: new Date().toISOString()
        });
      } else {
        setUserDocuments({
          id: '', // This will be generated by the database
          user_id: session.user.id,
          resume_file_name: null,
          resume_text: resumeText,
          cover_letter_file_name: null,
          cover_letter_text: coverLetterText,
          reference_files: referenceFiles.length > 0 ? referenceFiles : null,
          reference_text: referenceText,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      setIsEditing(false);
      toast.success("Documentos atualizados com sucesso!");
    } catch (error) {
      console.error("Erro não esperado:", error);
      toast.error("Erro ao salvar alterações");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    userDocuments,
    isEditing,
    resumeText,
    coverLetterText,
    referenceText,
    referenceFiles,
    setResumeText,
    setCoverLetterText,
    setReferenceText,
    setReferenceFiles,
    handleEditToggle,
    handleSave,
    handleResumeFileUpload,
    handleCoverLetterFileUpload,
    handleReferenceFileUpload,
    handleRemoveReferenceFile
  };
};
