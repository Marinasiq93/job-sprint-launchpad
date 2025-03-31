
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 border-b">
        <div className="container flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full jobsprint-gradient-bg flex items-center justify-center">
              <span className="text-white font-bold">JS</span>
            </div>
            <h1 className="text-xl font-bold">JobSprints</h1>
          </div>
          <div className="flex space-x-4">
            <Link to="/login">
              <Button variant="outline">Entrar</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-jobsprint-blue hover:bg-jobsprint-blue/90">Criar Conta</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-4xl font-bold leading-tight">
                Transforme sua busca de emprego em 
                <span className="jobsprint-gradient-text"> sprints produtivos</span>
              </h1>
              <p className="text-lg text-gray-600">
                Prepare-se para processos seletivos com um método estruturado que aumenta suas chances de sucesso.
              </p>
              <div className="pt-4">
                <Link to="/signup">
                  <Button size="lg" className="bg-jobsprint-blue hover:bg-jobsprint-blue/90">
                    Comece Agora
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-lg relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 rounded-full jobsprint-gradient-bg flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold">JobSprints</h3>
                  <p className="text-gray-600 mt-2">Estruture sua busca de emprego em etapas claras e objetivas</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="p-6 border rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-jobsprint-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Organize documentos</h3>
              <p className="text-gray-600">Mantenha seus currículos e cartas organizados para cada candidatura.</p>
            </div>
            <div className="p-6 border rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-jobsprint-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Acompanhe sprints</h3>
              <p className="text-gray-600">Defina sprints de candidatura com metas claras e prazos definidos.</p>
            </div>
            <div className="p-6 border rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-jobsprint-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Alcance resultados</h3>
              <p className="text-gray-600">Aumente suas chances de sucesso com um processo estruturado.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-8">
        <div className="container text-center text-gray-500">
          <p>© 2023 JobSprints. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
