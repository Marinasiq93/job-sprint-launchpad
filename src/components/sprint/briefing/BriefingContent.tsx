
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

  // Format the content with enhanced styling for headers and spacing
  const formatContent = (content: string) => {
    if (!content) return '';
    
    // Create a temporary element to hold the content
    const tempDiv = document.createElement('div');
    
    // Replace markdown headers with HTML elements with added classes for better styling
    let formatted = content
      // Replace headers with HTML tags with appropriate classes
      .replace(/#{4,}\s+([^\n]+)/g, '<h4 class="text-lg font-semibold mt-6 mb-3">$1</h4>')
      .replace(/#{3}\s+([^\n]+)/g, '<h3 class="text-xl font-semibold mt-8 mb-4">$1</h3>') 
      .replace(/#{2}\s+([^\n]+)/g, '<h2 class="text-2xl font-semibold mt-10 mb-4">$1</h2>')
      .replace(/#{1}\s+([^\n]+)/g, '<h1 class="text-3xl font-bold mt-10 mb-5">$1</h1>')
      
      // Format section headers in all caps with styling
      .replace(/^([A-Z][A-Z\s]{2,}:?)(\s*)/gm, '<h3 class="text-xl font-semibold mt-8 mb-4">$1</h3>')
      
      // Format capitalized CamelCase headers (like ProductName:)
      .replace(/^([A-Z][a-z]+(?:[A-Z][a-z]+)+:)(\s*)/gm, '<h4 class="text-lg font-semibold mt-6 mb-3">$1</h4>')
      
      // Format bold and italic text
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/_([^_]+)_/g, '<em>$1</em>')
      
      // Add spacing between paragraphs
      .replace(/\n\n+/g, '</p><p class="mb-4">')
      
      // Convert URLs to links
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>')
      
      // Format bullet lists with proper spacing
      .replace(/^[-–•]\s+(.+)$/gm, '<li class="ml-4 mb-2">$1</li>')
      .replace(/(<li[^>]*>.*<\/li>\n)<li/g, '$1<li')  // Group list items
      .replace(/(<li[^>]*>.*<\/li>\n)(?!<li)/g, '$1</ul>\n')  // Close list
      .replace(/(?<!<ul>\n)(<li)/g, '<ul class="list-disc mb-4">\n$1')  // Open list
      
      // Format numbered lists
      .replace(/^(\d+)[.)]\s+(.+)$/gm, '<li class="ml-4 mb-2">$2</li>')
      .replace(/(<li[^>]*>.*<\/li>\n)(?!<li)/g, '$1</ol>\n')  // Close numbered list
      .replace(/(?<!<ol>\n)(<li)/g, '<ol class="list-decimal mb-4">\n$1');  // Open numbered list
    
    // Wrap in paragraph tags if needed
    if (!formatted.startsWith('<')) {
      formatted = '<p class="mb-4">' + formatted;
    }
    if (!formatted.endsWith('>')) {
      formatted += '</p>';
    }
    
    return formatted;
  };
  
  // Format the content
  const formattedContent = formatContent(currentBriefing.overview);

  return (
    <div className="space-y-6 px-1">
      <section className="overflow-auto">
        <div 
          className="prose prose-sm max-w-none text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />
      </section>
      
      {currentBriefing.sources && currentBriefing.sources.length > 0 && (
        <>
          <Separator className="my-8" />
          
          <section>
            <h3 className="text-xl font-semibold mb-5">Fontes</h3>
            <div className="space-y-3">
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

      {currentBriefing.recentNews && currentBriefing.recentNews.length > 0 && (
        <>
          <Separator className="my-8" />
          
          <section>
            <h3 className="text-xl font-semibold mb-5">Notícias Recentes</h3>
            <div className="space-y-3">
              {currentBriefing.recentNews.map((news, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-medium mr-2 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {news.url ? (
                        <a 
                          href={news.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:text-blue-600"
                        >
                          {news.title}
                        </a>
                      ) : (
                        news.title
                      )}
                    </div>
                    {news.date && <div className="text-xs text-muted-foreground">{news.date}</div>}
                  </div>
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
