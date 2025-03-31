
import { useState, useEffect } from "react";
import { toast } from "@/lib/toast";
import { UserDocument, ReferenceFile } from "@/types/documents";
import { documentService } from "@/services/documentService";

export const useUserDocuments = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userDocuments, setUserDocuments] = useState<UserDocument | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [coverLetterText, setCoverLetterText] = useState("");
  const [referenceText, setReferenceText] = useState("");
  const [referenceFiles, setReferenceFiles] = useState<ReferenceFile[]>([]);

  useEffect(() => {
    fetchUserDocuments();
  }, []);

  const fetchUserDocuments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await documentService.getUserDocuments();

      if (error) {
        toast.error("Erro ao carregar documentos");
        return;
      }

      if (data) {
        setUserDocuments(data);
        setResumeText(data.resume_text || "");
        setCoverLetterText(data.cover_letter_text || "");
        setReferenceText(data.reference_text || "");
        
        // Process reference files
        if (data.reference_files && Array.isArray(data.reference_files)) {
          const typedFiles: ReferenceFile[] = [];
          
          for (const file of data.reference_files) {
            if (typeof file === 'object' && file !== null) {
              const fileObj = file as Record<string, unknown>;
              if ('name' in fileObj && 'size' in fileObj && 'type' in fileObj) {
                typedFiles.push({
                  name: String(fileObj.name || ''),
                  size: Number(fileObj.size || 0),
                  type: String(fileObj.type || '')
                });
              }
            }
          }
            
          setReferenceFiles(typedFiles);
        } else {
          setReferenceFiles([]);
        }
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
    setResumeText(fileContent);
    if (userDocuments) {
      setUserDocuments({
        ...userDocuments,
        resume_file_name: fileName
      });
    }
    toast.success("Currículo carregado com sucesso!");
  };

  const handleCoverLetterFileUpload = (fileName: string, fileContent: string) => {
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
    const newReferenceFile: ReferenceFile = { name: fileName, size: fileSize, type: fileType };
    const updatedReferenceFiles = [...(referenceFiles || []), newReferenceFile];
    setReferenceFiles(updatedReferenceFiles);
    
    if (userDocuments) {
      setUserDocuments({
        ...userDocuments,
        reference_files: updatedReferenceFiles
      });
    }
    toast.success("Carta de recomendação adicionada com sucesso!");
  };

  const handleRemoveReferenceFile = (fileName: string) => {
    const updatedReferenceFiles = referenceFiles.filter(file => file.name !== fileName);
    setReferenceFiles(updatedReferenceFiles);
    
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
      
      const { success, error } = await documentService.saveUserDocuments({
        resumeFileName: userDocuments?.resume_file_name || null,
        resumeText: resumeText || null,
        coverLetterFileName: userDocuments?.cover_letter_file_name || null,
        coverLetterText: coverLetterText || null,
        referenceFiles: referenceFiles.length > 0 ? referenceFiles : null,
        referenceText: referenceText || null
      });

      if (error) {
        toast.error("Erro ao salvar alterações");
        return;
      }

      if (success) {
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
          // Create a placeholder until we refresh
          const userId = await getCurrentUserId();
          if (userId) {
            setUserDocuments({
              id: '', // This will be generated by the database
              user_id: userId,
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
        }

        setIsEditing(false);
        toast.success("Documentos atualizados com sucesso!");
      }
    } catch (error) {
      console.error("Erro não esperado:", error);
      toast.error("Erro ao salvar alterações");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get current user ID
  const getCurrentUserId = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
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
