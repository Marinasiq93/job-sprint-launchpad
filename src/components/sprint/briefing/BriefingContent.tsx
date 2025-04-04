
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

  // Format the content with minimal processing
  const formatContent = (content: string) => {
    if (!content) return '';
    
    // Process the content to enhance readability but preserve structure
    return content
      // Add paragraph spacing
      .replace(/\n\n+/g, '</p><p class="mb-4">')
      
      // Format headings properly
      .replace(/#{4,}\s+([^\n]+)/g, '<h4 class="text-lg font-semibold mt-5 mb-2">$1</h4>') // h4
      .replace(/#{3}\s+([^\n]+)/g, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>') // h3
      .replace(/#{2}\s+([^\n]+)/g, '<h2 class="text-2xl font-bold mt-8 mb-3 border-b pb-2">$1</h2>') // h2
      .replace(/#{1}\s+([^\n]+)/g, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>') // h1
      
      // Format bold text
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      
      // Format italic text
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/_([^_]+)_/g, '<em>$1</em>')
      
      // Format lists (very basic)
      .replace(/^[-–•]\s+(.+)$/gm, '<li class="ml-5 my-1.5 list-disc">$1</li>')
      .replace(/^(\d+)[.)]\s+(.+)$/gm, '<li class="ml-5 my-1.5 list-decimal">$2</li>')
      
      // Format section titles that aren't using Markdown headers
      .replace(/^([A-Z][A-Z\s]{2,}:)(.+)$/gm, '<h3 class="text-xl font-semibold mt-6 mb-3">$1$2</h3>')
      .replace(/^([A-Z][a-z]+(?:[A-Z][a-z]+)+:)(.+)$/gm, '<h4 class="text-lg font-semibold mt-4 mb-2">$1$2</h4>')
      
      // Convert URLs to links
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>');
  };
  
  // Format the content
  const formattedContent = formatContent(currentBriefing.overview);

  return (
    <div className="space-y-6 px-1">
      <section>
        <div 
          className="prose prose-sm max-w-none text-sm leading-relaxed prose-headings:my-4 prose-p:my-2 prose-li:my-0.5"
          dangerouslySetInnerHTML={{ __html: `<p class="mb-4">${formattedContent}</p>` }}
        />
      </section>
      
      {currentBriefing.sources && currentBriefing.sources.length > 0 && (
        <>
          <Separator className="my-6" />
          
          <section>
            <h3 className="text-lg font-semibold mb-4">Fontes</h3>
            <div className="space-y-2">
              {currentBriefing.sources.map((source, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-medium mr-2 flex-shrink-0">
                    {index + 1}
                  </div>
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm flex items-center group hover:bg-gray-50 p-1 rounded-md transition-colors text-blue-600 hover:text-blue-800 flex-1"
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-400 group-hover:text-blue-500" />
                    <span className="text-xs line-clamp-1">{source.url}</span>
                  </a>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default BriefingContent;
