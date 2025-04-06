import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast";

export interface FitAnalysisResult {
  compatibilityScore: string;
  keySkills: string[];
  relevantExperiences: string[];
  identifiedGaps: string[];
  inputSummary?: {
    jobTitleLength: number;
    jobDescriptionLength: number;
    resumeTextLength: number;
    coverLetterTextLength: number;
    referenceTextLength: number;
  };
}

interface UseFitAnalysisProps {
  sprintData: {
    jobTitle: string;
    jobDescription: string;
  } | null;
  userDocuments: {
    resume_text?: string | null;
    resume_file_name?: string | null;
    cover_letter_text?: string | null;
    cover_letter_file_name?: string | null;
    reference_text?: string | null;
  } | null;
}

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
    
    // Check if the resume text appears to be binary or corrupted
    const hasBinaryData = /[^\x20-\x7E\xA0-\xFF\n\r\t ]/g.test(resumeContent);
    const hasHighLetterRatio = (resumeContent.match(/[a-zA-Z]/g) || []).length > resumeContent.length * 0.1;
    
    if (hasBinaryData || !hasHighLetterRatio || resumeContent.length > 100000) {
      toast.error("O texto do currículo parece estar corrompido. Por favor, copie e cole o texto manualmente.");
      setError("O texto do currículo parece estar corrompido. Por favor, copie e cole o texto manualmente na seção de documentos do seu perfil.");
      return;
    }
    
    if (!resumeContent || resumeContent.trim().length < 100) {
      toast.error("Currículo não encontrado ou muito curto. Adicione um currículo com mais conteúdo no seu perfil.");
      setError("Conteúdo do currículo insuficiente. Por favor, adicione um currículo mais completo na seção de documentos do seu perfil.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      console.log("Preparing data for analysis...");
      // Prepare the data for analysis with all available texts
      const requestData = {
        jobTitle: sprintData.jobTitle,
        jobDescription: sprintData.jobDescription,
        resumeText: documentTexts.resumeText,
        coverLetterText: documentTexts.coverLetterText,
        referenceText: documentTexts.referenceText,
        debug: debugMode // Add debug flag to show content details
      };

      console.log("Calling analyze-job-fit edge function...");
      console.log("Document text lengths:", {
        jobTitleLength: sprintData.jobTitle?.length || 0,
        jobDescriptionLength: sprintData.jobDescription?.length || 0,
        resumeTextLength: documentTexts.resumeText?.length || 0,
        coverLetterTextLength: documentTexts.coverLetterText?.length || 0,
        referenceTextLength: documentTexts.referenceText?.length || 0
      });
      
      // Call the edge function to analyze job fit
      const { data, error } = await supabase.functions.invoke('analyze-job-fit', {
        body: requestData,
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Erro na função de análise");
      }

      if (!data) {
        console.error("No data returned from edge function");
        throw new Error("Nenhum dado retornado da análise");
      }

      // Check if we received a fallback analysis due to an error
      if (data.fallbackAnalysis) {
        console.warn("Received fallback analysis due to error:", data.error);
        setResult(data.fallbackAnalysis);
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

  // Extract all document texts from user documents
  const extractDocumentTexts = (documents: any) => {
    if (!documents) return { 
      resumeText: null,
      coverLetterText: null,
      referenceText: null
    };
    
    // Get resume text from various sources
    let resumeText = '';
    if (documents.resume_text && typeof documents.resume_text === 'string' && documents.resume_text.trim().length > 0) {
      resumeText = documents.resume_text;
      console.log("Using resume text from documents, length:", resumeText.length);
      
      // Check if this is a placeholder message
      if (resumeText.includes("[ATENÇÃO: Este é um texto de preenchimento")) {
        console.warn("Resume text appears to be a placeholder message");
      }
      
      // Check if text appears to be binary or corrupted
      if (resumeText.length > 100000) {
        console.warn("Resume text is suspiciously long");
        
        // Try to extract just the meaningful parts by looking for content after headers
        const parts = resumeText.split('\n\n');
        if (parts.length > 1) {
          // Keep the header but limit the length of content
          const cleanText = parts.slice(0, 1).join('\n\n') + '\n\n' + 
                          parts.slice(1).join('\n\n').substring(0, 50000);
          resumeText = cleanText;
          console.log("Cleaned up resume text, new length:", resumeText.length);
        } else {
          // If we can't split by paragraphs, just truncate
          resumeText = resumeText.substring(0, 50000);
          console.log("Truncated resume text, new length:", resumeText.length);
        }
      }
    } else if (documents.resume_file_name) {
      // If we only have the file name, use that as evidence of a resume
      resumeText = `Currículo: ${documents.resume_file_name}`;
      console.warn("Only resume filename available, no content");
    }
    
    // Get cover letter text
    let coverLetterText = '';
    if (documents.cover_letter_text && typeof documents.cover_letter_text === 'string' && documents.cover_letter_text.trim().length > 0) {
      coverLetterText = documents.cover_letter_text;
      console.log("Using cover letter text, length:", coverLetterText.length);
    } else if (documents.cover_letter_file_name) {
      coverLetterText = `Carta de apresentação: ${documents.cover_letter_file_name}`;
    }
    
    // Get reference text
    let referenceText = '';
    if (documents.reference_text && typeof documents.reference_text === 'string' && documents.reference_text.trim().length > 0) {
      referenceText = documents.reference_text;
      console.log("Using reference text, length:", referenceText.length);
    }
    
    // If the user has reference files, add their names to the reference text
    if (documents.reference_files && Array.isArray(documents.reference_files) && documents.reference_files.length > 0) {
      const fileNames = documents.reference_files.map((file: any) => file.name).join(', ');
      if (referenceText) {
        referenceText += `\n\nArquivos de referência: ${fileNames}`;
      } else {
        referenceText = `Arquivos de referência: ${fileNames}`;
      }
    }
    
    return {
      resumeText,
      coverLetterText,
      referenceText
    };
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
