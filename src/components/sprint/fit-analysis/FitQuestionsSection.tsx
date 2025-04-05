
import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FitQuestionsSectionProps {
  fitAnalysisResult: any | null;
  questions: string[];
  onQuestionClick: (index: number) => void;
}

const FitQuestionsSection: React.FC<FitQuestionsSectionProps> = ({ 
  fitAnalysisResult, 
  questions, 
  onQuestionClick 
}) => {
  return (
    <>
      {fitAnalysisResult ? (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <Button 
              key={index} 
              variant="outline" 
              className="w-full justify-start text-left py-3 h-auto" 
              onClick={() => onQuestionClick(index)}
            >
              {question}
            </Button>
          ))}
        </div>
      ) : (
        <Alert>
          <AlertDescription>
            Faça a análise de compatibilidade primeiro para desbloquear as perguntas específicas para seu perfil.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default FitQuestionsSection;
