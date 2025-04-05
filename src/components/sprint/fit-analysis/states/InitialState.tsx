
import React from "react";
import FitAnalysisPrompt from "../FitAnalysisPrompt";
import JobDescriptionWarning from "../JobDescriptionWarning";

interface InitialStateProps {
  isJobDescriptionShort: boolean;
  editingJobDescription: boolean;
  tempJobDescription: string;
  setTempJobDescription: (value: string) => void;
  handleEditJobDescription: () => void;
  handleSaveJobDescription: () => void;
  handleCancelEditJobDescription: () => void;
  onAnalyze: () => void;
  userDocuments: any;
}

const InitialState: React.FC<InitialStateProps> = ({
  isJobDescriptionShort,
  editingJobDescription,
  tempJobDescription,
  setTempJobDescription,
  handleEditJobDescription,
  handleSaveJobDescription,
  handleCancelEditJobDescription,
  onAnalyze,
  userDocuments
}) => {
  return (
    <>
      <JobDescriptionWarning
        isJobDescriptionShort={isJobDescriptionShort}
        editingJobDescription={editingJobDescription}
        tempJobDescription={tempJobDescription}
        setTempJobDescription={setTempJobDescription}
        handleEditJobDescription={handleEditJobDescription}
        handleSaveJobDescription={handleSaveJobDescription}
        handleCancelEditJobDescription={handleCancelEditJobDescription}
      />
      
      <FitAnalysisPrompt onAnalyze={onAnalyze} userDocuments={userDocuments} />
    </>
  );
};

export default InitialState;
