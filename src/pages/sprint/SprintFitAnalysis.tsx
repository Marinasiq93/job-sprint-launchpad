
import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserDocuments } from "@/hooks/useUserDocuments";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast";

interface SprintData {
  jobTitle: string;
  companyName: string;
  companyWebsite: string;
  jobUrl?: string;
  jobDescription: string;
}

interface FitAnalysisResult {
  compatibilityScore: string; // e.g. "Elevado (85%)"
  keySkills: string[];
  relevantExperiences: string[];
  identifiedGaps: string[];
}

const SprintFitAnalysis = () => {
  const location = useLocation();
  const { sprintId } = useParams();
  const [sprintData, setSprintData] = useState<SprintData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [fitAnalysisResult, setFitAnalysisResult] = useState<FitAnalysisResult | null>(null);
  const { isLoading: docsLoading, userDocuments } = useUserDocuments();

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

  const generateFitAnalysis = async () => {
    if (!sprintData || !userDocuments) {
      toast.error("Necessário ter dados da vaga e documentos do usuário");
      return;
    }

    setAnalyzeLoading(true);
    try {
      // Prepare the data for analysis
      const requestData = {
        jobTitle: sprintData.jobTitle,
        jobDescription: sprintData.jobDescription,
        resumeText: userDocuments.resume_text || "",
        coverLetterText: userDocuments.cover_letter_text || "",
        referenceText: userDocuments.reference_text || ""
      };

      // Call the edge function to analyze job fit
      const { data, error } = await supabase.functions.invoke('analyze-job-fit', {
        body: JSON.stringify(requestData),
      });

      if (error) {
        throw new Error(error.message);
      }

      setFitAnalysisResult(data);
      toast.success("Análise de fit concluída com sucesso!");
    } catch (error) {
      console.error("Error generating fit analysis:", error);
      toast.error("Erro ao gerar análise de compatibilidade");
    } finally {
      setAnalyzeLoading(false);
    }
  };

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
      return (
        <div className="text-center p-6">
          <p className="text-muted-foreground mb-4">
            Vamos analisar seu perfil em relação à vaga e gerar insights valiosos para sua candidatura.
          </p>
          <Button 
            onClick={generateFitAnalysis}
            className="bg-jobsprint-blue hover:bg-jobsprint-blue/90"
            disabled={!userDocuments}
          >
            {userDocuments ? "Analisar Compatibilidade" : "Documentos não encontrados"}
          </Button>
          
          {!userDocuments && (
            <p className="text-sm text-muted-foreground mt-2">
              É necessário ter documentos cadastrados no seu perfil para realizar a análise.
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Compatibilidade com a Vaga</h3>
          <p className="text-lg font-bold text-jobsprint-blue">{fitAnalysisResult.compatibilityScore}</p>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Principais Habilidades Identificadas</h3>
          <ul className="list-disc list-inside space-y-1">
            {fitAnalysisResult.keySkills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Experiências ou Projetos Relevantes</h3>
          <ul className="list-disc list-inside space-y-1">
            {fitAnalysisResult.relevantExperiences.map((exp, index) => (
              <li key={index}>{exp}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Lacunas Identificadas</h3>
          <ul className="list-disc list-inside space-y-1">
            {fitAnalysisResult.identifiedGaps.map((gap, index) => (
              <li key={index}>{gap}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  // Questions that will appear in the right side
  const fitQuestions = [
    "Como posso desenvolver as habilidades que faltam no meu perfil?",
    "Quais partes do meu perfil são mais relevantes para esta vaga?",
    "Como posso minimizar as lacunas identificadas no meu currículo?"
  ];

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
              {fitAnalysisResult ? (
                <div className="space-y-4">
                  {fitQuestions.map((question, index) => (
                    <Button 
                      key={index} 
                      variant="outline" 
                      className="w-full justify-start text-left py-3 h-auto" 
                      onClick={() => handleQuestionClick(index)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    Faça a análise de compatibilidade primeiro para desbloquear as perguntas específicas para seu perfil.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SprintFitAnalysis;
