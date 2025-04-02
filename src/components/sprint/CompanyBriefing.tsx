
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RefreshCw } from "lucide-react";

interface CompanyBriefingProps {
  companyName: string;
  companyWebsite: string;
  jobDescription: string;
}

const CompanyBriefing = ({ companyName, companyWebsite, jobDescription }: CompanyBriefingProps) => {
  const [isLoading, setIsLoading] = useState(false);

  // This is a placeholder function for refreshing the company analysis
  // In the future, this will call the Perplexity API
  const handleRefreshAnalysis = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col">
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
                  onClick={handleRefreshAnalysis}
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
      <CardContent className="flex-1 overflow-auto">
        <div className="space-y-4">
          <section>
            <h3 className="font-medium text-sm text-muted-foreground mb-2">Sobre a Empresa</h3>
            <p className="text-sm">
              {companyName} é uma empresa de tecnologia focada em soluções inovadoras para o mercado.
              Com uma cultura voltada para resultados e trabalho em equipe, a empresa valoriza
              a criatividade, a colaboração e o desenvolvimento contínuo de seus colaboradores.
            </p>
          </section>
          
          <Separator />
          
          <section>
            <h3 className="font-medium text-sm text-muted-foreground mb-2">Cultura e Valores</h3>
            <ul className="text-sm space-y-1 list-disc pl-5">
              <li>Foco em inovação e tecnologia de ponta</li>
              <li>Valorização do trabalho em equipe e colaboração</li>
              <li>Ambiente de trabalho flexível e dinâmico</li>
              <li>Compromisso com o desenvolvimento profissional</li>
              <li>Preocupação com o equilíbrio entre vida pessoal e profissional</li>
            </ul>
          </section>
          
          <Separator />
          
          <section>
            <h3 className="font-medium text-sm text-muted-foreground mb-2">Destaques do Propósito</h3>
            <p className="text-sm">
              A missão da empresa é transformar a maneira como as pessoas interagem com a tecnologia,
              criando soluções que tornem o dia a dia mais simples e eficiente. Com um foco claro
              em sustentabilidade e responsabilidade social, a empresa busca não apenas crescer,
              mas também contribuir para um mundo melhor.
            </p>
          </section>
        </div>
      </CardContent>
    </div>
  );
};

export default CompanyBriefing;
