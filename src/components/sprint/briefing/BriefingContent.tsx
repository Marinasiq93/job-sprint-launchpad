
import { Separator } from "@/components/ui/separator";
import { BriefingContent as BriefingContentType } from "./briefingService";
import { categoryTitles } from "./briefingConstants";
import { ExternalLink, AlertCircle, Loader2, Newspaper, Link as LinkIcon, Check } from "lucide-react";
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
        <h3 className="font-semibold text-sm flex items-center gap-1.5 text-gray-700 mb-2">
          <Badge variant="outline" className="bg-gray-50 text-gray-800 border-gray-200">
            {categoryTitles[currentCategory]}
          </Badge>
        </h3>
        <p className="text-sm">
          {currentBriefing.overview}
        </p>
      </section>
      
      <Separator />
      
      <section>
        <h3 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-1.5">
          <Check className="h-4 w-4 text-emerald-500" />
          Pontos Principais
        </h3>
        <ul className="text-sm space-y-2">
          {currentBriefing.highlights.map((highlight, index) => (
            <li key={index} className="flex items-start">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium mr-2 flex-shrink-0">
                {index + 1}
              </span>
              <span className={highlight.startsWith('"') ? "italic" : ""}>
                {highlight}
              </span>
            </li>
          ))}
        </ul>
      </section>
      
      <Separator />
      
      <section>
        <h3 className="font-medium text-sm text-gray-700 mb-2">Análise de Contexto</h3>
        <div className="text-sm bg-gray-50 p-3 rounded-md border border-gray-100">
          {currentBriefing.summary}
        </div>
      </section>
      
      {currentBriefing.recentNews && currentBriefing.recentNews.length > 0 && (
        <>
          <Separator />
          
          <section>
            <h3 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-1.5">
              <Newspaper className="h-4 w-4 text-blue-600" />
              Notícias Recentes
              <Badge variant="outline" className="ml-1 text-xs bg-blue-50 text-blue-700 border-blue-200">
                Atualizado
              </Badge>
            </h3>
            <ul className="text-sm space-y-2.5">
              {currentBriefing.recentNews.map((news, index) => (
                <li key={index} className="border-l-2 border-blue-200 pl-3 py-1 hover:border-blue-400 transition-colors">
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
                      <span className="text-xs text-muted-foreground mt-1 font-medium">
                        {news.date}
                      </span>
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
            <h3 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-1.5">
              <LinkIcon className="h-4 w-4 text-gray-600" />
              Fontes de Informação
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
