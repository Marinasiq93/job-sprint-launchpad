
import React from "react";
import { Button } from "@/components/ui/button";
import { UserDocument } from "@/types/documents";

interface FitAnalysisPromptProps {
  onAnalyze: () => void;
  userDocuments: UserDocument | null;
}

const FitAnalysisPrompt: React.FC<FitAnalysisPromptProps> = ({ onAnalyze, userDocuments }) => {
  return (
    <div className="text-center p-6">
      <p className="text-muted-foreground mb-4">
        Vamos analisar seu perfil em relação à vaga e gerar insights valiosos para sua candidatura.
      </p>
      <Button 
        onClick={onAnalyze}
        className="bg-jobsprint-blue hover:bg-jobsprint-blue/90"
        disabled={!userDocuments}
      >
        {userDocuments ? "Analisar Compatibilidade" : "Documentos não encontrados"}
      </Button>
      
      {!userDocuments && (
        <p className="text-sm text-muted-foreground mt-2">
          É necessário ter documentos cadastrados no seu perfil para realizar a análise.
        </p>
      )}
    </div>
  );
};

export default FitAnalysisPrompt;
