import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Topbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const location = useLocation();

  const roleTitle = {
    admin: "Admin Dashboard",
    intern: "Intern Dashboard",
    mentor: "Mentor Dashboard"
  };

  // Get current route name
  const path = location.pathname.split("/")[2];

  const pageTitle =
    path?.charAt(0).toUpperCase() + path?.slice(1) || "Dashboard";

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">

      {/* LEFT */}
      <div className="flex items-center gap-3">
        {/* Mobile menu */}
        <button
          className="md:hidden cursor-pointer"
          onClick={onMenuClick}
        >
          <Menu size={24} />
        </button>

        <div>
          <h1 className="font-semibold text-lg text-gray-800">
            {roleTitle[user?.role]}
          </h1>

          <p className="text-xs text-gray-500 capitalize">
            {pageTitle}
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600 hidden sm:block">
          Welcome,{" "}
          <span className="font-medium">
            {user?.name || user?.role}
          </span>
        </span>
      </div>
    </header>
  );
};

export default Topbar;
