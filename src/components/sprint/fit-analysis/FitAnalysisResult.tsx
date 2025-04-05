
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface FitAnalysisResultProps {
  result: {
    compatibilityScore: string;
    keySkills: string[];
    relevantExperiences: string[];
    identifiedGaps: string[];
  } | null;
  loading: boolean;
}

const FitAnalysisResult: React.FC<FitAnalysisResultProps> = ({ result, loading }) => {
  if (loading) {
    return <p>Analisando compatibilidade...</p>;
  }

  if (!result) {
    return null;
  }

  return (
    <div className="space-y-6">
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
