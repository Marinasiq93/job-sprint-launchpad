
import { useState } from "react";
import { toast } from "@/lib/toast";
import { FitAnalysisResult, UseFitAnalysisProps } from "@/types/fitAnalysis";
import { extractDocumentTexts, textToBase64, validateDocumentContent } from "@/utils/documentAnalysisUtils";
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

    // Extract all document texts for analysis
    const documentTexts = extractDocumentTexts(userDocuments);
    
    // Check if resume text is valid - look for content after any metadata headers
    const resumeContent = documentTexts.resumeText?.split('\n\n').slice(1).join('\n\n') || '';
    
    // Validate the resume content
    const { isValid, error: validationError } = validateDocumentContent(resumeContent);
    if (!isValid) {
      toast.error(validationError || "Erro no conteúdo do currículo");
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      console.log("Preparing data for Eden AI workflow analysis...");
      
      // Convert resume text to base64 for the workflow
      const resumeBase64 = textToBase64(resumeContent);
      
      // Call the service to generate the fit analysis
      const data = await fitAnalysisService.generateFitAnalysis(
        resumeBase64,
        "application/pdf", // Treat as PDF for the workflow
        userDocuments.resume_file_name || "resume.pdf",
        sprintData.jobDescription,
        sprintData.jobTitle,
        documentTexts.coverLetterText,
        documentTexts.referenceText,
        debugMode
      );

      // Check if we received a fallback analysis due to an error
      if (data.fallbackAnalysis) {
        console.warn("Received fallback analysis due to error:", data.error);
        setResult(data);
        setError("Ocorreu um erro na análise detalhada: " + (data.error || "Erro desconhecido"));
        toast.warning("Análise simplificada gerada devido a um erro");
      } else {
        console.log("Analysis data received:", data);
        setResult(data);
        toast.success("Análise de fit concluída com sucesso!");
      }
    } catch (error) {
      console.error("Error generating fit analysis:", error);
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
