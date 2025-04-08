
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FitAnalysisResult as FitAnalysisResultType } from "@/hooks/useFitAnalysis";
import { AlertTriangle } from "lucide-react";

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

  // Helper function to check if content length is sufficient
  const isContentSufficient = (length: number, minLength: number = 100): boolean => {
    return length >= minLength;
  };

  return (
    <div className="space-y-6">
      {debugMode && result.inputSummary && (
        <Card className="bg-gray-50 border-dashed">
          <CardContent className="pt-4">
            <h3 className="font-semibold mb-2 text-gray-700">Debug: Informações Utilizadas na Análise</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className={!isContentSufficient(result.inputSummary.jobTitleLength, 5) ? "text-amber-600 font-medium" : ""}>
                Título da vaga: {result.inputSummary.jobTitleLength} caracteres
                {!isContentSufficient(result.inputSummary.jobTitleLength, 5) && 
                  <span className="ml-2 text-amber-600">
                    <AlertTriangle className="inline h-3 w-3 mr-1" />
                    Muito curto
                  </span>}
              </li>
              <li className={!isContentSufficient(result.inputSummary.jobDescriptionLength) ? "text-amber-600 font-medium" : ""}>
                Descrição da vaga: {result.inputSummary.jobDescriptionLength} caracteres
                {!isContentSufficient(result.inputSummary.jobDescriptionLength) && 
                  <span className="ml-2 text-amber-600">
                    <AlertTriangle className="inline h-3 w-3 mr-1" />
                    Conteúdo insuficiente
                  </span>}
              </li>
              <li className={!isContentSufficient(result.inputSummary.resumeTextLength) ? "text-amber-600 font-medium" : ""}>
                Currículo: {result.inputSummary.resumeTextLength} caracteres
                {!isContentSufficient(result.inputSummary.resumeTextLength) && 
                  <span className="ml-2 text-amber-600">
                    <AlertTriangle className="inline h-3 w-3 mr-1" />
                    Conteúdo insuficiente
                  </span>}
              </li>
              {result.inputSummary.coverLetterTextLength > 0 && (
                <li className={!isContentSufficient(result.inputSummary.coverLetterTextLength) ? "text-amber-600 font-medium" : ""}>
                  Carta de apresentação: {result.inputSummary.coverLetterTextLength} caracteres
                  {!isContentSufficient(result.inputSummary.coverLetterTextLength) && 
                    <span className="ml-2 text-amber-600">
                      <AlertTriangle className="inline h-3 w-3 mr-1" />
                      Conteúdo insuficiente
                    </span>}
                </li>
              )}
              {result.inputSummary.referenceTextLength > 0 && (
                <li>
                  Referências: {result.inputSummary.referenceTextLength} caracteres
                </li>
              )}
            </ul>
            {(!isContentSufficient(result.inputSummary.resumeTextLength) || !isContentSufficient(result.inputSummary.jobDescriptionLength)) && (
              <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                <p className="font-semibold">Conteúdo insuficiente detectado</p>
                <p>Para uma análise mais precisa, considere:</p>
                <ul className="list-disc list-inside mt-1">
                  {!isContentSufficient(result.inputSummary.resumeTextLength) && (
                    <li>Adicionar mais detalhes ao seu currículo ou copiar manualmente o texto completo</li>
                  )}
                  {!isContentSufficient(result.inputSummary.jobDescriptionLength) && (
                    <li>Fornecer uma descrição mais completa da vaga</li>
                  )}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div>
        <h3 className="font-semibold mb-2">Compatibilidade com a Vaga</h3>
        <p className="text-lg font-bold text-jobsprint-blue">{result.compatibilityScore}</p>
      </div>
      
      {/* Display raw analysis if available */}
      {result.rawAnalysis && (
        <div className="bg-white p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Análise Completa</h3>
          <div className="whitespace-pre-wrap text-sm">
            {result.rawAnalysis}
          </div>
        </div>
      )}
      
      {/* Only show structured analysis if we don't have raw analysis or if in debug mode */}
      {(!result.rawAnalysis || debugMode) && (
        <>
          <div>
            <h3 className="font-semibold mb-2">Principais Habilidades Identificadas</h3>
            <ul className="list-disc list-inside space-y-1">
              {result.keySkills && result.keySkills.length > 0 ? (
                result.keySkills.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))
              ) : (
                <li>Nenhuma habilidade específica identificada</li>
              )}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Experiências ou Projetos Relevantes</h3>
            <ul className="list-disc list-inside space-y-1">
              {result.relevantExperiences && result.relevantExperiences.length > 0 ? (
                result.relevantExperiences.map((exp, index) => (
                  <li key={index}>{exp}</li>
                ))
              ) : (
                <li>Nenhuma experiência específica identificada</li>
              )}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Lacunas Identificadas</h3>
            <ul className="list-disc list-inside space-y-1">
              {result.identifiedGaps && result.identifiedGaps.length > 0 ? (
                result.identifiedGaps.map((gap, index) => (
                  <li key={index}>{gap}</li>
                ))
              ) : (
                <li>Nenhuma lacuna específica identificada</li>
              )}
            </ul>
          </div>
        </>
      )}
      
      {result.fallbackAnalysis && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-700">
          <p className="font-medium mb-1">Nota: Esta é uma análise simplificada</p>
          <p>Devido a limitações nos dados fornecidos ou problemas técnicos, esta é uma análise básica. 
             Para uma análise mais detalhada, considere adicionar mais informações ao seu currículo ou 
             fornecer uma descrição de vaga mais completa.</p>
        </div>
      )}
    </div>
  );
};

export default FitAnalysisResult;
