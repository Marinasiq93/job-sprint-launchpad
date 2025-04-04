
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
    
    // Format main headers (Title format)
    .replace(/^(.*?):\s*$/gm, '<h2 class="text-xl font-bold mt-8 mb-4 text-primary">$1</h2>')
    
    // Format section headers with better spacing
    .replace(/^###?\s+(.+)$/gm, '<h3 class="text-lg font-bold mt-6 mb-3 text-slate-800">$1</h3>')
    .replace(/^####?\s+(.+)$/gm, '<h4 class="text-base font-semibold mt-5 mb-2 text-slate-700">$1</h4>')
    
    // Bold section titles that aren't using markdown headers
    .replace(/^([A-Z][A-Za-záàâãéèêíïóôõöúçñ\s]{2,})$/gm, '<h3 class="text-lg font-bold mt-6 mb-3 text-slate-800">$1</h3>')
    
    // Format subsection titles that end with colon
    .replace(/^([A-Z][A-Za-záàâãéèêíïóôõöúçñ\s]{2,}):$/gm, '<h4 class="text-base font-semibold mt-5 mb-2 text-slate-700">$1:</h4>')
    
    // Enhance text formatting
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>') // Bold text
    .replace(/\*([^*]+)\*/g, '<em>$1</em>') // Italic text
    
    // Improve paragraph spacing
    .replace(/\n\n/g, '</p><p class="mb-4">')
    
    // Format lists with better spacing and bullets
    .replace(/^-\s+(.+)$/gm, '<li class="ml-6 mb-2 list-disc">$1</li>')
    .replace(/^(\d+)\.\s+(.+)$/gm, '<li class="ml-6 mb-2 list-decimal">$2</li>')
    
    // Handle line breaks within paragraphs
    .replace(/\n(?!\n)/g, '<br />')
    
    // Citations
    .replace(/\[(\d+)\]/g, '<sup class="text-xs text-blue-600">[$1]</sup>');

  // Wrap the processed content in a paragraph tag and add list containers
  let wrappedContent = `<p class="mb-4">${processedOverview}</p>`;
  
  // Add proper list containers
  wrappedContent = wrappedContent
    .replace(/(<li class="ml-6 mb-2 list-disc">.*?<\/li>)(?!\s*<li)/g, '<ul class="my-4">$1</ul>')
    .replace(/(<li class="ml-6 mb-2 list-decimal">.*?<\/li>)(?!\s*<li)/g, '<ol class="my-4">$1</ol>');

  return (
    <div className="space-y-4">
      <section className="mb-4">
        <div 
          className="prose prose-sm max-w-none text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: wrappedContent }}
        />
      </section>
      
      {currentBriefing.sources && currentBriefing.sources.length > 0 && (
        <>
          <Separator className="my-4" />
          
          <section className="pt-2">
            <h3 className="text-lg font-bold mb-3">Fontes</h3>
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
