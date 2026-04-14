/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import {
  BookOpen,
  Users,
  ClipboardList,
  Clock,
  CheckCircle,
  ArrowUpRight,
  LayoutDashboard,
  Calendar,
  Layers,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import Loading from '../../components/common/Loading'
import { getMenorDashboard } from "../../api/mentor.api";
import { useNavigate } from "react-router-dom";


const MentorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentPrograms, setRecentPrograms] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchMentorDashboardData = async () => {
      try {
        const res = await getMenorDashboard();
        setStats(res.dashboard);
        setRecentTasks(res.recentTasks || []);
        setRecentPrograms(res.recentPrograms || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMentorDashboardData();
  }, []);

  if (loading) return <Loading />;
  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12 px-4">
      
      {/* 1. WELCOME HERO SECTION */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-indigo-200/50">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-52 h-52 bg-blue-500/10 rounded-full blur-2xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Welcome Back, Mentor! 👋
            </h1>
            <p className="text-indigo-200 text-lg font-medium opacity-90 max-w-md">
              You have <span className="text-white font-bold">{stats.pendingReviews || 0} tasks</span> awaiting your feedback today.
            </p>
          </div>
          
          <div className="flex gap-3">
             <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-25">
                <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest">Active Interns</p>
                <p className="text-white text-2xl font-black">{stats.totalInterns || 0}</p>
             </div>
             <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-25">
                <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest">Total Programs </p>
                <p className="text-white text-2xl font-black">{stats.totalPrograms || 0}</p>
             </div>
          </div>
        </div>
      </div>

      {/* 2. CORE STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatPill label="Total Programs" value={stats.totalPrograms} icon={BookOpen} color="indigo" />
        <StatPill label="Active Now" value={stats.activePrograms} icon={Layers} color="emerald" />
        <StatPill label="Tasks Assigned" value={stats.totalTasks} icon={ClipboardList} color="slate" />
        <StatPill label="Approved" value={stats.approvedTasks} icon={CheckCircle} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 3. MY PROGRAMS (Left Column) */}
        <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                    <LayoutDashboard className="text-indigo-600" size={20} />
                    Current Engagements
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentPrograms.length > 0 ? (
                    recentPrograms.map((program) => (
                        <div key={program._id} className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl ${program.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                    <BookOpen size={24} />
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                                    program.status === 'active' 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                    : 'bg-slate-50 text-slate-500 border-slate-100'
                                }`}>
                                    {program.status}
                                </span>
                            </div>
                            <h4 className="text-lg font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{program.title}</h4>
                            <p className="text-sm text-slate-400 font-medium mt-1">Domain: {program.domain}</p>
                            
                            <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    {[1,2,3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                            {String.fromCharCode(64 + i)}
                                        </div>
                                    ))}
                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                                        +5
                                    </div>
                                </div>
                                <button
                                onClick={()=>navigate('/mentor/programs')}
                                className="cursor-pointer text-indigo-600 hover:text-indigo-800 font-bold text-sm flex items-center gap-1">
                                    View <ChevronRight size={14}/>
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-2 py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center text-slate-400 font-medium">
                        No active programs assigned.
                    </div>
                )}
            </div>
        </div>

        {/* 4. RECENT TASKS / REVIEWS (Right Sidebar) */}
        <div className="space-y-6">
            <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                <Clock className="text-amber-500" size={20} />
                Recent Activity
            </h3>
            
            <div className="bg-white h-75 rounded-4xl border border-slate-200 p-6 shadow-sm divide-y divide-slate-50">
                {recentTasks.length > 0 ? (
                    recentTasks.map((task) => (
                        <div key={task._id} className="py-4 first:pt-0 last:pb-0 group cursor-pointer">
                            <div className="flex justify-between items-start mb-1">
                                <h5 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate max-w-37.5">{task.title}</h5>
                                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                                    task.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 
                                    task.status === 'rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                                }`}>
                                    {task.status}
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium mb-2">{task.program?.title}</p>
                            <div className="flex items-center justify-between text-[10px] font-bold">
                                <span className={task.reviewStatus === 'pending' ? 'text-amber-600 flex items-center gap-1' : 'text-emerald-600 flex items-center gap-1'}>
                                    {task.reviewStatus === 'pending' ? <AlertCircle size={10}/> : <CheckCircle size={10}/>}
                                    {task.reviewStatus === 'pending' ? 'Review Needed' : 'Completed'}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-10 text-center text-slate-400 text-sm italic">
                        No recent tasks found.
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB COMPONENTS ---

const StatPill = ({ label, value, icon: Icon, color }) => {
    const themes = {
        indigo: "bg-indigo-600 shadow-indigo-100 text-white",
        emerald: "bg-emerald-500 shadow-emerald-100 text-white",
        slate: "bg-slate-800 shadow-slate-100 text-white",
        blue: "bg-blue-600 shadow-blue-100 text-white",
    };
    return (
        <div className={`${themes[color]} p-6 rounded-4xl shadow-xl transition-transform hover:scale-[1.02] duration-300 relative overflow-hidden group`}>
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                <Icon size={100}/>
            </div>
            <div className="relative z-10 flex flex-col gap-1">
                <div className="bg-white/20 w-fit p-2 rounded-xl mb-2">
                    <Icon size={20} />
                </div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{label}</p>
                <h2 className="text-3xl font-black">{value || 0}</h2>
            </div>
        </div>
    );
};

export default MentorDashboard;