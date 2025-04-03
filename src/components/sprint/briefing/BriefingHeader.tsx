
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RefreshCw, InfoIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BriefingHeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
  isApiAvailable?: boolean;
}

const BriefingHeader = ({ onRefresh, isLoading, isApiAvailable }: BriefingHeaderProps) => {
  return (
    <CardHeader className="pb-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-medium">Análise da Empresa</CardTitle>
          {isApiAvailable === false && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1">
                    <InfoIcon className="h-3 w-3" /> 
                    Demo
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Conteúdo de demonstração. Configure a API Perplexity para análises detalhadas.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Atualizar análise</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </CardHeader>
  );
};

export default BriefingHeader;
