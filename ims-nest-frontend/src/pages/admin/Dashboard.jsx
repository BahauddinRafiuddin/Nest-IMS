/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  UserX,
  BookOpen,
  CheckCircle,
  Activity,
  IndianRupee,
  ArrowUpRight,
  TrendingUp,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { getDashboardData } from "../../api/admin.api";
import Loading from "../../components/common/Loading";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await getDashboardData();
        setStats(res.dashboard);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) return <Loading />;
  if (!stats)
    return (
      <div className="py-20 text-center text-red-500 font-bold">
        Failed to load dashboard data.
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12">
      {/* 1. WELCOME HERO SECTION */}
      <div className="relative hidden sm:block rounded-2xl overflow-hidden bg-slate-900 rounded-4xl8 md:p-12 shadow-2xl shadow-indigo-200/50">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl -ml-10 -mb-10"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Welcome, Admin! 👋
            </h1>
            <p className="text-indigo-200 text-lg font-medium opacity-90">
              Here is what's happening with your internship programs today.
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/finance")}
            className="group flex items-center gap-3 bg-white text-slate-900 px-6 py-3.5 rounded-2xl font-bold transition-all hover:bg-indigo-50 hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
          >
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
              <IndianRupee size={20} />
            </div>
            <span>View Finance</span>
            <ArrowUpRight
              size={18}
              className="text-slate-400 group-hover:text-indigo-600 transition-colors"
            />
          </button>
        </div>
      </div>

      {/* 2. CORE STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatPill
          label="Total Interns"
          value={stats.totalInterns}
          icon={Users}
          // trend="+12%"
          color="indigo"
        />
        <StatPill
          label="Active Programs"
          value={stats.activePrograms}
          icon={Activity}
          trend="Live Now"
          color="emerald"
        />
        <StatPill
          label="Completion Rate"
          value={`${stats.completedPrograms || 0}`}
          icon={CheckCircle}
          trend="Target: 10"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3. DETAILED BREAKDOWN (Left Side) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="text-indigo-500" size={20} />
              Enrollment Analytics
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MiniCard
              title="Active Interns"
              value={stats.activeInterns}
              icon={UserCheck}
              color="text-emerald-600"
              bg="bg-emerald-50"
            />
            <MiniCard
              title="Inactive Interns"
              value={stats.inactiveInterns}
              icon={UserX}
              color="text-rose-600"
              bg="bg-rose-50"
            />
            <MiniCard
              title="Total Programs"
              value={stats.totalPrograms}
              icon={BookOpen}
              color="text-amber-600"
              bg="bg-amber-50"
            />
          </div>

          {/* QUICK ACTIONS DOCK */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-700 mb-4">Quick Management</h4>
            <div className="flex flex-wrap gap-4">
              <QuickAction
                label="New Intern"
                onClick={() => navigate("/admin/interns")}
              />
              <QuickAction
                label="Create Program"
                onClick={() => navigate("/admin/programs")}
              />
              <QuickAction
                label="Review Feedback"
                onClick={() => navigate("/admin/reviews")}
              />
            </div>
          </div>
        </div>

        {/* 4. RECENT ACTIVITY FEED (Right Side) */}
        {/* <div className="bg-white rounded-4xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800">System Log</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Real-time</span>
            </div>
            
            <div className="space-y-6">
                <ActivityItem title="Program Updated" desc="React Fullstack dates changed" time="2m ago" />
                <ActivityItem title="New Review" desc="Received 5 stars from Alex" time="15m ago" />
                <ActivityItem title="Mentor Assigned" desc="Suresh joined Python Dev" time="1h ago" />
                <ActivityItem title="Finance Alert" desc="Weekly payout completed" time="3h ago" />
            </div>

            <button className="w-full mt-8 py-3 border border-slate-100 rounded-xl text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors">
                View All Activity
            </button>
        </div> */}
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const StatPill = ({ label, value, icon: Icon, trend, color }) => {
  const colors = {
    indigo: "from-indigo-500 to-blue-600 shadow-indigo-100",
    emerald: "from-emerald-500 to-teal-600 shadow-emerald-100",
    purple: "from-purple-500 to-indigo-600 shadow-purple-100",
  };
  return (
    <div
      className={`relative overflow-hidden bg-linear-to-br ${colors[color]} p-6 rounded-3xl shadow-xl text-white`}
    >
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-white/70 text-sm font-bold uppercase tracking-wider mb-1">
            {label}
          </p>
          <h2 className="text-4xl font-black">{value}</h2>
        </div>
        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
          <Icon size={24} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase">
          {trend}
        </span>
      </div>
    </div>
  );
};

const MiniCard = ({ title, value, icon: Icon, color, bg }) => (
  <div className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-shadow">
    <div className="flex items-center gap-4">
      <div className={`${bg} ${color} p-3 rounded-xl`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter">
          {title}
        </p>
        <h4 className="text-xl font-black text-slate-800">{value}</h4>
      </div>
    </div>
    <ChevronRight size={16} className="text-slate-300" />
  </div>
);

const QuickAction = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 rounded-xl bg-slate-50 text-slate-600 text-sm font-bold border cursor-pointer border-slate-100 hover:border-indigo-200 hover:text-indigo-600 hover:bg-white transition-all"
  >
    {label}
  </button>
);

const ActivityItem = ({ title, desc, time }) => (
  <div className="flex gap-4">
    <div className="mt-1.5 w-2 h-2 rounded-full bg-indigo-500 shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
    <div>
      <h5 className="text-sm font-bold text-slate-800 leading-none mb-1">
        {title}
      </h5>
      <p className="text-xs text-slate-500 mb-1">{desc}</p>
      <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
        <Calendar size={10} /> {time}
      </span>
    </div>
  </div>
);

export default AdminDashboard;
