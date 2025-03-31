
import { Link } from "react-router-dom";

interface HeaderProps {
  showBackLink?: boolean;
  backTo?: string;
}

export const Header = ({ showBackLink = false, backTo = "/" }: HeaderProps) => {
  return (
    <header className="p-4 border-b">
      <div className="container">
        <Link to={showBackLink ? backTo : "/"} className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full jobsprint-gradient-bg flex items-center justify-center">
            <span className="text-white font-bold text-sm">JS</span>
          </div>
          <h1 className="text-xl font-semibold">JobSprints</h1>
        </Link>
      </div>
    </header>
  );
};
