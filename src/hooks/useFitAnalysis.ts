
import { useState } from "react";
import { toast } from "@/lib/toast";
import { FitAnalysisResult, UseFitAnalysisProps } from "@/types/fitAnalysis";
import { textToBase64 } from "@/utils/documentAnalysisUtils";
import { fitAnalysisService } from "@/services/fitAnalysisService";

export type { FitAnalysisResult } from "@/types/fitAnalysis";

export const useFitAnalysis = ({ sprintData, userDocuments }: UseFitAnalysisProps) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FitAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);

  const generateFitAnalysis = async () => {
    if (!sprintData || !userDocuments) {
      toast.error("Necessário ter dados da vaga e documentos do usuário");
      return;
    }

    // Check if resume data exists
    if (!userDocuments.resume_text && !userDocuments.resume_file_name) {
      toast.error("Necessário ter um currículo cadastrado");
      return;
    }
    
    setError(null);
    setLoading(true);
    try {
      console.log("Preparing data for Eden AI workflow analysis...");
      
      // Use resume text content directly if available
      let resumeBase64;
      
      if (userDocuments.resume_text) {
        // Convert text content to base64 for the workflow
        resumeBase64 = textToBase64(userDocuments.resume_text);
        console.log("Using resume text content, converted to base64");
      } else {
        // Use resume file data from database if available
        toast.error("Arquivo de currículo não encontrado");
        setLoading(false);
        return;
      }
      
      // Call the service to generate the fit analysis
      const data = await fitAnalysisService.generateFitAnalysis(
        resumeBase64,
        "application/pdf", // Treat as PDF for the workflow
        userDocuments.resume_file_name || "resume.pdf",
        sprintData.jobDescription,
        sprintData.jobTitle,
        null, // No cover letter needed for Eden AI workflow
        null, // No reference text needed for Eden AI workflow
        debugMode
      );

      // Check if we received a fallback analysis due to an error
      if (data.fallbackAnalysis) {
        console.warn("Received fallback analysis:", data);
        setResult(data);
        setError(data.error ? `Análise simplificada: ${data.error}` : null);
        
        if (data.error) {
          toast.warning("Análise simplificada gerada devido a um erro");
        } else {
          // Even with fallback, if there's no explicit error, we consider it somewhat successful
          toast.success("Análise básica concluída");
        }
      } else {
        console.log("Analysis data received:", data);
        setResult(data);
        toast.success("Análise de fit concluída com sucesso!");
      }
    } catch (error) {
      console.error("Error generating fit analysis:", error);
      
      // Create a fallback result for better user experience
      const fallbackResult = {
        compatibilityScore: "Análise não disponível",
        keySkills: ["Não foi possível analisar as habilidades"],
        relevantExperiences: ["Erro na análise de experiências"],
        identifiedGaps: ["Tente novamente mais tarde"],
        fallbackAnalysis: true,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        rawAnalysis: "Ocorreu um erro técnico ao processar sua análise. Por favor, tente novamente mais tarde."
      };
      
      setResult(fallbackResult);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
      toast.error("Erro ao gerar análise de compatibilidade");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    result,
    error,
    generateFitAnalysis,
    debugMode,
    setDebugMode
  };
};
