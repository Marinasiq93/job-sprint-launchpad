
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  activePath: string;
}

const MobileSidebar = ({ isOpen, onClose, onLogout, activePath }: MobileSidebarProps) => {
  const isActivePath = (path: string) => {
    return activePath === path;
  };

  return (
    <div className={`
      fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity
      ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
    `}>
      <div className={`
        fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 z-30
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 flex justify-between items-center border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full jobsprint-gradient-bg flex items-center justify-center">
              <span className="text-white font-bold text-sm">JS</span>
            </div>
            <h1 className="text-xl font-semibold">JobSprints</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
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
                onClick={onClose}
              >
                <span className="h-5 w-5 mr-3">🏠</span>
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/sprints"
                className={`flex items-center px-4 py-2 rounded-md hover:bg-gray-100 ${
                  isActivePath('/dashboard/sprints') ? 'bg-gray-100 text-jobsprint-blue font-medium' : ''
                }`}
                onClick={onClose}
              >
                <span className="h-5 w-5 mr-3">📄</span>
                Minhas Sprints
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/profile"
                className={`flex items-center px-4 py-2 rounded-md hover:bg-gray-100 ${
                  isActivePath('/dashboard/profile') ? 'bg-gray-100 text-jobsprint-blue font-medium' : ''
                }`}
                onClick={onClose}
              >
                <span className="h-5 w-5 mr-3">👤</span>
                Perfil
              </Link>
            </li>
          </ul>
          <Separator className="my-4" />
          <button
            onClick={onLogout}
            className="flex items-center px-4 py-2 rounded-md hover:bg-gray-100 w-full text-left text-red-600"
          >
            <span className="h-5 w-5 mr-3">🚪</span>
            Sair
          </button>
        </nav>
      </div>
    </div>
  );
};

export default MobileSidebar;
