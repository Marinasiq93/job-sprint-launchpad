
import { useState, ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DesktopSidebar from "@/components/dashboard/DesktopSidebar";
import MobileSidebar from "@/components/dashboard/MobileSidebar";

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

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader onToggleSidebar={toggleSidebar} />

      <div className="flex-1 flex">
        {/* Mobile Sidebar */}
        <MobileSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
          activePath={location.pathname}
        />
        
        {/* Desktop Sidebar */}
        <DesktopSidebar 
          activePath={location.pathname}
          onLogout={handleLogout}
        />

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
