
import React from "react";
import FitAnalysisResult from "../FitAnalysisResult";
import JobDescriptionWarning from "../JobDescriptionWarning";
import { FitAnalysisResult as FitAnalysisResultType } from "@/hooks/useFitAnalysis";

interface ResultStateProps {
  fitAnalysisResult: FitAnalysisResultType;
  analyzeLoading: boolean;
  debugMode: boolean;
  isJobDescriptionShort: boolean;
  editingJobDescription: boolean;
  sprintData: any;
  tempJobDescription: string;
  setTempJobDescription: (value: string) => void;
  handleEditJobDescription: () => void;
  handleSaveJobDescription: () => void;
  handleCancelEditJobDescription: () => void;
}

const ResultState: React.FC<ResultStateProps> = ({
  fitAnalysisResult,
  analyzeLoading,
  debugMode,
  isJobDescriptionShort,
  editingJobDescription,
  sprintData,
  tempJobDescription,
  setTempJobDescription,
  handleEditJobDescription,
  handleSaveJobDescription,
  handleCancelEditJobDescription,
}) => {
  return (
    <>
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

export default ResultState;
