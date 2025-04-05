
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FitAnalysisResult as FitAnalysisResultType } from "@/hooks/useFitAnalysis";

interface FitAnalysisResultProps {
  result: FitAnalysisResultType | null;
  loading: boolean;
  debugMode?: boolean;
}

const FitAnalysisResult: React.FC<FitAnalysisResultProps> = ({ result, loading, debugMode }) => {
  if (loading) {
    return <p>Analisando compatibilidade...</p>;
  }

  if (!result) {
    return null;
  }

  return (
    <div className="space-y-6">
      {debugMode && result.inputSummary && (
        <Card className="bg-gray-50 border-dashed">
          <CardContent className="pt-4">
            <h3 className="font-semibold mb-2 text-gray-700">Debug: Informações Utilizadas na Análise</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>Título da vaga: {result.inputSummary.jobTitleLength} caracteres</li>
              <li>Descrição da vaga: {result.inputSummary.jobDescriptionLength} caracteres</li>
              <li>Currículo: {result.inputSummary.resumeTextLength} caracteres</li>
              {result.inputSummary.coverLetterTextLength > 0 && (
                <li>Carta de apresentação: {result.inputSummary.coverLetterTextLength} caracteres</li>
              )}
              {result.inputSummary.referenceTextLength > 0 && (
                <li>Referências: {result.inputSummary.referenceTextLength} caracteres</li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}

      <div>
        <h3 className="font-semibold mb-2">Compatibilidade com a Vaga</h3>
        <p className="text-lg font-bold text-jobsprint-blue">{result.compatibilityScore}</p>
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">Principais Habilidades Identificadas</h3>
        <ul className="list-disc list-inside space-y-1">
          {result.keySkills.map((skill, index) => (
            <li key={index}>{skill}</li>
          ))}
        </ul>
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">Experiências ou Projetos Relevantes</h3>
        <ul className="list-disc list-inside space-y-1">
          {result.relevantExperiences.map((exp, index) => (
            <li key={index}>{exp}</li>
          ))}
        </ul>
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">Lacunas Identificadas</h3>
        <ul className="list-disc list-inside space-y-1">
          {result.identifiedGaps.map((gap, index) => (
            <li key={index}>{gap}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FitAnalysisResult;
