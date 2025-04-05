
import React from "react";
import { FitAnalysisResult as FitAnalysisResultType } from "@/hooks/useFitAnalysis";
import LoadingState from "./states/LoadingState";
import ErrorState from "./states/ErrorState";
import InitialState from "./states/InitialState";
import ResultState from "./states/ResultState";
import DebugModeToggle from "./DebugModeToggle";

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
  const renderContent = () => {
    if (analyzeLoading) {
      return <LoadingState />;
    }

    if (analyzeError) {
      return (
        <ErrorState 
          errorMessage={analyzeError} 
          onAnalyze={generateFitAnalysis} 
          userDocuments={userDocuments} 
        />
      );
    }

    if (!fitAnalysisResult) {
      return (
        <InitialState
          isJobDescriptionShort={isJobDescriptionShort}
          editingJobDescription={editingJobDescription}
          tempJobDescription={tempJobDescription}
          setTempJobDescription={setTempJobDescription}
          handleEditJobDescription={handleEditJobDescription}
          handleSaveJobDescription={handleSaveJobDescription}
          handleCancelEditJobDescription={handleCancelEditJobDescription}
          onAnalyze={generateFitAnalysis}
          userDocuments={userDocuments}
        />
      );
    }

    return (
      <ResultState
        fitAnalysisResult={fitAnalysisResult}
        analyzeLoading={analyzeLoading}
        debugMode={debugMode}
        isJobDescriptionShort={isJobDescriptionShort}
        editingJobDescription={editingJobDescription}
        sprintData={sprintData}
        tempJobDescription={tempJobDescription}
        setTempJobDescription={setTempJobDescription}
        handleEditJobDescription={handleEditJobDescription}
        handleSaveJobDescription={handleSaveJobDescription}
        handleCancelEditJobDescription={handleCancelEditJobDescription}
      />
    );
  };

  return (
    <>
      <DebugModeToggle debugMode={debugMode} setDebugMode={setDebugMode} />
      {renderContent()}
    </>
  );
};

export default AnalysisContent;
