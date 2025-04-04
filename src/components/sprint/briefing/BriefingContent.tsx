
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

  // Process the overview content to enhance markdown formatting
  const processedOverview = currentBriefing.overview
    // Format headings (# Heading)
    .replace(/^#\s+(.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>')
    .replace(/^##\s+(.+)$/gm, '<h2 class="text-xl font-semibold mt-5 mb-2">$1</h2>')
    .replace(/^###\s+(.+)$/gm, '<h3 class="text-lg font-medium mt-4 mb-2">$1</h3>')
    .replace(/^####\s+(.+)$/gm, '<h4 class="text-md font-medium mt-3 mb-1">$1</h4>')
    // Replace "Análise Geral" section including its content (if present)
    .replace(/\b(Análise Geral|ANÁLISE GERAL)(\s*:|\s*\n|\s*)([\s\S]*?)(?=(\n\s*\n\s*[A-Z#]|$))/gi, '')
    // Enhance text formatting
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') // Bold text
    .replace(/\*([^*]+)\*/g, '<em>$1</em>') // Italic text
    // Improve paragraph spacing and line breaks
    .replace(/\n\n/g, '</p><p class="mb-4">') // Double line breaks as paragraphs with space
    .replace(/\n(?!\n)/g, '<br />') // Single line breaks
    // Format lists
    .replace(/^-\s+(.+)$/gm, '<li class="ml-4 mb-1">$1</li>') // Unordered list items
    .replace(/^(\d+)\.\s+(.+)$/gm, '<li class="ml-4 mb-1">$2</li>') // Ordered list items
    // Citations
    .replace(/\[(\d+)\]/g, '<sup>[$1]</sup>');

  // Wrap the processed content in a paragraph tag for initial content
  const wrappedContent = `<p class="mb-4">${processedOverview}</p>`;

  return (
    <div className="space-y-4">
      <section className="mb-4">
        <div 
          className="text-sm leading-relaxed prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: wrappedContent }}
        />
      </section>
      
      {currentBriefing.sources && currentBriefing.sources.length > 0 && (
        <>
          <Separator />
          
          <section className="pt-2">
            <h3 className="text-md font-medium mb-2">Fontes</h3>
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
