import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  LogOut,
  NotebookPen,
  UserRoundPen,
  Wallet,
  FileDown,
  ShieldCheck,
  MessageSquare,
  Star,
  CircleEllipsis,
  Building2,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";

const Sidebar = ({ onClose }) => {
  const { user, logout } = useAuth();

  const themes = {
    SUPER_ADMIN: {
      sidebarBg: "bg-[#0f172a]", // Deep Navy
      active: "bg-blue-600 text-white shadow-lg shadow-blue-900/50",
      hover: "hover:bg-slate-800",
      logo: "text-blue-400",
      accent: "bg-blue-500/10",
    },
    ADMIN: {
      sidebarBg: "bg-[#1e1b4b]", // Deep Indigo
      active: "bg-indigo-500 text-white shadow-lg shadow-indigo-900/50",
      hover: "hover:bg-white/10",
      logo: "text-indigo-400",
      accent: "bg-indigo-400/10",
    },
    MENTOR: {
      sidebarBg: "bg-[#172554]", // Royal Blue
      active: "bg-blue-500 text-white shadow-lg",
      hover: "hover:bg-white/5",
      logo: "text-blue-300",
      accent: "bg-blue-400/10",
    },
    INTERN: {
      sidebarBg: "bg-[#1e293b]", // Slate Blue
      active: "bg-sky-600 text-white shadow-lg",
      hover: "hover:bg-white/5",
      logo: "text-sky-400",
      accent: "bg-sky-400/10",
    },
    PUBLIC_USER: {
      sidebarBg: "bg-[#1e293b]", // Slate Blue
      active: "bg-sky-600 text-white shadow-lg",
      hover: "hover:bg-white/5",
      logo: "text-sky-400",
      accent: "bg-sky-400/10",
    },
  };

  const currentTheme = themes[user?.role] || themes.ADMIN;

  const menus = {
    SUPER_ADMIN: [
      { name: "Dashboard", path: "/superadmin", icon: LayoutDashboard },
      { name: "Companies", path: "/superadmin/companies", icon: Building2 },
      {
        name: "Transaction Report",
        path: "/superadmin/report",
        icon: FileDown,
      },
      {
        name: "Pending Review",
        path: "/superadmin/pending-review",
        icon: ShieldCheck,
      },
    ],
    ADMIN: [
      { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
      { name: "My Profile", path: "/admin/profile", icon: UserRoundPen },
      { name: "Interns", path: "/admin/interns", icon: Users },
      { name: "Mentors", path: "/admin/mentors", icon: GraduationCap },
      { name: "Programs", path: "/admin/programs", icon: BookOpen },
      { name: "Finance Overview", path: "/admin/finance", icon: Wallet },
      { name: "Join Requests", path: "/admin/requests", icon: CircleEllipsis },
      { name: "Reviews", path: "/admin/reviews", icon: MessageSquare },
    ],
    INTERN: [
      { name: "Dashboard", path: "/intern", icon: LayoutDashboard },
      { name: "My Profile", path: "/intern/profile", icon: UserRoundPen },
      { name: "My Programs", path: "/intern/myProgram", icon: BookOpen },
      { name: "My Tasks", path: "/intern/tasks", icon: Users },
      { name: "Performance", path: "/intern/performance", icon: GraduationCap },
      { name: "Certificate", path: "/intern/certificate", icon: BookOpen },
      { name: "Payment History", path: "/intern/payments", icon: Wallet },
      { name: "Review", path: "/intern/review", icon: Star },
    ],
    MENTOR: [
      { name: "Dashboard", path: "/mentor", icon: LayoutDashboard },
      { name: "My Profile", path: "/mentor/profile", icon: UserRoundPen },
      { name: "Programs", path: "/mentor/programs", icon: BookOpen },
      { name: "Interns", path: "/mentor/interns", icon: Users },
      { name: "Task", path: "/mentor/tasks", icon: NotebookPen },
      {
        name: "Track Performance",
        path: "/mentor/performance",
        icon: GraduationCap,
      },
    ],
    PUBLIC_USER: [
      { name: "Dashboard", path: "/public_user", icon: LayoutDashboard },
      { name: "Companies", path: "/public_user/companies", icon: Building2 },
      {
        name: "My Requests",
        path: "/public_user/my-requests",
        icon: CircleEllipsis,
      },
    ],
  };

  const menu = menus[user?.role] || [];

  return (
    <aside
      className={`w-64 h-screen ${currentTheme.sidebarBg} text-white flex flex-col shadow-2xl z-50 sticky top-0 overflow-hidden`}
    >
      {/* LOGO SECTION - Enhanced Contrast */}
      <div className="h-24 shrink-0 flex flex-col items-center justify-center border-b border-white/5 px-6 bg-black/10">
        <span
          className={`text-[10px] font-bold uppercase tracking-[0.2em] ${currentTheme.logo} mb-1`}
        >
          Management System
        </span>
        <h1 className="text-2xl font-black tracking-tighter">
          IMS{" "}
          <span className={currentTheme.logo}>
            {user?.role?.split("_")[0].toUpperCase()}
          </span>
        </h1>
      </div>

      {/* NAV MENU */}
      <nav
        className="flex-1 px-4 py-8 space-y-3 overflow-y-auto"
        style={{
          scrollbarWidth: "none" /* Firefox */,
          msOverflowStyle: "none" /* IE and Edge */,
          WebkitScrollbar: { display: "none" } /* Chrome, Safari, Opera */,
        }}
      >
        {/* ... menu items */}
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group
           ${
             isActive
               ? currentTheme.active
               : `text-slate-400 ${currentTheme.hover}`
           }`
              }
            >
              <Icon
                size={22}
                className="group-hover:scale-110 transition-transform"
              />
              <span className="text-sm font-bold tracking-tight">
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* USER & LOGOUT SECTION */}
      <div className="shrink-0 p-4 bg-black/30 border-t border-white/5">
        <div
          className={`flex items-center gap-3 p-3 rounded-xl ${currentTheme.accent} mb-4`}
        >
          <div
            className={`w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center font-bold ${currentTheme.logo}`}
          >
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Logged in as
            </p>
            <p className="text-xs text-white font-medium truncate">
              {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl
                     text-slate-400 hover:bg-red-500 hover:text-white
                     transition-all duration-300 cursor-pointer font-bold text-xs uppercase tracking-widest"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
