
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
    // Convert double newlines to temporary markers for paragraph splitting
    .replace(/\n\n+/g, '§PARAGRAPH§')
    
    // Format markdown headers while preventing duplicates
    .replace(/^#+\s+(.+)$/gm, (match, headerText) => {
      // Check if the header text appears in the preceding text (as a possible duplicate)
      const precedingContext = currentBriefing.overview.split(match)[0].trim();
      const lastLine = precedingContext.split('\n').pop() || '';
      
      // If this header text is similar to the previous line, don't add another heading
      if (lastLine.toUpperCase() === headerText.toUpperCase() || 
          lastLine.toUpperCase().includes(headerText.toUpperCase()) ||
          headerText.toUpperCase().includes(lastLine.toUpperCase())) {
        return `<p class="mt-4 font-medium">${headerText}</p>`;
      }
      return `<h2 class="text-xl font-bold mt-8 mb-3 text-slate-900 border-b pb-2">${headerText}</h2>`;
    })
    
    // Format capitalized headers while preventing duplicates
    .replace(/^([A-Z][A-Z\s]{2,})(?:\s*:|\s*$)/gm, (match, headerText) => {
      // Get preceding context to check for duplicates
      const precedingContext = currentBriefing.overview.split(match)[0].trim();
      const lastLine = precedingContext.split('\n').pop() || '';
      
      // If this is similar to a previous line, don't add another heading
      if (lastLine.toUpperCase() === headerText.toUpperCase() || 
          lastLine.toUpperCase().includes(headerText.toUpperCase()) ||
          headerText.toUpperCase().includes(lastLine.toUpperCase())) {
        return `<p class="mt-4 font-medium">${headerText}</p>`;
      }
      return `<h2 class="text-xl font-bold mt-8 mb-3 text-slate-900 border-b pb-2">${headerText}</h2>`;
    })
    
    // Format subheaders
    .replace(/^([A-Z][a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]{2,}):(?!\S)/gm, 
      '<h3 class="text-lg font-semibold mt-6 mb-2 text-slate-800">$1</h3>')
    
    // Format capitalized short phrases (3-4 words) at line start that might be subheaders
    .replace(/^([A-Z][a-zA-Z]+(?:\s+[A-Za-z]+){0,3})(?:\s*-|\s*:|\s*$)(?!\S)/gm, 
      (match, p1) => {
        // Don't format if it's likely part of a sentence (next char is lowercase)
        const nextCharIsLowerCase = match.match(/[a-z]$/);
        return nextCharIsLowerCase ? match : `<h3 class="text-lg font-semibold mt-6 mb-2 text-slate-800">${p1}</h3>`;
      })
    
    // Format lists adaptively
    .replace(/^[-–•]\s+(.+)$/gm, '<li class="ml-5 my-1.5 list-disc">$1</li>')
    .replace(/^(\d+)[.)]\s+(.+)$/gm, '<li class="ml-5 my-1.5 list-decimal">$2</li>')
    
    // Format hashtags
    .replace(/#([A-Za-z0-9]+)(?:\s*:|-)\s*(.+?)(?=$|\n)/gm, 
      '<div class="ml-5 my-2"><span class="font-semibold text-primary">#$1:</span> $2</div>')
    
    // Format value words (capitalized words with common value suffixes)
    .replace(/^([A-Z][a-z]+(?:dade|ção|cia|edade|ismo|ade|eza|tude|ança))(?:\s*:|,|\s*-|\s*$)/gm, 
      '<li class="ml-5 my-1.5 list-disc font-semibold text-slate-700">$1</li>')
    
    // Format quoted text
    .replace(/"([^"]+)"(?!\s*")/g, '<p class="ml-3 my-2 italic text-slate-600">"$1"</p>')
    
    // Format citations or references
    .replace(/\[(\d+)\]/g, '<sup class="text-xs font-medium bg-primary/10 text-primary border border-primary/30 rounded-sm px-1 ml-0.5">$1</sup>')
    
    // Format bold and italic text
    .replace(/\*\*([^*]+)\*\*/g, '<span class="font-bold">$1</span>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    
    // Convert URLs to links
    .replace(/(https?:\/\/[^\s]+)/g, 
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>')
    
    // Restore paragraphs
    .replace(/§PARAGRAPH§/g, '</p><p class="mb-4">');

  // Wrap the processed content with correct HTML structure
  let wrappedContent = `<div class="space-y-2"><p class="mb-4">${processedOverview}</p></div>`;
  
  // Handle list containers adaptively
  wrappedContent = wrappedContent
    // Add <ul> wrappers around groups of <li> elements with list-disc class
    .replace(/(<li class="ml-5 my-1\.5 list-disc">.*?)(?=<\/p>|<\/div>|<h[2-6]|<p class="mb-4">)/gs, '<ul class="my-3 space-y-1">$1</ul>')
    
    // Add <ol> wrappers around groups of <li> elements with list-decimal class
    .replace(/(<li class="ml-5 my-1\.5 list-decimal">.*?)(?=<\/p>|<\/div>|<h[2-6]|<p class="mb-4">)/gs, '<ol class="my-3 space-y-1">$1</ol>')
    
    // Fix closing tags
    .replace(/<\/li>(\s*)<\/ul>/g, '</li></ul>')
    .replace(/<\/li>(\s*)<\/ol>/g, '</li></ol>')
    
    // Fix empty paragraphs
    .replace(/<p class="mb-4"><\/p>/g, '')
    
    // Fix nested list issues
    .replace(/<(ul|ol) class="my-3 space-y-1">(\s*)<\1 class="my-3 space-y-1">/g, '<$1 class="my-3 space-y-1">')
    .replace(/<\/(ul|ol)>(\s*)<\/\1>/g, '</$1>');

  return (
    <div className="space-y-6 px-1">
      <section>
        <div 
          className="prose prose-sm max-w-none text-sm leading-relaxed prose-headings:my-4 prose-p:my-2 prose-li:my-0.5"
          dangerouslySetInnerHTML={{ __html: wrappedContent }}
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
