
import { CardContent } from "@/components/ui/card";
import BriefingHeader from "./briefing/BriefingHeader";
import BriefingContent from "./briefing/BriefingContent";
import { useBriefing } from "./briefing/useBriefing";

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
  const { 
    isLoading, 
    currentBriefing, 
    currentBriefingCategory, 
    handleRefreshAnalysis 
  } = useBriefing({
    companyName,
    companyWebsite,
    currentQuestionIndex
  });

  return (
    <div className="h-full flex flex-col">
      <BriefingHeader 
        onRefresh={handleRefreshAnalysis}
        isLoading={isLoading}
      />
      <CardContent className="flex-1 overflow-auto">
        <BriefingContent 
          currentBriefing={currentBriefing}
          currentCategory={currentBriefingCategory}
        />
      </CardContent>
    </div>
  );
};

export default CompanyBriefing;
