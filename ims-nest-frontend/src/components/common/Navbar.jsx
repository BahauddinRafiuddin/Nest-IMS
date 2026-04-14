import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.svg";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import useAuth from "../../hooks/useAuth";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const getDashboardPath = () => {
    if (!user) return "/login";

    switch (user.role) {
      case "super_admin":
        return "/superadmin";
      case "admin":
        return "/admin";
      case "mentor":
        return "/mentor";
      case "intern":
        return "/intern";
      case "public_user":
        return "/public_user"
      default:
        return "/";
    }
  };

  const dashboardPath = getDashboardPath();

  return (
    <nav className="fixed w-full top-0 z-100 bg-white border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity z-110"
        >
          <img src={logo} alt="Logo" className="w-8 h-8" />
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Internship<span className="text-indigo-600">MS</span>
          </h1>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-5">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Logged in
                </span>
                <span className="text-sm text-slate-700 font-semibold">
                  {user.email}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <Link
                to={dashboardPath}
                className="text-slate-600 hover:text-indigo-600 font-medium transition-colors cursor-pointer"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-red-100 text-red-600 font-medium hover:bg-red-50 transition-all cursor-pointer"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link
                to="/login"
                className="text-slate-600 hover:text-indigo-600 font-medium cursor-pointer"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700 hover:shadow-lg transition-all cursor-pointer"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer z-110"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 bg-white z-105 flex flex-col animate-in fade-in zoom-in-95 duration-200">
          {/* Padding for the top bar so content starts below the logo */}
          <div className="h-20" />

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {user ? (
              <div className="space-y-6">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">
                    Authenticated Account
                  </p>
                  <p className="text-slate-800 font-bold truncate text-lg">
                    {user.email}
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <Link
                    to={dashboardPath}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold shadow-xl shadow-indigo-100 cursor-pointer active:scale-95 transition-transform"
                  >
                    <LayoutDashboard size={20} />
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl border-2 border-red-50 text-red-600 font-bold hover:bg-red-50 cursor-pointer active:scale-95 transition-transform"
                  >
                    <LogOut size={20} />
                    Logout Account
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="w-full text-center py-4 rounded-2xl border-2 border-slate-100 text-slate-600 font-bold text-lg cursor-pointer active:scale-95 transition-transform"
                >
                  Log in
                </Link>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="w-full text-center py-4 rounded-2xl bg-indigo-600 text-white font-bold text-lg shadow-xl shadow-indigo-100 cursor-pointer active:scale-95 transition-transform"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
