
import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { toast } from "@/lib/toast";

export interface SprintData {
  jobTitle: string;
  companyName: string;
  companyWebsite: string;
  jobUrl?: string;
  jobDescription: string;
}

export const useSprintData = () => {
  const location = useLocation();
  const { sprintId } = useParams();
  const [sprintData, setSprintData] = useState<SprintData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tempJobDescription, setTempJobDescription] = useState("");
  const [editingJobDescription, setEditingJobDescription] = useState(false);

  useEffect(() => {
    // Get sprint data from location state or fetch it based on sprintId
    if (location.state?.sprintData) {
      console.log("Using sprint data from location state:", location.state.sprintData);
      setSprintData(location.state.sprintData);
      setTempJobDescription(location.state.sprintData.jobDescription || "");
      setLoading(false);
    } else if (sprintId) {
      console.log("No sprint data in location state, creating mock data for sprint ID:", sprintId);
      
      // In a real implementation, we would fetch the sprint data from the database based on sprintId
      // For now, we'll create mock data for demonstration
      const mockData = {
        jobTitle: "Cargo não encontrado",
        companyName: "Empresa não encontrada",
        companyWebsite: "https://example.com",
        jobDescription: "Descrição da vaga não encontrada"
      };
      
      // Display a warning to the user that data wasn't properly passed
      toast.warning("Informações da vaga não encontradas. Por favor, reinicie o processo de sprint.");
      
      setSprintData(mockData);
      setTempJobDescription(mockData.jobDescription || "");
      setLoading(false);
    }
  }, [location.state, sprintId]);

  const handleEditJobDescription = () => {
    setEditingJobDescription(true);
  };

  const handleSaveJobDescription = () => {
    if (sprintData) {
      const updatedSprintData = {
        ...sprintData,
        jobDescription: tempJobDescription
      };
      setSprintData(updatedSprintData);
    }
    setEditingJobDescription(false);
  };

  const handleCancelEditJobDescription = () => {
    if (sprintData) {
      setTempJobDescription(sprintData.jobDescription);
    }
    setEditingJobDescription(false);
  };

  const isJobDescriptionShort = sprintData && sprintData.jobDescription && sprintData.jobDescription.length < 100;

  return {
    sprintData,
    loading,
    tempJobDescription,
    setTempJobDescription,
    editingJobDescription,
    handleEditJobDescription,
    handleSaveJobDescription,
    handleCancelEditJobDescription,
    isJobDescriptionShort
  };
};
