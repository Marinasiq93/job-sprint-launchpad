
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Clock, CheckCircle2 } from "lucide-react";

interface User {
  firstName: string;
  lastName: string;
  email: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (for demo only)
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }

    // Parse user data
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-10 h-10 jobsprint-gradient-bg animate-spin rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Carregando...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">
            Olá, {user?.firstName}!
          </h1>
          <p className="text-gray-500 mt-1">
            Bem-vindo ao seu dashboard de sprints de candidatura
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Sprints Ativas</CardTitle>
              <CardDescription>Processos em andamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-jobsprint-blue">0</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Candidaturas</CardTitle>
              <CardDescription>Total de candidaturas enviadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-jobsprint-pink">0</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Entrevistas</CardTitle>
              <CardDescription>Entrevistas agendadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">0</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Minhas Sprints</CardTitle>
                <CardDescription>
                  Organize suas candidaturas em sprints focadas
                </CardDescription>
              </div>
              <Button 
                onClick={() => navigate('/dashboard/new-sprint')}
                className="bg-jobsprint-blue hover:bg-jobsprint-blue/90"
              >
                <Plus className="h-4 w-4 mr-2" /> Nova Sprint
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium">Nenhuma sprint iniciada</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Inicie sua primeira sprint de candidatura para organizar melhor sua busca por emprego.
              </p>
              <Button 
                onClick={() => navigate('/dashboard/new-sprint')}
                variant="outline"
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" /> Iniciar primeira sprint
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Próximos Passos</CardTitle>
              <CardDescription>Ações recomendadas para você</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex">
                  <div className="mr-4 mt-1">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">Criar conta</p>
                    <p className="text-sm text-gray-500">Você já criou sua conta com sucesso!</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="mr-4 mt-1">
                    <Clock className="h-5 w-5 text-jobsprint-blue" />
                  </div>
                  <div>
                    <p className="font-medium">Iniciar uma sprint</p>
                    <p className="text-sm text-gray-500">Crie sua primeira sprint para organizar suas candidaturas.</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="mr-4 mt-1">
                    <Clock className="h-5 w-5 text-jobsprint-blue" />
                  </div>
                  <div>
                    <p className="font-medium">Completar seu perfil</p>
                    <p className="text-sm text-gray-500">Adicione mais informações ao seu perfil profissional.</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dicas para Candidaturas</CardTitle>
              <CardDescription>Melhore suas chances de sucesso</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="space-y-1">
                  <h4 className="font-medium">Personalize seu currículo</h4>
                  <p className="text-sm text-gray-500">
                    Adapte seu currículo para cada vaga, destacando experiências relevantes.
                  </p>
                </li>
                <li className="space-y-1">
                  <h4 className="font-medium">Prepare-se para entrevistas</h4>
                  <p className="text-sm text-gray-500">
                    Pesquise sobre a empresa e prepare respostas para perguntas comuns.
                  </p>
                </li>
                <li className="space-y-1">
                  <h4 className="font-medium">Defina metas realistas</h4>
                  <p className="text-sm text-gray-500">
                    Estabeleça objetivos claros para cada sprint de candidatura.
                  </p>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
