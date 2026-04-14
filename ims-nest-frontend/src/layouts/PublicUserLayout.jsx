/* eslint-disable react-hooks/exhaustive-deps */
import { Outlet, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import AIChat from "../components/common/AIChat";
import { useEffect, useState } from "react";
import Sidebar from "../components/common/Sidebar";
import Topbar from "../components/common/Topbar";
import { useNavigate } from "react-router-dom";
import { toastSuccess } from "../utils/toast";
import { getMe } from "../api/user.api";

const PublicUserLayout = () => {
  const { user, refreshUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // If accepted and promoted to intern, redirect to intern dashboard
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const oldRole = user?.role;

        const res = await getMe(); // 👈 get fresh data
        const newUser = res.user;

        // update state
        refreshUser();

        // ✅ compare using fresh data
        if (oldRole !== "INTERN" && newUser.role === "INTERN") {
          toastSuccess("🎉 Congratulations! You are now an intern!");
          navigate("/intern", { replace: true });
        }
      } catch (err) {
        console.error(err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  if (user?.role === "INTERN") return <Navigate to="/intern" replace />;
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* ================= Sidebar (Desktop) ================= */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* ================= Mobile Sidebar ================= */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* overlay */}
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />

          {/* drawer */}
          <div className="relative w-64 bg-white shadow-xl">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* ================= Main Content ================= */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>

        <AIChat type="private" />
      </div>
    </div>
  );
};
export default PublicUserLayout;
