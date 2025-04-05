
export interface AnalysisInput {
  jobTitle: string;
  jobDescription: string;
  resumeText: string;
  coverLetterText?: string;
  referenceText?: string;
}

export interface AnalysisResult {
  compatibilityScore: string;
  keySkills: string[];
  relevantExperiences: string[];
  identifiedGaps: string[];
}
