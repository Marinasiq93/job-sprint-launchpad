
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserDocuments } from "@/hooks/useUserDocuments";
import { useFitAnalysis } from "@/hooks/useFitAnalysis";
import { useSprintData } from "@/hooks/useSprintData";
import FitQuestionsSection from "@/components/sprint/fit-analysis/FitQuestionsSection";
import AnalysisContent from "@/components/sprint/fit-analysis/AnalysisContent";

const SprintFitAnalysis = () => {
  // Get sprint data and job description management
  const {
    sprintData,
    loading: sprintLoading,
    tempJobDescription,
    setTempJobDescription,
    editingJobDescription,
    handleEditJobDescription,
    handleSaveJobDescription,
    handleCancelEditJobDescription,
    isJobDescriptionShort
  } = useSprintData();

  // Get user documents
  const { isLoading: docsLoading, userDocuments } = useUserDocuments();
  
  // Analysis hooks
  const { 
    loading: analyzeLoading, 
    result: fitAnalysisResult, 
    error: analyzeError, 
    generateFitAnalysis,
    debugMode,
    setDebugMode
  } = useFitAnalysis({ 
    sprintData, 
    userDocuments 
  });

  // Questions that will appear in the right side
  const fitQuestions = [
    "Como posso desenvolver as habilidades que faltam no meu perfil?",
    "Quais partes do meu perfil são mais relevantes para esta vaga?",
    "Como posso minimizar as lacunas identificadas no meu currículo?"
  ];

  const handleQuestionClick = (questionIndex: number) => {
    // To be implemented in the future - will handle questions about job fit
    console.log("Question clicked:", questionIndex);
  };

  if (sprintLoading || docsLoading) {
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
        <p className="text-muted-foreground mb-8">Fase 2: Análise de Fit com a Vaga</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left side: Fit Analysis */}
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-lg">Análise de Compatibilidade</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <AnalysisContent
                analyzeLoading={analyzeLoading}
                fitAnalysisResult={fitAnalysisResult}
                analyzeError={analyzeError}
                generateFitAnalysis={generateFitAnalysis}
                userDocuments={userDocuments}
                isJobDescriptionShort={isJobDescriptionShort}
                debugMode={debugMode}
                setDebugMode={setDebugMode}
                editingJobDescription={editingJobDescription}
                sprintData={sprintData}
                tempJobDescription={tempJobDescription}
                setTempJobDescription={setTempJobDescription}
                handleEditJobDescription={handleEditJobDescription}
                handleSaveJobDescription={handleSaveJobDescription}
                handleCancelEditJobDescription={handleCancelEditJobDescription}
              />
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
