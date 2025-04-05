
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import FitAnalysisPrompt from "./FitAnalysisPrompt";
import FitAnalysisResult from "./FitAnalysisResult";
import JobDescriptionWarning from "./JobDescriptionWarning";
import { FitAnalysisResult as FitAnalysisResultType } from "@/hooks/useFitAnalysis";

interface AnalysisContentProps {
  analyzeLoading: boolean;
  fitAnalysisResult: FitAnalysisResultType | null;
  analyzeError: string | null;
  generateFitAnalysis: () => void;
  userDocuments: any;
  isJobDescriptionShort: boolean;
  debugMode: boolean;
  setDebugMode: (value: boolean) => void;
  editingJobDescription: boolean;
  sprintData: any;
  tempJobDescription: string;
  setTempJobDescription: (value: string) => void;
  handleEditJobDescription: () => void;
  handleSaveJobDescription: () => void;
  handleCancelEditJobDescription: () => void;
}

const AnalysisContent: React.FC<AnalysisContentProps> = ({
  analyzeLoading,
  fitAnalysisResult,
  analyzeError,
  generateFitAnalysis,
  userDocuments,
  isJobDescriptionShort,
  debugMode,
  setDebugMode,
  editingJobDescription,
  sprintData,
  tempJobDescription,
  setTempJobDescription,
  handleEditJobDescription,
  handleSaveJobDescription,
  handleCancelEditJobDescription
}) => {
  if (analyzeLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  if (analyzeError) {
    return (
      <div className="p-4 border border-red-200 rounded-md bg-red-50">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <AlertCircle className="h-5 w-5" />
          <h3 className="font-semibold">Erro na análise</h3>
        </div>
        <p className="text-sm text-red-600 mb-4">{analyzeError}</p>
        <FitAnalysisPrompt onAnalyze={generateFitAnalysis} userDocuments={userDocuments} />
      </div>
    );
  }

  if (!fitAnalysisResult) {
    return (
      <>
        <div className="flex items-center justify-end space-x-2 mb-4">
          <Switch 
            id="debug-mode" 
            checked={debugMode} 
            onCheckedChange={setDebugMode}
          />
          <Label htmlFor="debug-mode" className="text-xs text-gray-500">
            Modo Debug
          </Label>
        </div>
        
        <JobDescriptionWarning
          isJobDescriptionShort={isJobDescriptionShort}
          editingJobDescription={editingJobDescription}
          tempJobDescription={tempJobDescription}
          setTempJobDescription={setTempJobDescription}
          handleEditJobDescription={handleEditJobDescription}
          handleSaveJobDescription={handleSaveJobDescription}
          handleCancelEditJobDescription={handleCancelEditJobDescription}
        />
        
        <FitAnalysisPrompt onAnalyze={generateFitAnalysis} userDocuments={userDocuments} />
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-end space-x-2 mb-4">
        <Switch 
          id="debug-mode" 
          checked={debugMode} 
          onCheckedChange={setDebugMode}
        />
        <Label htmlFor="debug-mode" className="text-xs text-gray-500">
          Modo Debug
        </Label>
      </div>
      
      {isJobDescriptionShort && debugMode && !editingJobDescription && (
        <JobDescriptionWarning
          isJobDescriptionShort={isJobDescriptionShort}
          editingJobDescription={editingJobDescription}
          debugMode={debugMode}
          tempJobDescription={tempJobDescription}
          setTempJobDescription={setTempJobDescription}
          handleEditJobDescription={handleEditJobDescription}
          handleSaveJobDescription={handleSaveJobDescription}
          handleCancelEditJobDescription={handleCancelEditJobDescription}
          sprintData={sprintData}
        />
      )}
      
      {editingJobDescription && (
        <JobDescriptionWarning
          isJobDescriptionShort={isJobDescriptionShort}
          editingJobDescription={editingJobDescription}
          tempJobDescription={tempJobDescription}
          setTempJobDescription={setTempJobDescription}
          handleEditJobDescription={handleEditJobDescription}
          handleSaveJobDescription={handleSaveJobDescription}
          handleCancelEditJobDescription={handleCancelEditJobDescription}
        />
      )}
      
      <FitAnalysisResult result={fitAnalysisResult} loading={analyzeLoading} debugMode={debugMode} />
    </>
  );
};

export default AnalysisContent;
