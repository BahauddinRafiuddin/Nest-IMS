import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import Topbar from "../components/common/Topbar";
import AIChat from "../components/common/AIChat";

const SuperAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    // Changed bg to a neutral Slate-50 to make the Amber/Slate-950 sidebar pop
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      {/* ================= Sidebar (Desktop) ================= */}
      {/* Removed the extra wrapper bg-indigo-100 to let the Sidebar's own Slate-950 show */}
      <div className="hidden md:block shadow-2xl z-20">
        <Sidebar />
      </div>

      {/* ================= Mobile Sidebar ================= */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* overlay with a blur to match premium feel */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />

          {/* drawer */}
          <div className="relative w-64 shadow-2xl transition-transform duration-300">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* ================= Main Content ================= */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar - Glassmorphism effect */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 flex items-center">
          <div className="w-full px-4">
            <Topbar onMenuClick={() => setSidebarOpen(true)} />
          </div>
        </header>

        {/* Page Content */}
        {/* Added a subtle gradient background to match the "Super" theme */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-linear-to-br from-slate-50 to-amber-50/30">
          <div className="max-w-7xl mx-auto">
            {/* This wrapper ensures the content inside (the Outlet) 
                is contained within a nice clean "sheet" 
            */}
            <div className="bg-transparent">
              <Outlet />
            </div>
          </div>
        </main>
        <AIChat type="private"/>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
