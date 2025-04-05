
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";

interface JobDescriptionWarningProps {
  isJobDescriptionShort: boolean;
  editingJobDescription: boolean;
  debugMode?: boolean;
  tempJobDescription: string;
  setTempJobDescription: (value: string) => void;
  handleEditJobDescription: () => void;
  handleSaveJobDescription: () => void;
  handleCancelEditJobDescription: () => void;
  sprintData?: any;
}

const JobDescriptionWarning: React.FC<JobDescriptionWarningProps> = ({
  isJobDescriptionShort,
  editingJobDescription,
  debugMode = false,
  tempJobDescription,
  setTempJobDescription,
  handleEditJobDescription,
  handleSaveJobDescription,
  handleCancelEditJobDescription,
  sprintData
}) => {
  if (editingJobDescription) {
    return (
      <div className="space-y-3 mb-4 p-4 border rounded-md">
        <h3 className="font-semibold">Editar descrição da vaga</h3>
        <Textarea 
          value={tempJobDescription}
          onChange={(e) => setTempJobDescription(e.target.value)}
          rows={8}
          placeholder="Cole aqui a descrição completa da vaga..."
          className="w-full"
        />
        <div className="flex space-x-2">
          <Button size="sm" onClick={handleSaveJobDescription}>
            Salvar descrição
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancelEditJobDescription}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  // Show warning only if job description is short
  if (!isJobDescriptionShort) {
    return null;
  }

  // For initial warning (not in debug mode)
  if (!debugMode) {
    return (
      <div className="p-4 mb-4 border border-amber-200 rounded-md bg-amber-50">
        <div className="flex items-center gap-2 text-amber-700 mb-2">
          <AlertCircle className="h-5 w-5" />
          <h3 className="font-semibold">Descrição da vaga muito curta</h3>
        </div>
        <p className="text-sm text-amber-700 mb-4">
          A descrição da vaga parece muito curta, o que pode afetar a qualidade da análise. 
          Recomendamos adicionar uma descrição mais detalhada da vaga.
        </p>
        
        <Button size="sm" variant="outline" onClick={handleEditJobDescription}>
          Editar descrição da vaga
        </Button>
      </div>
    );
  }

  // For debug mode warning
  return (
    <div className="p-4 mb-4 border border-amber-200 rounded-md bg-amber-50">
      <div className="flex items-center gap-2 text-amber-700 mb-2">
        <AlertCircle className="h-5 w-5" />
        <h3 className="font-semibold">Descrição da vaga muito curta</h3>
      </div>
      <p className="text-sm text-amber-700 mb-2">
        A descrição da vaga é muito curta ({sprintData?.jobDescription.length} caracteres), o que pode afetar a qualidade da análise.
      </p>
      <Button size="sm" variant="outline" onClick={handleEditJobDescription}>
        Editar descrição da vaga
      </Button>
    </div>
  );
};

export default JobDescriptionWarning;
