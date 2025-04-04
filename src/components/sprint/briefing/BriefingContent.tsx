
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
    
    // Create a temporary element to hold the content
    const tempDiv = document.createElement('div');
    
    // Replace markdown headers with HTML elements (without applying classes in the regex)
    let formatted = content
      // Replace headers with HTML tags (without classes)
      .replace(/#{4,}\s+([^\n]+)/g, '<h4>$1</h4>')
      .replace(/#{3}\s+([^\n]+)/g, '<h3>$1</h3>') 
      .replace(/#{2}\s+([^\n]+)/g, '<h2>$1</h2>')
      .replace(/#{1}\s+([^\n]+)/g, '<h1>$1</h1>')
      
      // Format bold and italic text
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/_([^_]+)_/g, '<em>$1</em>')
      
      // Handle paragraphs
      .replace(/\n\n+/g, '</p><p>')
      
      // Convert URLs to links
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Format lists
      .replace(/^[-–•]\s+(.+)$/gm, '<li>$1</li>')
      .replace(/^(\d+)[.)]\s+(.+)$/gm, '<li>$2</li>')
      
      // Format capitalized sections
      .replace(/^([A-Z][A-Z\s]{2,}:)(.+)$/gm, '<h3>$1$2</h3>')
      .replace(/^([A-Z][a-z]+(?:[A-Z][a-z]+)+:)(.+)$/gm, '<h4>$1$2</h4>');
    
    // Wrap in paragraph tags if needed
    return `<p>${formatted}</p>`;
  };
  
  // Format the content
  const formattedContent = formatContent(currentBriefing.overview);

  return (
    <div className="space-y-6 px-1">
      <section>
        <div 
          className="prose prose-sm max-w-none text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formattedContent }}
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
