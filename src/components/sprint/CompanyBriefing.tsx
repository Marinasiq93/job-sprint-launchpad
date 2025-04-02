
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Refresh, ExternalLink } from "lucide-react";

interface CompanyBriefingProps {
  companyName: string;
  companyWebsite: string;
  jobDescription: string;
}

const CompanyBriefing = ({ companyName, companyWebsite, jobDescription }: CompanyBriefingProps) => {
  const [briefing, setBriefing] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Temporary function to generate a fake briefing while we implement the Perplexity API
  const generateFakeBriefing = () => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const fakeBriefing = `
      ## Sobre a ${companyName}

      A ${companyName} é uma empresa inovadora que se destaca no mercado por seu compromisso com a excelência e foco no cliente. Fundada com a missão de transformar sua indústria, a empresa tem crescido consistentemente nos últimos anos.

      ## Cultura Organizacional

      A cultura da ${companyName} é baseada em três pilares fundamentais:
      1. **Inovação constante**: Busca por novas soluções e abordagens criativas
      2. **Colaboração**: Trabalho em equipe e comunicação aberta são valorizados
      3. **Desenvolvimento profissional**: Investimento no crescimento dos colaboradores

      ## Valores

      - Transparência
      - Responsabilidade
      - Excelência
      - Foco no cliente
      - Sustentabilidade

      ## Ambiente de Trabalho

      A empresa promove um ambiente dinâmico e inclusivo, onde as ideias são valorizadas e há espaço para crescimento pessoal e profissional.
      `;
      
      setBriefing(fakeBriefing);
      setLoading(false);
    }, 2000);
  };

  useEffect(() => {
    generateFakeBriefing();
  }, [companyName]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="bg-jobsprint-blue/5 border-b">
        <CardTitle className="text-lg font-semibold">Análise da Empresa</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow pt-4 overflow-auto max-h-[70vh]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className="animate-spin h-8 w-8 border-4 border-jobsprint-blue border-t-transparent rounded-full mb-4"></div>
            <p className="text-center text-muted-foreground">
              Analisando dados da {companyName}...
              <br />
              <span className="text-sm italic">Estamos consultando várias fontes para gerar um briefing completo</span>
            </p>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: briefing.replace(/\n/g, '<br />') }} />
            
            <Separator className="my-4" />
            
            <div>
              <h3 className="text-md font-medium mb-2">Fontes de Informação:</h3>
              <ul className="text-sm text-muted-foreground">
                <li className="flex items-center mb-1">
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Website oficial
                </li>
                <li className="flex items-center mb-1">
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Glassdoor
                </li>
                <li className="flex items-center">
                  <ExternalLink className="h-3 w-3 mr-2" />
                  LinkedIn
                </li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <Button
          variant="outline" 
          size="sm"
          onClick={generateFakeBriefing}
          disabled={loading}
        >
          <Refresh className="h-4 w-4 mr-2" />
          Atualizar análise
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(companyWebsite, '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Visitar site
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CompanyBriefing;
