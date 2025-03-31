
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const DocumentHeader = () => {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Configure seus documentos</h2>
        <p className="text-gray-500 mt-1">
          Esses documentos serão usados como base para personalizar suas candidaturas
        </p>
      </div>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Dica</AlertTitle>
        <AlertDescription>
          Esses documentos serão usados como base para personalizar suas candidaturas. Você poderá atualizá-los depois no seu perfil.
        </AlertDescription>
      </Alert>
    </>
  );
};
