
import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useUserDocuments } from "@/hooks/useUserDocuments";
import { useFitAnalysis } from "@/hooks/useFitAnalysis";
import FitAnalysisResult from "@/components/sprint/fit-analysis/FitAnalysisResult";
import FitAnalysisPrompt from "@/components/sprint/fit-analysis/FitAnalysisPrompt";
import FitQuestionsSection from "@/components/sprint/fit-analysis/FitQuestionsSection";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
  const [editingJobDescription, setEditingJobDescription] = useState(false);
  const [tempJobDescription, setTempJobDescription] = useState("");
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
      console.log("Using sprint data from location state:", location.state.sprintData);
      setSprintData(location.state.sprintData);
      setTempJobDescription(location.state.sprintData.jobDescription || "");
      setLoading(false);
    } else if (sprintId) {
      console.log("No sprint data in location state, creating mock data for sprint ID:", sprintId);
      // TODO: In a real implementation, we would fetch the sprint data from the database
      // For now, just set a mock data to demonstrate functionality
      // In production, this would be a fetch from the database
      const mockData = {
        jobTitle: "Cargo não encontrado",
        companyName: "Empresa não encontrada",
        companyWebsite: "https://example.com",
        jobDescription: "Descrição da vaga não encontrada"
      };
      setSprintData(mockData);
      setTempJobDescription(mockData.jobDescription || "");
      setLoading(false);
    }
  }, [location.state, sprintId]);

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

  const handleQuestionClick = (questionIndex: number) => {
    // To be implemented in the future - will handle questions about job fit
    console.log("Question clicked:", questionIndex);
  };

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

  if (loading || docsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-xl">Carregando...</p>
        </div>
      </DashboardLayout>
    );
  }

  const isJobDescriptionShort = sprintData && sprintData.jobDescription && sprintData.jobDescription.length < 100;

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
          
          {isJobDescriptionShort && (
            <div className="p-4 mb-4 border border-amber-200 rounded-md bg-amber-50">
              <div className="flex items-center gap-2 text-amber-700 mb-2">
                <AlertCircle className="h-5 w-5" />
                <h3 className="font-semibold">Descrição da vaga muito curta</h3>
              </div>
              <p className="text-sm text-amber-700 mb-4">
                A descrição da vaga parece muito curta, o que pode afetar a qualidade da análise. 
                Recomendamos adicionar uma descrição mais detalhada da vaga.
              </p>
              
              {editingJobDescription ? (
                <div className="space-y-3">
                  <Textarea 
                    value={tempJobDescription}
                    onChange={(e) => setTempJobDescription(e.target.value)}
                    rows={8}
                    placeholder="Cole aqui a descrição completa da vaga..."
                    className="w-full"
                  />
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={handleSaveJobDescription}>
                      Salvar descrição
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEditJobDescription}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={handleEditJobDescription}>
                  Editar descrição da vaga
                </Button>
              )}
            </div>
          )}
          
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
          <div className="p-4 mb-4 border border-amber-200 rounded-md bg-amber-50">
            <div className="flex items-center gap-2 text-amber-700 mb-2">
              <AlertCircle className="h-5 w-5" />
              <h3 className="font-semibold">Descrição da vaga muito curta</h3>
            </div>
            <p className="text-sm text-amber-700 mb-2">
              A descrição da vaga é muito curta ({sprintData?.jobDescription.length} caracteres), o que pode afetar a qualidade da análise.
            </p>
            <Button size="sm" variant="outline" onClick={handleEditJobDescription}>
              Editar descrição da vaga
            </Button>
          </div>
        )}
        
        {editingJobDescription && (
          <div className="space-y-3 mb-4 p-4 border rounded-md">
            <h3 className="font-semibold">Editar descrição da vaga</h3>
            <Textarea 
              value={tempJobDescription}
              onChange={(e) => setTempJobDescription(e.target.value)}
              rows={8}
              placeholder="Cole aqui a descrição completa da vaga..."
              className="w-full"
            />
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleSaveJobDescription}>
                Salvar descrição
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelEditJobDescription}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
        
        <FitAnalysisResult result={fitAnalysisResult} loading={analyzeLoading} debugMode={debugMode} />
      </>
    );
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
