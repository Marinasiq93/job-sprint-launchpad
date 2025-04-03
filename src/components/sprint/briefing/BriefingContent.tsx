
import { Separator } from "@/components/ui/separator";
import { BriefingContent as BriefingContentType } from "./briefingService";
import { categoryTitles } from "./briefingConstants";
import { ExternalLink, AlertCircle, Loader2, Newspaper } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

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

  return (
    <div className="space-y-4">
      <section>
        <h3 className="font-medium text-sm text-muted-foreground mb-2">{categoryTitles[currentCategory]}</h3>
        <p className="text-sm">
          {currentBriefing.overview}
        </p>
      </section>
      
      <Separator />
      
      <section>
        <h3 className="font-medium text-sm text-muted-foreground mb-2">Pontos Principais</h3>
        <ul className="text-sm space-y-1 list-disc pl-5">
          {currentBriefing.highlights.map((highlight, index) => (
            <li key={index}>{highlight}</li>
          ))}
        </ul>
      </section>
      
      <Separator />
      
      <section>
        <h3 className="font-medium text-sm text-muted-foreground mb-2">Análise de Contexto</h3>
        <p className="text-sm">
          {currentBriefing.summary}
        </p>
      </section>
      
      {currentBriefing.recentNews && currentBriefing.recentNews.length > 0 && (
        <>
          <Separator />
          
          <section>
            <h3 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-1">
              <Newspaper className="h-4 w-4" />
              Notícias Recentes
              <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200">Novo</Badge>
            </h3>
            <ul className="text-sm space-y-2">
              {currentBriefing.recentNews.map((news, index) => (
                <li key={index} className="border-l-2 border-blue-200 pl-3 py-1">
                  <div className="flex flex-col">
                    <div>
                      {news.url ? (
                        <a 
                          href={news.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                        >
                          <span>{news.title}</span>
                          <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                        </a>
                      ) : (
                        <span className="font-medium">{news.title}</span>
                      )}
                    </div>
                    {news.date && (
                      <span className="text-xs text-muted-foreground mt-1">{news.date}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
      
      {currentBriefing.sources && currentBriefing.sources.length > 0 && (
        <>
          <Separator />
          
          <section>
            <h3 className="font-medium text-sm text-muted-foreground mb-2">Fontes de Informação</h3>
            <ul className="text-sm space-y-2">
              {currentBriefing.sources.map((source, index) => (
                <li key={index} className="flex items-start">
                  <ExternalLink className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-muted-foreground" />
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {source.title || source.url}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
};

export default BriefingContent;
