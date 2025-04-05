
import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserDocuments } from "@/hooks/useUserDocuments";
import { useFitAnalysis } from "@/hooks/useFitAnalysis";
import FitAnalysisResult from "@/components/sprint/fit-analysis/FitAnalysisResult";
import FitAnalysisPrompt from "@/components/sprint/fit-analysis/FitAnalysisPrompt";
import FitQuestionsSection from "@/components/sprint/fit-analysis/FitQuestionsSection";

interface SprintData {
  jobTitle: string;
  companyName: string;
  companyWebsite: string;
  jobUrl?: string;
  jobDescription: string;
}

const SprintFitAnalysis = () => {
  const location = useLocation();
  const { sprintId } = useParams();
  const [sprintData, setSprintData] = useState<SprintData | null>(null);
  const [loading, setLoading] = useState(true);
  const { isLoading: docsLoading, userDocuments } = useUserDocuments();
  
  // Questions that will appear in the right side
  const fitQuestions = [
    "Como posso desenvolver as habilidades que faltam no meu perfil?",
    "Quais partes do meu perfil são mais relevantes para esta vaga?",
    "Como posso minimizar as lacunas identificadas no meu currículo?"
  ];

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

  const { loading: analyzeLoading, result: fitAnalysisResult, generateFitAnalysis } = useFitAnalysis({ 
    sprintData, 
    userDocuments 
  });

  const handleQuestionClick = (questionIndex: number) => {
    // To be implemented in the future - will handle questions about job fit
    console.log("Question clicked:", questionIndex);
  };

  if (loading || docsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-xl">Carregando...</p>
        </div>
      </DashboardLayout>
    );
  }

  const renderFitContent = () => {
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

    if (!fitAnalysisResult) {
      return <FitAnalysisPrompt onAnalyze={generateFitAnalysis} userDocuments={userDocuments} />;
    }

    return <FitAnalysisResult result={fitAnalysisResult} loading={analyzeLoading} />;
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 animate-fade-in">
        <h1 className="text-2xl font-bold mb-2">Sprint: {sprintData?.jobTitle} - {sprintData?.companyName}</h1>
        <p className="text-muted-foreground mb-8">Fase 2: Análise de Fit com a Vaga</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left side: Fit Analysis */}
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-lg">Análise de Compatibilidade</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {renderFitContent()}
            </CardContent>
          </Card>
          
          {/* Right side: User Questions */}
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-lg">Perguntas Sobre Fit</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <FitQuestionsSection 
                fitAnalysisResult={fitAnalysisResult}
                questions={fitQuestions}
                onQuestionClick={handleQuestionClick}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SprintFitAnalysis;
