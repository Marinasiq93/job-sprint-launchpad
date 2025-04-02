
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Home, FileText, User, LogOut } from "lucide-react";

interface DesktopSidebarProps {
  activePath: string;
  onLogout: () => void;
  hidden?: boolean;
}

const DesktopSidebar = ({ activePath, onLogout, hidden = false }: DesktopSidebarProps) => {
  const isActivePath = (path: string) => {
    return activePath === path;
  };

  if (hidden) {
    return null;
  }

  return (
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
          onClick={onLogout}
          className="flex items-center px-4 py-2 rounded-md hover:bg-gray-100 w-full text-left text-red-600"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sair
        </button>
      </nav>
    </aside>
  );
};

export default DesktopSidebar;
