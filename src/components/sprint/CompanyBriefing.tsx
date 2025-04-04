
import { CardContent } from "@/components/ui/card";
import BriefingHeader from "./briefing/BriefingHeader";
import BriefingContent from "./briefing/BriefingContent";
import { useBriefing } from "./briefing/useBriefing";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface CompanyBriefingProps {
  companyName: string;
  companyWebsite: string;
  jobDescription: string;
  currentQuestionIndex: number;
}

const CompanyBriefing = ({ 
  companyName, 
  companyWebsite, 
  jobDescription, 
  currentQuestionIndex 
}: CompanyBriefingProps) => {
  // Ensure we're not passing empty values to the useBriefing hook
  const validCompanyName = companyName?.trim() || "Empresa";
  const validCompanyWebsite = companyWebsite?.trim() || "https://www.google.com";
  
  const { 
    isLoading, 
    currentBriefing, 
    currentBriefingCategory, 
    handleRefreshAnalysis,
    error,
    isApiAvailable
  } = useBriefing({
    companyName: validCompanyName,
    companyWebsite: validCompanyWebsite,
    currentQuestionIndex
  });

  // Só mostrar o aviso de API quando realmente for uma resposta demo e não houver erro
  const showApiWarning = isApiAvailable === false && !isLoading && !error;

  return (
    <div className="h-full flex flex-col">
      <BriefingHeader 
        onRefresh={handleRefreshAnalysis}
        isLoading={isLoading}
        isApiAvailable={isApiAvailable}
      />
      <CardContent className="flex-1 overflow-auto pb-6 px-5">
        {showApiWarning && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              A API Perplexity não está disponível ou configurada. Mostrando conteúdo de demonstração.
            </AlertDescription>
          </Alert>
        )}
        
        <BriefingContent 
          currentBriefing={currentBriefing}
          currentCategory={currentBriefingCategory}
          error={error || undefined}
          isLoading={isLoading}
        />
      </CardContent>
    </div>
  );
};

export default CompanyBriefing;
