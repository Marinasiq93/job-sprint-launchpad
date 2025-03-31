
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Clipboard, Info } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const NewSprint = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // Default to 2 weeks from now
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success("Sprint criada com sucesso!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Erro ao criar sprint. Tente novamente.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Nova Sprint de Candidatura</h1>
          <p className="text-gray-500 mt-1">
            Configure uma nova sprint para organizar suas candidaturas
          </p>
        </div>

        <Alert className="bg-blue-50 text-blue-800 border-blue-200">
          <Info className="h-4 w-4" />
          <AlertTitle>O que é uma Sprint?</AlertTitle>
          <AlertDescription>
            Uma sprint é um período de tempo definido (geralmente 2 semanas) com objetivos específicos para sua busca de emprego, como número de candidaturas, networking e preparação para entrevistas.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Sprint</CardTitle>
              <CardDescription>
                Defina os parâmetros básicos da sua sprint de candidatura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sprint-name">Nome da Sprint*</Label>
                  <Input 
                    id="sprint-name" 
                    placeholder="Ex: Vagas de Desenvolvedor Front-end" 
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Dê um nome descritivo que identifique o foco desta sprint
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sprint-description">Descrição</Label>
                  <Textarea
                    id="sprint-description"
                    placeholder="Descreva o objetivo desta sprint..."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Foco da Sprint*</Label>
                    <Select defaultValue="applications">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o foco" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="applications">Candidaturas</SelectItem>
                        <SelectItem value="interviews">Entrevistas</SelectItem>
                        <SelectItem value="networking">Networking</SelectItem>
                        <SelectItem value="skills">Desenvolvimento de habilidades</SelectItem>
                        <SelectItem value="mixed">Misto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Data de Término*</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? (
                            format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          disabled={(day) => day < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="target-applications">Meta de Candidaturas</Label>
                  <Input 
                    id="target-applications" 
                    type="number" 
                    min="1"
                    max="100"
                    placeholder="Ex: 10" 
                    defaultValue="10"
                  />
                  <p className="text-xs text-gray-500">
                    Quantas candidaturas você pretende enviar durante esta sprint
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clipboard className="mr-2 h-5 w-5 text-jobsprint-blue" />
                Configurações Adicionais
              </CardTitle>
              <CardDescription>
                Personalize sua experiência de sprint
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sprint-focus-area">Área de Interesse</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a área" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tech">Tecnologia</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="sales">Vendas</SelectItem>
                      <SelectItem value="engineering">Engenharia</SelectItem>
                      <SelectItem value="hr">RH</SelectItem>
                      <SelectItem value="other">Outra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sprint-priority">Prioridade</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sprint-notes">Notas Pessoais</Label>
                  <Textarea
                    id="sprint-notes"
                    placeholder="Adicione qualquer nota pessoal sobre esta sprint..."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-jobsprint-blue hover:bg-jobsprint-blue/90"
              disabled={isLoading}
            >
              {isLoading ? "Criando..." : "Criar Sprint"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NewSprint;
