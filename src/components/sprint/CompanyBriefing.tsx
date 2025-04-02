
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
  currentQuestionIndex: number;
}

// Define content sections that will change based on the current question
const briefingSections = [
  // Question 0: "Por que você quer trabalhar nesta empresa..."
  {
    title: "Sobre a Empresa",
    content: (companyName: string) => `${companyName} é uma empresa de tecnologia focada em soluções inovadoras para o mercado. 
      Com uma cultura voltada para resultados e trabalho em equipe, a empresa valoriza
      a criatividade, a colaboração e o desenvolvimento contínuo de seus colaboradores.`,
    values: [
      "Foco em inovação e tecnologia de ponta",
      "Valorização do trabalho em equipe e colaboração",
      "Ambiente de trabalho flexível e dinâmico",
      "Compromisso com o desenvolvimento profissional",
      "Preocupação com o equilíbrio entre vida pessoal e profissional"
    ],
    purpose: `A missão da empresa é transformar a maneira como as pessoas interagem com a tecnologia,
      criando soluções que tornem o dia a dia mais simples e eficiente. Com um foco claro
      em sustentabilidade e responsabilidade social, a empresa busca não apenas crescer,
      mas também contribuir para um mundo melhor.`
  },
  // Question 1: "Quais valores da empresa se alinham..."
  {
    title: "Valores da Empresa",
    content: (companyName: string) => `${companyName} tem uma cultura organizacional forte, baseada em valores bem definidos.
      Estes valores norteiam todas as decisões e ações da empresa, desde o desenvolvimento
      de produtos até a relação com clientes e colaboradores.`,
    values: [
      "Inovação: busca constante por soluções criativas",
      "Integridade: transparência e ética em todas as relações",
      "Colaboração: trabalho em equipe e compartilhamento de conhecimento",
      "Excelência: compromisso com a qualidade e melhoria contínua",
      "Diversidade: valorização das diferenças e promoção da inclusão"
    ],
    purpose: `Ao conhecer e se alinhar aos valores da empresa, você demonstra
      que não está apenas procurando um emprego, mas sim uma organização cujos
      princípios se harmonizam com os seus. Isso é fundamental para uma relação
      de trabalho duradoura e satisfatória.`
  },
  // Question 2: "Como você se vê contribuindo para a missão e visão..."
  {
    title: "Missão e Visão",
    content: (companyName: string) => `A ${companyName} tem uma missão clara de transformar o setor em que atua,
      trazendo inovação e excelência para seus clientes. A visão de longo prazo
      inclui expandir sua atuação global e se tornar referência em tecnologia sustentável.`,
    values: [
      "Compromisso com a inovação tecnológica",
      "Expansão de mercado responsável",
      "Desenvolvimento de soluções sustentáveis",
      "Formação de líderes e talentos",
      "Impacto social positivo nas comunidades"
    ],
    purpose: `Contribuir para esta missão significa não apenas aplicar suas habilidades técnicas,
      mas também trazer novas perspectivas e ideias que ajudem a empresa a alcançar
      seus objetivos estratégicos. Sua contribuição pode impactar diretamente o crescimento
      e a direção futura da organização.`
  },
  // Question 3: "O que você conhece sobre o setor/indústria..."
  {
    title: "Setor e Tendências",
    content: (companyName: string) => `O setor em que a ${companyName} atua está em constante evolução,
      com novas tecnologias e tendências emergindo rapidamente. Demonstrar conhecimento
      sobre este cenário é fundamental para se destacar no processo seletivo.`,
    values: [
      "Transformação digital acelerada pós-pandemia",
      "Aumento da demanda por soluções em nuvem",
      "Crescente preocupação com segurança de dados",
      "Integração de inteligência artificial em processos",
      "Sustentabilidade como diferencial competitivo"
    ],
    purpose: `Compreender o contexto mais amplo do setor permite que você entenda
      os desafios e oportunidades que a empresa enfrenta. Isso demonstra que você
      não está apenas focado na função específica, mas entende como seu trabalho
      se conecta ao panorama mais amplo do mercado.`
  },
  // Question 4: "Como sua experiência anterior se relaciona..."
  {
    title: "Conexão de Experiências",
    content: (companyName: string) => `Relacionar suas experiências anteriores com a cultura da ${companyName}
      é uma forma poderosa de demonstrar que você não apenas possui as habilidades
      técnicas necessárias, mas também se adaptará bem ao ambiente da empresa.`,
    values: [
      "Projetos anteriores que demonstrem alinhamento cultural",
      "Contribuições para ambientes de trabalho colaborativos",
      "Experiências que mostrem adaptabilidade e aprendizado",
      "Iniciativas que reflitam valores similares aos da empresa",
      "Resultados que evidenciem compromisso com a excelência"
    ],
    purpose: `Ao fazer conexões claras entre suas experiências passadas e a cultura
      da empresa, você ajuda o recrutador a visualizar como você se encaixará na
      organização. Isso reduz o risco percebido na contratação e aumenta suas chances
      de sucesso no processo seletivo.`
  }
];

const CompanyBriefing = ({ companyName, companyWebsite, jobDescription, currentQuestionIndex }: CompanyBriefingProps) => {
  const [isLoading, setIsLoading] = useState(false);

  // Get the current briefing section based on the question index
  const currentBriefing = briefingSections[currentQuestionIndex] || briefingSections[0];

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
            <h3 className="font-medium text-sm text-muted-foreground mb-2">{currentBriefing.title}</h3>
            <p className="text-sm">
              {currentBriefing.content(companyName)}
            </p>
          </section>
          
          <Separator />
          
          <section>
            <h3 className="font-medium text-sm text-muted-foreground mb-2">Cultura e Valores</h3>
            <ul className="text-sm space-y-1 list-disc pl-5">
              {currentBriefing.values.map((value, index) => (
                <li key={index}>{value}</li>
              ))}
            </ul>
          </section>
          
          <Separator />
          
          <section>
            <h3 className="font-medium text-sm text-muted-foreground mb-2">Destaques do Propósito</h3>
            <p className="text-sm">
              {currentBriefing.purpose}
            </p>
          </section>
        </div>
      </CardContent>
    </div>
  );
};

export default CompanyBriefing;
