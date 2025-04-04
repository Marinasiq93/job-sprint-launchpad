
import { Separator } from "@/components/ui/separator";
import { BriefingContent as BriefingContentType } from "./types";
import { categoryTitles, BRIEFING_CATEGORIES } from "./briefingConstants";
import { ExternalLink, AlertCircle, Loader2, Link as LinkIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface BriefingContentProps {
  currentBriefing: BriefingContentType;
  currentCategory: string;
  error?: string;
  isLoading?: boolean;
}

const BriefingContent = ({ currentBriefing, currentCategory, error, isLoading }: BriefingContentProps) => {
  // If loading, show a loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin mb-4" />
        <p>Analisando informações da empresa...</p>
      </div>
    );
  }

  // If there's an error, show an error message
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertDescription className="text-sm">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  // Clean and process the overview content to handle markdown formatting
  const processedOverview = currentBriefing.overview
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') // Bold text
    .replace(/\[(\d+)\]/g, '<sup>[$1]</sup>'); // Citations

  return (
    <div className="space-y-4">
      <section>
        <h3 className="font-semibold text-sm flex items-center gap-1.5 text-gray-700 mb-2">
          <Badge variant="outline" className="bg-gray-50 text-gray-800 border-gray-200">
            {categoryTitles[currentCategory]}
          </Badge>
        </h3>
        <div 
          className="text-sm mb-2 leading-relaxed prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: processedOverview }}
        />
      </section>
      
      {currentBriefing.summary && (
        <>
          <Separator />
          <section>
            <div className="text-sm leading-relaxed">
              {currentBriefing.summary}
            </div>
          </section>
        </>
      )}

      {currentCategory === BRIEFING_CATEGORIES.MISSION_VISION && currentBriefing.additionalPoints && currentBriefing.additionalPoints.length > 0 && (
        <>
          <Separator />
          <section>
            <ul className="text-sm space-y-1.5">
              {currentBriefing.additionalPoints.map((point, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium mr-2 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
      
      {currentBriefing.sources && currentBriefing.sources.length > 0 && (
        <>
          <Separator />
          
          <section>
            <h3 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-1.5">
              <LinkIcon className="h-4 w-4 text-gray-600" />
              Fontes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentBriefing.sources.map((source, index) => (
                <a 
                  key={index}
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm flex items-center bg-gray-50 p-2 rounded-md hover:bg-gray-100 transition-colors text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                  <span className="truncate text-xs">{source.title || source.url}</span>
                </a>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default BriefingContent;
