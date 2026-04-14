import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle,
  XCircle,
  Users,
  IndianRupee,
  Wallet,
  TrendingUp,
  Repeat,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  LayoutDashboard
} from "lucide-react";

import {
  getSuperAdminDashboard,
  getPlatformFinanceStats
} from "../../api/superAdmin.api";

import StatCard from "../../components/ui/StatCard";
import Loading from "../../components/common/Loading";
import { useNavigate } from "react-router-dom";

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentCompanies, setRecentCompanies] = useState([]);
  const [financeStats, setFinanceStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const dashboardData = await getSuperAdminDashboard();
        const financeData = await getPlatformFinanceStats();

        setStats(dashboardData.stats);
        setRecentCompanies(dashboardData.recentCompanies);
        setFinanceStats(financeData.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Scrollable Container with better padding to avoid AI Bot overlap */}
      <div className="p-4 md:p-8 space-y-10 max-w-350 mx-auto animate-fade-in">
        
        {/* ================= COMPACT HEADER ================= */}
        <header className="relative overflow-hidden bg-white rounded-4xl border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full w-fit mb-3">
                <LayoutDashboard size={14} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Real-time Control</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                Super Admin <span className="text-indigo-600">Dashboard</span>
              </h1>
              <p className="text-slate-500 font-medium mt-1">
                Overview of platform performance and company activity.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl">
              <Calendar className="text-slate-400" size={18} />
              <span className="text-sm font-bold text-slate-700">
                {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
          {/* Decorative Background for header */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
        </header>

        {/* ================= STATS GRIDS ================= */}
        <div className="grid grid-cols-1 gap-10">
          
          {/* System Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                <ShieldCheck size={18} className="text-indigo-600" />
              </div>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Infrastructure</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard title="Total Companies" value={stats?.totalCompanies || 0} icon={Building2} color="bg-indigo-600" />
              <StatCard title="Verified" value={stats?.activeCompanies || 0} icon={CheckCircle} color="bg-emerald-500" />
              <StatCard title="Action Required" value={stats?.inactiveCompanies || 0} icon={XCircle} color="bg-rose-500" />
              <StatCard title="System Admins" value={stats?.totalAdmins || 0} icon={Users} color="bg-blue-600" />
            </div>
          </section>

          {/* Finance Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                <TrendingUp size={18} className="text-blue-600" />
              </div>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Financial Health</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard title="Gross Volume" value={`₹${financeStats?.totalRevenue || 0}`} icon={IndianRupee} color="bg-blue-600" />
              <StatCard title="Earnings" value={`₹${financeStats?.totalCommission || 0}`} icon={Repeat} color="bg-indigo-600" />
              <StatCard title="Payouts" value={`₹${financeStats?.totalCompanyEarning || 0}`} icon={Wallet} color="bg-emerald-600" />
              <StatCard title="Transactions" value={financeStats?.totalTransactions || 0} icon={ArrowUpRight} color="bg-slate-700" />
            </div>
          </section>
        </div>

        {/* ================= RECENT ACTIVITY ================= */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Recent Onboardings</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Last 5 Companies</p>
            </div>
            <button 
              onClick={() => navigate("/superadmin/companies")}
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 cursor-pointer"
            >
              Manage All
            </button>
          </div>

          <div className="overflow-x-auto scrollbar-hide">
            {recentCompanies.length === 0 ? (
              <div className="p-20 text-center text-slate-400 font-medium italic">
                No recent activity found.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                    <th className="px-8 py-4">Company Name</th>
                    <th className="px-8 py-4">Contact</th>
                    <th className="px-8 py-4">Registration Date</th>
                    <th className="px-8 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentCompanies.map((company) => (
                    <tr key={company._id} className="group hover:bg-slate-50/80 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm">
                            {company.name.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-700">{company.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-sm text-slate-500 font-medium">{company.email || "—"}</span>
                      </td>
                      <td className="px-8 py-4 text-slate-400 text-sm font-medium">
                        {new Date(company.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-8 py-4 text-right">
                        <button 
                          onClick={() => navigate("/superadmin/companies")}
                          className="p-2 bg-slate-100 text-slate-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all cursor-pointer"
                        >
                          <ArrowUpRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;