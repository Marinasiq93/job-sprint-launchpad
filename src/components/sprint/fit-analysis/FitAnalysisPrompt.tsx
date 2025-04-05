
import React from "react";
import { Button } from "@/components/ui/button";
import { UserDocument } from "@/types/documents";
import { FileCheck, FileText, AlertCircle, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

interface FitAnalysisPromptProps {
  onAnalyze: () => void;
  userDocuments: UserDocument | null;
}

const FitAnalysisPrompt: React.FC<FitAnalysisPromptProps> = ({ onAnalyze, userDocuments }) => {
  // Check for any resume content (text or file)
  const hasResume = userDocuments?.resume_text || userDocuments?.resume_file_name;
  // Check for any cover letter content
  const hasCoverLetter = userDocuments?.cover_letter_text || userDocuments?.cover_letter_file_name;
  // Check for any reference content
  const hasReferences = userDocuments?.reference_text || 
    (userDocuments?.reference_files && userDocuments.reference_files.length > 0);
  
  // Count available document types
  const documentCount = [hasResume, hasCoverLetter, hasReferences].filter(Boolean).length;
  
  return (
    <div className="text-center p-6">
      <p className="text-muted-foreground mb-6">
        Vamos analisar seu perfil em relação à vaga e gerar insights valiosos para sua candidatura.
      </p>
      
      {!userDocuments && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Documentos não encontrados</span>
          </div>
          <p className="text-sm text-amber-600 mb-2">
            É necessário ter documentos cadastrados no seu perfil para realizar a análise.
          </p>
          <Link to="/profile" className="text-sm font-medium text-amber-700 hover:text-amber-800 underline">
            Ir para meu perfil e adicionar documentos
          </Link>
        </div>
      )}
      
      {userDocuments && !hasResume && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Currículo não encontrado</span>
          </div>
          <p className="text-sm text-amber-600 mb-2">
            É necessário ter um currículo cadastrado no seu perfil para realizar a análise.
          </p>
          <Link to="/profile" className="text-sm font-medium text-amber-700 hover:text-amber-800 underline">
            Ir para meu perfil e adicionar currículo
          </Link>
        </div>
      )}
      
      {userDocuments && hasResume && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <FileCheck className="h-4 w-4" />
            <span className="font-medium">
              {documentCount > 1 ? "Documentos encontrados" : "Currículo encontrado"}
            </span>
          </div>
          <div className="text-sm text-green-600 space-y-1">
            {hasResume && (
              <p className="flex items-center">
                <FileText className="h-3 w-3 mr-1" />
                Currículo: {userDocuments.resume_file_name || "Texto fornecido"}
              </p>
            )}
            {hasCoverLetter && (
              <p className="flex items-center">
                <FileText className="h-3 w-3 mr-1" />
                Carta de apresentação: {userDocuments.cover_letter_file_name || "Texto fornecido"}
              </p>
            )}
            {hasReferences && (
              <p className="flex items-center">
                <FileText className="h-3 w-3 mr-1" />
                Referências: {userDocuments.reference_files ? 
                  `${userDocuments.reference_files.length} arquivo(s)` : 
                  "Texto fornecido"}
              </p>
            )}
          </div>
        </div>
      )}
      
      <Button 
        onClick={onAnalyze}
        className="bg-jobsprint-blue hover:bg-jobsprint-blue/90"
        disabled={!userDocuments || !hasResume}
      >
        Analisar Compatibilidade
      </Button>
    </div>
  );
};

export default FitAnalysisPrompt;
