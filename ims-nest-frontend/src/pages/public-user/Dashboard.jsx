import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  LogOut,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout,user } = useAuth();

  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">

      {/* ✅ ACCEPTED MESSAGE */}
      {user.role === "INTERN" && (
        <div className="mb-8 flex items-center justify-between bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg shadow-sm animate-pulse">
          <div className="flex items-center">
            <CheckCircle className="text-green-600 mr-3" size={24} />
            <div>
              <p className="text-green-800 font-bold text-lg">
                🎉 Request Accepted!
              </p>
              <p className="text-green-700 text-sm">
                Please logout and login again to access your Intern Dashboard.
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-green-700 transition shadow-md cursor-pointer"
          >
            <LogOut size={18} /> Logout Now
          </button>
        </div>
      )}

      {/* HERO SECTION */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
          Welcome to your Career Journey! 🚀
        </h1>

        <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">
          You are currently in the <strong>Public User Dashboard</strong>. From
          here, you can find your dream internship and track your application
          status.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <button
            onClick={() => navigate("/public_user/companies")}
            disabled={user.role === "INTERN"} // 🔥 disable after becomming intern
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition transform hover:scale-105 disabled:opacity-50 cursor-pointer"
          >
            Explore Companies <ArrowRight size={20} />
          </button>

          <button
            onClick={() => navigate("/public_user/my-requests")}
            className="flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition cursor-pointer"
          >
            View My Requests
          </button>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 font-bold text-xl">
            1
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Find & Apply</h3>
          <p className="text-gray-500 text-sm">
            Browse companies and send join requests.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4 font-bold text-xl">
            2
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Get Notified</h3>
          <p className="text-gray-500 text-sm">
            You will receive an email when your request is accepted.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-4 font-bold text-xl">
            3
          </div>
          <h3 className="font-bold text-gray-800 mb-2">
            Become an Intern
          </h3>
          <p className="text-gray-500 text-sm">
            Logout & login again to access your intern dashboard.
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-12 text-center text-gray-400 text-sm">
        <p>Need help? Use Our Ai Chat Bot</p>
      </div>
    </div>
  );
};

export default Dashboard;