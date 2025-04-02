
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Plus } from "lucide-react";

interface DashboardHeaderProps {
  onToggleSidebar: () => void;
}

const DashboardHeader = ({ onToggleSidebar }: DashboardHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="border-b">
      <div className="container py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden mr-2"
              onClick={onToggleSidebar}
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
  );
};

export default DashboardHeader;
