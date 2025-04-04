
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
    // Apply adaptive formatting regardless of the structure
    
    // Format headings - handle multiple heading patterns
    // Main headers pattern 1: Capitalized text at the beginning of a line
    .replace(/^([A-Z][A-Z\s]{2,})(?:\s*:|\s*$)/gm, 
      '<h2 class="text-xl font-bold mt-8 mb-3 text-slate-900 border-b pb-2">$1</h2>')
    
    // Main headers pattern 2: markdown style headers
    .replace(/^###\s+(.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-3 text-slate-900 border-b pb-2">$1</h2>')
    .replace(/^##\s+(.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-3 text-slate-900 border-b pb-2">$1</h2>')
    .replace(/^#\s+(.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-3 text-slate-900 border-b pb-2">$1</h2>')
    
    // Subheaders pattern 1: Sentence case followed by colon
    .replace(/^([A-Z][a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]{2,}):(?!\S)/gm, 
      '<h3 class="text-lg font-semibold mt-6 mb-2 text-slate-800">$1</h3>')
    
    // Subheaders pattern 2: Capitalized short phrases (3-4 words) at line start
    .replace(/^([A-Z][a-zA-Z]+(?:\s+[A-Za-z]+){0,3})(?:\s*-|\s*:|\s*$)(?!\S)/gm, 
      (match, p1) => {
        // Don't format if it's likely part of a sentence (next char is lowercase)
        const nextCharIsLowerCase = match.match(/[a-z]$/);
        return nextCharIsLowerCase ? match : `<h3 class="text-lg font-semibold mt-6 mb-2 text-slate-800">${p1}</h3>`;
      })
    
    // Format lists adaptively
    // Bullet items with dash
    .replace(/^[-–•]\s+(.+)$/gm, '<li class="ml-5 my-2 list-disc">$1</li>')
    
    // Numbered lists
    .replace(/^(\d+)[.)]\s+(.+)$/gm, '<li class="ml-5 my-2 list-decimal">$2</li>')
    
    // Format hashtags nicely regardless of where they appear
    .replace(/#([A-Za-z0-9]+)(?:\s*:|-)\s*(.+?)(?=$|\n)/gm, 
      '<li class="ml-5 my-2 list-disc"><span class="font-semibold text-primary">#$1:</span> $2</li>')
    
    // Corporate value patterns (usually single capitalized words ending in common suffixes)
    .replace(/^([A-Z][a-z]+(?:dade|ção|cia|edade|ismo|ade|eza|tude|ança))(?:\s*:|,|\s*-|\s*$)/gm, 
      '<li class="ml-5 my-2 list-disc font-semibold text-slate-700">$1</li>')
    
    // Format quoted text for better visibility
    .replace(/"([^"]+)"(?!\s*")/g, '<p class="ml-5 mb-3 italic text-slate-600">"$1"</p>')
    
    // Formatting for citations or references
    .replace(/\[(\d+)\]/g, '<sup class="text-xs font-medium bg-primary/10 text-primary border border-primary/30 rounded-sm px-1 ml-0.5">$1</sup>')
    
    // Bold and italic text
    .replace(/\*\*([^*]+)\*\*/g, '<span class="font-bold">$1</span>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    
    // Ensure proper paragraph spacing
    .replace(/\n\n+/g, '</p><p class="mb-5">')
    
    // Fix paragraph spacing after headings
    .replace(/<\/h[23]>\s*<p/g, '</h2><p class="mt-3"')
    
    // Convert URLs to links
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>');

  // Wrap the processed content with correct HTML structure
  let wrappedContent = `<div class="space-y-6"><p class="mb-5">${processedOverview}</p></div>`;
  
  // Handle list containers adaptively
  wrappedContent = wrappedContent
    // Add <ul> wrappers around groups of <li> elements
    .replace(/(<li class="ml-5 m[by]-[23] list-disc">.*?)(?=<\/div>|<h[2-6]|<p class="mb-5">)/gs, '<ul class="my-4 space-y-2">$1</ul>')
    .replace(/(<li class="ml-5 m[by]-[23] list-decimal">.*?)(?=<\/div>|<h[2-6]|<p class="mb-5">)/gs, '<ol class="my-4 space-y-2">$1</ol>')
    
    // Fix closing tags
    .replace(/<\/li>(\s*)<\/ul>/g, '</li></ul>')
    .replace(/<\/li>(\s*)<\/ol>/g, '</li></ol>')
    
    // Fix empty paragraphs
    .replace(/<p class="mb-5"><\/p>/g, '')
    
    // Fix nested list issues
    .replace(/<(ul|ol) class="my-4 space-y-2">(\s*)<\1 class="my-4 space-y-2">/g, '<$1 class="my-4 space-y-2">')
    .replace(/<\/(ul|ol)>(\s*)<\/\1>/g, '</$1>');

  return (
    <div className="space-y-6 px-1">
      <section>
        <div 
          className="prose prose-sm max-w-none text-sm leading-relaxed prose-headings:my-4 prose-p:my-3 prose-li:my-1"
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
