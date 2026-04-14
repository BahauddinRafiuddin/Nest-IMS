/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { BookOpen, ClipboardList, CheckCircle, Clock, ArrowRight, LayoutDashboard, Zap, BarChart3, GraduationCap, CreditCard, UserCircle } from "lucide-react";
import { getMyPerformance, getMyProgram } from "../../api/intern.api";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/common/Loading";

const InternDashboard = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    programs: 0,
    totalTasks: 0,
    pendingTasks: 0,
    approvedTasks: 0,
  });

  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const myProgram = await getMyProgram();
        const enrollments = myProgram.enrollement || [];
        const validEnrollments = enrollments.filter((e) => e.program !== null);
        setPrograms(validEnrollments);

        if (validEnrollments.length > 0) {
          const programId = validEnrollments[0].program._id;
          const myPerformance = await getMyPerformance(programId);

          setStats({
            programs: validEnrollments.length,
            totalTasks: myPerformance.performance.totalTasks,
            pendingTasks: myPerformance.performance.pendingTasks,
            approvedTasks: myPerformance.performance.approvedTasks,
          });
        }
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <Loading />;

  if (programs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-center mx-4">
        <div className="bg-slate-50 p-6 rounded-full mb-4">
          <BookOpen size={48} className="text-slate-300" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">No Active Internship Found</h2>
        <p className="text-slate-400 text-sm font-medium mt-2">Please contact the administration for program assignment.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12 px-4">
      
      {/* HEADER SECTION */}
      <div className="border-b border-slate-200 pb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Intern Dashboard</h1>
        <p className="text-slate-500 mt-1 font-medium italic">Track your professional growth, task metrics, and program status.</p>
      </div>

      {/* STATS STRIP (Mentor Style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <MiniStat label="Active" value={stats.programs} icon={BookOpen} color="indigo" />
        <MiniStat label="Total Tasks" value={stats.totalTasks} icon={ClipboardList} color="blue" />
        <MiniStat label="Pending" value={stats.pendingTasks} icon={Clock} color="amber" />
        <MiniStat label="Approved" value={stats.approvedTasks} icon={CheckCircle} color="emerald" />
      </div>

      {/* ACTIVE PROGRAMS SECTION */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
            <Zap size={20} className="text-indigo-600" />
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Current Enrollments</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {programs.map((enrollment) => (
            <div key={enrollment._id} className="group bg-white rounded-4xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                    <div className="bg-slate-50 p-3 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <BookOpen size={24} />
                    </div>
                    <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                        {enrollment.status}
                    </span>
                </div>

                <h3 className="text-2xl font-black text-slate-800 mb-2 leading-tight">
                    {enrollment.program?.title}
                </h3>

                <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Domain</p>
                        <p className="text-sm font-bold text-slate-600">{enrollment.program?.domain}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Mentor</p>
                        <p className="text-sm font-bold text-slate-600 flex items-center gap-1.5">
                            <UserCircle size={14}/> {enrollment.mentor?.name}
                        </p>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-400">Duration: {enrollment.program?.durationInWeeks} weeks</p>
                    <button 
                        onClick={() => navigate("/intern/myProgram")}
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600 hover:text-black transition-colors cursor-pointer"
                    >
                        View Details <ArrowRight size={14}/>
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK ACTIONS SECTION */}
      <div className="space-y-6">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Navigation Hub</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ActionCard 
            title="My Tasks" 
            desc="Manage your assignments" 
            icon={ClipboardList} 
            onClick={() => navigate("/intern/tasks")} 
          />
          <ActionCard 
            title="Performance" 
            desc="Track your progress" 
            icon={BarChart3} 
            onClick={() => navigate("/intern/performance")} 
          />
          <ActionCard 
            title="Certificates" 
            desc="Claim your credentials" 
            icon={GraduationCap} 
            onClick={() => navigate("/intern/certificate")} 
          />
          <ActionCard 
            title="Payments" 
            desc="Transaction history" 
            icon={CreditCard} 
            onClick={() => navigate("/intern/payments")} 
          />
        </div>
      </div>
    </div>
  );
};

// --- SUB COMPONENTS (Consistent with Mentor UI) ---

const MiniStat = ({ label, value, icon: Icon, color }) => {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };
  return (
    <div className="bg-white border border-slate-200 p-5 rounded-3xl flex items-center gap-5 shadow-sm">
       <div className={`p-3 rounded-2xl ${colors[color]}`}>
          <Icon size={20} />
       </div>
       <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
          <p className="text-2xl font-black text-slate-800 leading-tight">{value || 0}</p>
       </div>
    </div>
  );
};

const ActionCard = ({ title, desc, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className="group bg-white border border-slate-200 p-8 rounded-4xl text-left hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer"
  >
    <div className="bg-slate-50 text-slate-400 p-3 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all w-fit mb-4">
      <Icon size={24} />
    </div>
    <h3 className="text-lg font-black text-slate-800 tracking-tight">{title}</h3>
    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tighter">{desc}</p>
  </button>
);

export default InternDashboard;