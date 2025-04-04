
import { Separator } from "@/components/ui/separator";
import { BriefingContent as BriefingContentType } from "./types";
import { categoryTitles, BRIEFING_CATEGORIES } from "./briefingConstants";
import { ExternalLink, AlertCircle, Loader2, Newspaper, Link as LinkIcon, Check, Target } from "lucide-react";
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

  // Clean and process the overview content to handle markdown formatting and remove the "Visão Geral da [COMPANY]" text
  const processedOverview = currentBriefing.overview
    .replace(/## Visão Geral d[aeo]s? [^\n]+\n?/i, '') // Remove the header if it exists
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') // Bold text
    .replace(/\[(\d+)\]/g, '<sup>[$1]</sup>'); // Citations

  // Customize section titles based on category
  const getHighlightTitle = () => {
    switch(currentCategory) {
      case BRIEFING_CATEGORIES.CULTURE_VALUES:
        return "Valores da Empresa";
      case BRIEFING_CATEGORIES.MISSION_VISION:
        return "Propósito e Direção";
      case BRIEFING_CATEGORIES.LEADERSHIP:
        return "Equipe de Liderança";
      case BRIEFING_CATEGORIES.PRODUCT_MARKET:
        return "Perfil do Produto e Cliente";
      case BRIEFING_CATEGORIES.COMPANY_HISTORY:
        return "Marcos Históricos";
      default:
        return "Destaques";
    }
  };

  // Customize summary title based on category
  const getSummaryTitle = () => {
    switch(currentCategory) {
      case BRIEFING_CATEGORIES.MISSION_VISION:
        return "Realizações e Impacto";
      case BRIEFING_CATEGORIES.CULTURE_VALUES:
        return "Análise de Cultura";
      case BRIEFING_CATEGORIES.PRODUCT_MARKET:
        return "Posição no Mercado";
      case BRIEFING_CATEGORIES.LEADERSHIP:
        return "Estilo de Liderança";
      case BRIEFING_CATEGORIES.COMPANY_HISTORY:
        return "Trajetória Empresarial";
      default:
        return "Análise Geral";
    }
  };

  // Icon for highlights section based on category
  const getHighlightIcon = () => {
    switch(currentCategory) {
      case BRIEFING_CATEGORIES.MISSION_VISION:
        return <Target className="h-4 w-4 text-purple-600" />;
      case BRIEFING_CATEGORIES.CULTURE_VALUES:
        return <Check className="h-4 w-4 text-emerald-500" />;
      default:
        return <Check className="h-4 w-4 text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <section>
        <h3 className="font-semibold text-sm flex items-center gap-1.5 text-gray-700 mb-2">
          <Badge variant="outline" className="bg-gray-50 text-gray-800 border-gray-200">
            {categoryTitles[currentCategory]}
          </Badge>
        </h3>
        <div 
          className="text-sm mb-2 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: processedOverview }}
        />
      </section>
      
      {currentBriefing.highlights && currentBriefing.highlights.length > 0 && (
        <>
          <Separator />
          
          <section>
            <h3 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-1.5">
              {getHighlightIcon()}
              {getHighlightTitle()}
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
        </>
      )}
      
      <Separator />
      
      <section>
        <h3 className="font-medium text-sm text-gray-700 mb-2">{getSummaryTitle()}</h3>
        <div className="text-sm bg-gray-50 p-3 rounded-md border border-gray-100 leading-relaxed">
          {currentBriefing.summary}
        </div>
        {currentCategory === BRIEFING_CATEGORIES.MISSION_VISION && currentBriefing.additionalPoints && (
          <ul className="text-sm space-y-1.5 mt-3">
            {currentBriefing.additionalPoints.map((point, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium mr-2 flex-shrink-0">
                  {index + 1}
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      
      {currentBriefing.sources && currentBriefing.sources.length > 0 && (
        <>
          <Separator />
          
          <section>
            <h3 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-1.5">
              <LinkIcon className="h-4 w-4 text-gray-600" />
              Fontes
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
