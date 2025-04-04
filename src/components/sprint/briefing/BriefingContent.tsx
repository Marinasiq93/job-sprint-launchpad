
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
      
      // Format section headers in all caps with styling - be more specific to avoid false positives
      // Only match lines that are ENTIRELY in uppercase with minimum 3 chars
      .replace(/^([A-Z][A-Z\s]{2,}[A-Z]:?)$/gm, '<h3 class="text-xl font-semibold mt-8 mb-4">$1</h3>')
      
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
      
      // Improve bullet list formatting with proper spacing - make this more robust to catch common bullet formats
      // First enhance detection of different bullet markers, including the hyphen with or without space
      .replace(/^[-–•]\s+(.+)$/gm, '<li class="ml-6 mb-2 list-disc">$1</li>')
      // Also catch hyphen without space
      .replace(/^[-]([^\s].+)$/gm, '<li class="ml-6 mb-2 list-disc">$1</li>')
      
      // Improve numbered list detection and formatting
      // First wrap each numbered item in proper <li> with ordered styling
      .replace(/^(\d+)[.):]\s+(.+)$/gm, '<li class="ml-6 mb-2 list-decimal" value="$1">$2</li>')
      
      // Group list items together - both bullet and numbered
      // Find sequences of list items and wrap them in appropriate container
      .replace(/(<li class="ml-6 mb-2 list-disc">[^<]*<\/li>\n)(<li class="ml-6 mb-2 list-disc">[^<]*<\/li>)/g, '$1$2')
      .replace(/(<li class="ml-6 mb-2 list-decimal"[^>]*>[^<]*<\/li>\n)(<li class="ml-6 mb-2 list-decimal"[^>]*>[^<]*<\/li>)/g, '$1$2');
    
    // Now wrap consecutive bullet list items in <ul> tags
    let listProcessed = '';
    let inBulletList = false;
    let inNumberedList = false;
    
    // Split by lines to process lists properly
    const lines = formatted.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this line is a bullet list item
      if (line.includes('<li class="ml-6 mb-2 list-disc">')) {
        if (!inBulletList) {
          // Start a new bullet list
          listProcessed += '<ul class="my-4 space-y-2">\n';
          inBulletList = true;
        }
        listProcessed += line + '\n';
      } 
      // Check if this line is a numbered list item
      else if (line.includes('<li class="ml-6 mb-2 list-decimal"')) {
        if (!inNumberedList) {
          // Start a new numbered list
          listProcessed += '<ol class="my-4 space-y-2">\n';
          inNumberedList = true;
        }
        listProcessed += line + '\n';
      }
      // This line is not a list item
      else {
        // If we were in a bullet list, close it
        if (inBulletList) {
          listProcessed += '</ul>\n';
          inBulletList = false;
        }
        // If we were in a numbered list, close it
        if (inNumberedList) {
          listProcessed += '</ol>\n';
          inNumberedList = false;
        }
        listProcessed += line + '\n';
      }
    }
    
    // Close any open lists at the end
    if (inBulletList) {
      listProcessed += '</ul>\n';
    }
    if (inNumberedList) {
      listProcessed += '</ol>\n';
    }
    
    formatted = listProcessed;
    
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
