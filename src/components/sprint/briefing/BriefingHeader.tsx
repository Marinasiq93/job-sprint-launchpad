
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RefreshCw } from "lucide-react";

interface BriefingHeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
}

const BriefingHeader = ({ onRefresh, isLoading }: BriefingHeaderProps) => {
  return (
    <CardHeader className="pb-3">
      <div className="flex justify-between items-center">
        <CardTitle className="text-lg font-medium">Análise da Empresa</CardTitle>
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
