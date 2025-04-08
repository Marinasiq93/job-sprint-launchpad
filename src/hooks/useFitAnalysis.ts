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
    const resumeContent = documentTexts.resumeText?.split('\n\n').slice(1).join('\n\n') || 
                         documentTexts.resumeText || '';
    
    // Validate the resume content but with more lenient validation
    const validationOptions = {
      minLength: 50, // Lower the minimum length requirement
      requireLetters: true,
      requireNumbers: false,
      letterRatio: 0.2 // Lower the letter ratio requirement
    };
    
    const { isValid, error: validationError } = validateDocumentContent(resumeContent, validationOptions);
    
    // Even if validation fails, we'll try to use whatever we have
    if (!isValid) {
      console.warn("Validation warning:", validationError);
      toast.warning("O conteúdo do currículo é limitado, mas tentaremos gerar uma análise básica");
      // Continue with analysis despite validation warning
    }

    setError(null);
    setLoading(true);
    try {
      console.log("Preparing data for Eden AI workflow analysis...");
      
      // Use the resume content even if validation failed
      let finalResumeContent = resumeContent;
      
      // If the content is really minimal, add some additional context from file name
      if (finalResumeContent.length < 100 && userDocuments.resume_file_name) {
        finalResumeContent += `\n\nCurrículo: ${userDocuments.resume_file_name}`;
      }
      
      // Convert resume text to base64 for the workflow
      const resumeBase64 = textToBase64(finalResumeContent);
      
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
