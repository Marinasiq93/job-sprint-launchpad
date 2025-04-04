
import { BriefingContent as BriefingContentType } from "./types";
import LoadingState from "./states/LoadingState";
import ErrorState from "./states/ErrorState";
import MainContentSection from "./sections/MainContentSection";
import SourcesSection from "./sections/SourcesSection";
import NewsSection from "./sections/NewsSection";

interface BriefingContentProps {
  currentBriefing: BriefingContentType;
  currentCategory: string;
  error?: string;
  isLoading?: boolean;
}

const BriefingContent = ({ 
  currentBriefing, 
  currentCategory, 
  error, 
  isLoading 
}: BriefingContentProps) => {
  // If loading, show a loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // If there's an error, show an error message
  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="space-y-6 px-1">
      <MainContentSection overview={currentBriefing.overview} />
      
      <SourcesSection sources={currentBriefing.sources || []} />
      
      <NewsSection newsItems={currentBriefing.recentNews || []} />
    </div>
  );
};

export default BriefingContent;
