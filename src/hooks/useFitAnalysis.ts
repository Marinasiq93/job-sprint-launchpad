
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast";

export interface FitAnalysisResult {
  compatibilityScore: string;
  keySkills: string[];
  relevantExperiences: string[];
  identifiedGaps: string[];
}

interface UseFitAnalysisProps {
  sprintData: {
    jobTitle: string;
    jobDescription: string;
  } | null;
  userDocuments: {
    resume_text?: string | null;
    cover_letter_text?: string | null;
    reference_text?: string | null;
  } | null;
}

export const useFitAnalysis = ({ sprintData, userDocuments }: UseFitAnalysisProps) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FitAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateFitAnalysis = async () => {
    if (!sprintData || !userDocuments) {
      toast.error("Necessário ter dados da vaga e documentos do usuário");
      return;
    }

    // Check if resume is available
    if (!userDocuments.resume_text) {
      toast.error("Currículo não encontrado. Adicione um currículo no seu perfil.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      console.log("Preparing data for analysis...");
      // Prepare the data for analysis
      const requestData = {
        jobTitle: sprintData.jobTitle,
        jobDescription: sprintData.jobDescription,
        resumeText: userDocuments.resume_text || "",
        coverLetterText: userDocuments.cover_letter_text || "",
        referenceText: userDocuments.reference_text || ""
      };

      console.log("Calling analyze-job-fit edge function...");
      // Call the edge function to analyze job fit
      const { data, error } = await supabase.functions.invoke('analyze-job-fit', {
        body: JSON.stringify(requestData),
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Erro na função de análise");
      }

      if (!data) {
        console.error("No data returned from edge function");
        throw new Error("Nenhum dado retornado da análise");
      }

      console.log("Analysis data received:", data);
      setResult(data);
      toast.success("Análise de fit concluída com sucesso!");
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
    generateFitAnalysis
  };
};
