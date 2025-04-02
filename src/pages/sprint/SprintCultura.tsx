
import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import CompanyBriefing from "@/components/sprint/CompanyBriefing";
import CultureQuestions from "@/components/sprint/CultureQuestions";

interface SprintData {
  jobTitle: string;
  companyName: string;
  companyWebsite: string;
  jobUrl?: string;
  jobDescription: string;
}

const SprintCultura = () => {
  const location = useLocation();
  const { sprintId } = useParams();
  const [sprintData, setSprintData] = useState<SprintData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get sprint data from location state or fetch it based on sprintId
    if (location.state?.sprintData) {
      setSprintData(location.state.sprintData);
      setLoading(false);
    } else if (sprintId) {
      // TODO: In a real implementation, we would fetch the sprint data from the database
      // For now, we'll just set loading to false
      setLoading(false);
    }
  }, [location.state, sprintId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-xl">Carregando...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 animate-fade-in">
        <h1 className="text-2xl font-bold mb-2">Sprint: {sprintData?.jobTitle} - {sprintData?.companyName}</h1>
        <p className="text-muted-foreground mb-8">Fase 1: Cultura e Propósito</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left side: Company Briefing */}
          <div className="border rounded-lg shadow-sm">
            <CompanyBriefing 
              companyName={sprintData?.companyName || ""} 
              companyWebsite={sprintData?.companyWebsite || ""} 
              jobDescription={sprintData?.jobDescription || ""}
            />
          </div>
          
          {/* Right side: User Questions */}
          <div className="border rounded-lg shadow-sm">
            <CultureQuestions 
              companyName={sprintData?.companyName || ""} 
              jobTitle={sprintData?.jobTitle || ""}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SprintCultura;
