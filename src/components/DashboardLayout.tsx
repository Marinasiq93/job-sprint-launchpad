
import { useState, ReactNode, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/lib/toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Home, 
  FileText, 
  User, 
  LogOut, 
  Menu, 
  X,
  Plus
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Check if user is authenticated
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        toast.error("Você precisa estar logado para acessar esta página");
        navigate("/login");
      }
    };
    
    checkUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error("Erro ao fazer logout. Tente novamente.");
        return;
      }
      
      toast.success("Logout realizado com sucesso!");
      navigate("/");
    } catch (error) {
      toast.error("Erro ao fazer logout. Tente novamente.");
      console.error(error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden mr-2"
                onClick={toggleSidebar}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full jobsprint-gradient-bg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">JS</span>
                </div>
                <h1 className="text-xl font-semibold hidden md:inline-block">JobSprints</h1>
              </Link>
            </div>
            <div>
              <Button 
                onClick={() => navigate('/dashboard/new-sprint')}
                className="bg-jobsprint-blue hover:bg-jobsprint-blue/90"
              >
                <Plus className="h-4 w-4 mr-2" /> Nova Sprint
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar for mobile (overlay) */}
        <div className={`
          fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity
          ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}>
          <div className={`
            fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 z-30
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <div className="p-4 flex justify-between items-center border-b">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full jobsprint-gradient-bg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">JS</span>
                </div>
                <h1 className="text-xl font-semibold">JobSprints</h1>
              </div>
              <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/dashboard"
                    className={`flex items-center px-4 py-2 rounded-md hover:bg-gray-100 ${
                      isActivePath('/dashboard') ? 'bg-gray-100 text-jobsprint-blue font-medium' : ''
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Home className="h-5 w-5 mr-3" />
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard/sprints"
                    className={`flex items-center px-4 py-2 rounded-md hover:bg-gray-100 ${
                      isActivePath('/dashboard/sprints') ? 'bg-gray-100 text-jobsprint-blue font-medium' : ''
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <FileText className="h-5 w-5 mr-3" />
                    Minhas Sprints
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard/profile"
                    className={`flex items-center px-4 py-2 rounded-md hover:bg-gray-100 ${
                      isActivePath('/dashboard/profile') ? 'bg-gray-100 text-jobsprint-blue font-medium' : ''
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <User className="h-5 w-5 mr-3" />
                    Perfil
                  </Link>
                </li>
              </ul>
              <Separator className="my-4" />
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 rounded-md hover:bg-gray-100 w-full text-left text-red-600"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sair
              </button>
            </nav>
          </div>
        </div>
        
        {/* Sidebar for desktop (fixed) */}
        <aside className="w-64 border-r hidden md:block">
          <nav className="p-4 h-full">
            <ul className="space-y-2">
              <li>
                <Link
                  to="/dashboard"
                  className={`flex items-center px-4 py-2 rounded-md hover:bg-gray-100 ${
                    isActivePath('/dashboard') ? 'bg-gray-100 text-jobsprint-blue font-medium' : ''
                  }`}
                >
                  <Home className="h-5 w-5 mr-3" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/sprints"
                  className={`flex items-center px-4 py-2 rounded-md hover:bg-gray-100 ${
                    isActivePath('/dashboard/sprints') ? 'bg-gray-100 text-jobsprint-blue font-medium' : ''
                  }`}
                >
                  <FileText className="h-5 w-5 mr-3" />
                  Minhas Sprints
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/profile"
                  className={`flex items-center px-4 py-2 rounded-md hover:bg-gray-100 ${
                    isActivePath('/dashboard/profile') ? 'bg-gray-100 text-jobsprint-blue font-medium' : ''
                  }`}
                >
                  <User className="h-5 w-5 mr-3" />
                  Perfil
                </Link>
              </li>
            </ul>
            <Separator className="my-4" />
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 rounded-md hover:bg-gray-100 w-full text-left text-red-600"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sair
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
