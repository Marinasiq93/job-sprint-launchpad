
/**
 * Types for the fit analysis feature
 */

/**
 * Result of the fit analysis
 */
export interface FitAnalysisResult {
  compatibilityScore: string;
  keySkills: string[];
  relevantExperiences: string[];
  identifiedGaps: string[];
  rawAnalysis?: string;
  fallbackAnalysis?: boolean;
  error?: string;
  inputSummary?: {
    jobTitleLength: number;
    jobDescriptionLength: number;
    resumeTextLength: number;
    coverLetterTextLength: number;
    referenceTextLength: number;
  };
}

/**
 * Props for the useFitAnalysis hook
 */
export interface UseFitAnalysisProps {
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
    reference_files?: Array<{name: string; size: number; type: string}> | null;
  } | null;
}
