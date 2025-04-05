
import React from "react";
import { AlertCircle } from "lucide-react";
import FitAnalysisPrompt from "../FitAnalysisPrompt";

interface ErrorStateProps {
  errorMessage: string;
  onAnalyze: () => void;
  userDocuments: any;
}

const ErrorState: React.FC<ErrorStateProps> = ({ errorMessage, onAnalyze, userDocuments }) => {
  return (
    <div className="p-4 border border-red-200 rounded-md bg-red-50">
      <div className="flex items-center gap-2 text-red-600 mb-2">
        <AlertCircle className="h-5 w-5" />
        <h3 className="font-semibold">Erro na análise</h3>
      </div>
      <p className="text-sm text-red-600 mb-4">{errorMessage}</p>
      <FitAnalysisPrompt onAnalyze={onAnalyze} userDocuments={userDocuments} />
    </div>
  );
};

export default ErrorState;
