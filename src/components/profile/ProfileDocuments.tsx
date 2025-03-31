
import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useUserDocuments } from "@/hooks/useUserDocuments";
import { ResumeSection } from "./documents/ResumeSection";
import { CoverLetterSection } from "./documents/CoverLetterSection";
import { ReferenceSection } from "./documents/ReferenceSection";
import { EmptyDocuments } from "./documents/EmptyDocuments";

export const ProfileDocuments = () => {
  const { 
    isLoading, 
    userDocuments, 
    isEditing, 
    resumeText, 
    coverLetterText, 
    referenceText,
    setResumeText,
    setCoverLetterText,
    setReferenceText,
    handleEditToggle,
    handleSave,
    handleResumeFileUpload
  } = useUserDocuments();

  const handleResumeTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResumeText(e.target.value);
  };

  const handleCoverLetterTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCoverLetterText(e.target.value);
  };

  const handleReferenceTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReferenceText(e.target.value);
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando documentos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Meus Documentos</h2>
        <Button 
          onClick={handleEditToggle}
          variant={isEditing ? "destructive" : "outline"}
        >
          {isEditing ? "Cancelar" : userDocuments ? "Editar Documentos" : "Adicionar Documentos"}
        </Button>
      </div>
      
      <Separator />
      
      {!userDocuments ? (
        <EmptyDocuments 
          isEditing={isEditing}
          resumeText={resumeText}
          coverLetterText={coverLetterText}
          referenceText={referenceText}
          onResumeTextChange={handleResumeTextChange}
          onCoverLetterTextChange={handleCoverLetterTextChange}
          onReferenceTextChange={handleReferenceTextChange}
        />
      ) : (
        <div className="space-y-6">
          <ResumeSection 
            resumeFileName={userDocuments.resume_file_name}
            resumeText={isEditing ? resumeText : userDocuments.resume_text}
            isEditing={isEditing}
            onChange={handleResumeTextChange}
            onFileUpload={handleResumeFileUpload}
          />

          <CoverLetterSection 
            coverLetterFileName={userDocuments.cover_letter_file_name}
            coverLetterText={isEditing ? coverLetterText : userDocuments.cover_letter_text}
            isEditing={isEditing}
            onChange={handleCoverLetterTextChange}
          />

          <ReferenceSection 
            referenceFiles={userDocuments.reference_files}
            referenceText={isEditing ? referenceText : userDocuments.reference_text}
            isEditing={isEditing}
            onChange={handleReferenceTextChange}
          />
        </div>
      )}

      {isEditing && (
        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            className="bg-jobsprint-blue hover:bg-jobsprint-blue/90"
            disabled={isLoading}
          >
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      )}
    </div>
  );
};
