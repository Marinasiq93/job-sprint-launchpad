
import { Separator } from "@/components/ui/separator";
import { BriefingContent as BriefingContentType } from "./types";
import { ExternalLink, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

  // Process the overview content to handle markdown formatting
  const processedOverview = currentBriefing.overview
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') // Bold text
    .replace(/\*([^*]+)\*/g, '<em>$1</em>') // Italic text
    .replace(/\n\n/g, '<br/><br/>') // Line breaks
    .replace(/\[(\d+)\]/g, '<sup>[$1]</sup>'); // Citations

  return (
    <div className="space-y-4">
      <section>
        <div 
          className="text-sm leading-relaxed prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: processedOverview }}
        />
      </section>
      
      {currentBriefing.sources && currentBriefing.sources.length > 0 && (
        <>
          <Separator />
          
          <section className="pt-2">
            <div className="grid grid-cols-1 gap-2">
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
