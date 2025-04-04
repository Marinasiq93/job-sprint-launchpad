
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
    // Remove "Análise Geral" section including its content (if present)
    .replace(/\b(Análise Geral|ANÁLISE GERAL)(\s*:|\s*\n|\s*)([\s\S]*?)(?=(\n\s*\n\s*[A-Z#]|$))/gi, '')
    
    // Format main headers/titles (h2 level)
    .replace(/^([A-Z][A-Za-záàâãéèêíïóôõöúçñ\s]{2,})(?:\s*da\s+|\s+de\s+|\s+do\s+|\s+dos\s+|\s+das\s+)?([A-Z][A-Za-z0-9áàâãéèêíïóôõöúçñ\s]+)$/gm, 
      '<h2 class="text-xl font-bold mt-8 mb-3 text-slate-900 border-b pb-1">$1$2</h2>')
    
    // Format section headers with explicit colon (h3 level)
    .replace(/^([A-Z][A-Za-záàâãéèêíïóôõöúçñ\s]{2,}):$/gm, 
      '<h3 class="text-lg font-semibold mt-6 mb-3 text-slate-800">$1</h3>')
    
    // Format standard markdown headers
    .replace(/^##\s+(.+)$/gm, '<h2 class="text-xl font-bold mt-7 mb-3 text-slate-900 border-b pb-1">$1</h2>')
    .replace(/^###\s+(.+)$/gm, '<h3 class="text-lg font-semibold mt-6 mb-2 text-slate-800">$1</h3>')
    .replace(/^####\s+(.+)$/gm, '<h4 class="text-base font-medium mt-4 mb-2 text-slate-700">$1</h4>')
    
    // Format hashtag values as bullet items with proper styling
    .replace(/^#([A-Za-z0-9]+):\s+(.+)$/gm, '<li class="ml-5 mb-3 list-disc"><span class="font-semibold text-primary">#$1:</span> $2</li>')
    
    // Format normal bullet lists
    .replace(/^-\s+(.+)$/gm, '<li class="ml-5 mb-3 list-disc">$1</li>')
    .replace(/^(\d+)\.\s+(.+)$/gm, '<li class="ml-5 mb-3 list-decimal">$2</li>')
    
    // Format text styling
    .replace(/\*\*([^*]+)\*\*/g, '<span class="font-semibold">$1</span>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    
    // Add proper paragraph spacing - double line breaks become new paragraphs
    .replace(/\n\n+/g, '</p><p class="mb-5">')
    
    // Handle single line breaks within paragraphs
    .replace(/\n(?!\n)/g, '<br />')
    
    // Format citation references 
    .replace(/\[(\d+)\]/g, '<sup class="text-xs text-primary border border-primary/30 rounded-sm px-1 ml-0.5">$1</sup>');

  // Wrap the processed content in proper HTML structure
  let wrappedContent = `<div class="space-y-5"><p class="mb-5">${processedOverview}</p></div>`;
  
  // Add proper list containers
  wrappedContent = wrappedContent
    // Add <ul> wrappers around groups of <li> elements with list-disc class
    .replace(/(<li class="ml-5 mb-3 list-disc">.*?)(?=<\/div>|<h[2-6]|<p class="mb-5">)/gs, '<ul class="my-4 space-y-1">$1</ul>')
    // Fix nested lists by ensuring </li> tags before </ul>
    .replace(/<\/li>(\s*)<\/ul>/g, '</li></ul>')
    // Replace any empty paragraphs that might have been created
    .replace(/<p class="mb-5"><\/p>/g, '')
    // Fix any duplicate <ul> tags
    .replace(/<ul class="my-4 space-y-1">(\s*)<ul class="my-4 space-y-1">/g, '<ul class="my-4 space-y-1">')
    // Fix any duplicate </ul> tags
    .replace(/<\/ul>(\s*)<\/ul>/g, '</ul>');

  return (
    <div className="space-y-6">
      <section>
        <div 
          className="prose prose-sm max-w-none text-sm leading-relaxed prose-headings:my-4 prose-p:my-3"
          dangerouslySetInnerHTML={{ __html: wrappedContent }}
        />
      </section>
      
      {currentBriefing.sources && currentBriefing.sources.length > 0 && (
        <>
          <Separator className="my-6" />
          
          <section>
            <h3 className="text-lg font-semibold mb-4">Fontes</h3>
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
