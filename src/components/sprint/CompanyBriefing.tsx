
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

  return (
    <div className="h-full flex flex-col">
      <BriefingHeader 
        onRefresh={handleRefreshAnalysis}
        isLoading={isLoading}
        isApiAvailable={isApiAvailable}
      />
      <CardContent className="flex-1 overflow-auto pb-6">
        {!isApiAvailable && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              A API Perplexity não está disponível. Mostrando conteúdo de demonstração.
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
