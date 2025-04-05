
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

  const generateFitAnalysis = async () => {
    if (!sprintData || !userDocuments) {
      toast.error("Necessário ter dados da vaga e documentos do usuário");
      return;
    }

    setLoading(true);
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

      setResult(data);
      toast.success("Análise de fit concluída com sucesso!");
    } catch (error) {
      console.error("Error generating fit analysis:", error);
      toast.error("Erro ao gerar análise de compatibilidade");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    result,
    generateFitAnalysis
  };
};
