/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { getMyProgram, startInternship } from "../../api/intern.api";
import { Calendar, Clock, User, Mail, BookOpen, Layers, ShieldCheck, CreditCard, PlayCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { toastError, toastSuccess } from "../../utils/toast";
import { initiatePayment } from "../../services/razorpay.service";
import Loading from '../../components/common/Loading';

const statusStyles = {
  upcoming: "bg-amber-50 text-amber-600 border-amber-100",
  active: "bg-emerald-50 text-emerald-600 border-emerald-100",
  completed: "bg-slate-100 text-slate-500 border-slate-200",
};

const InternPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPrograms = async () => {
    try {
      const res = await getMyProgram();
      setPrograms(res.enrollement || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleStart = async (enrollmentId) => {
    try {
      const res = await startInternship(enrollmentId);
      toastSuccess(res.message);
      setPrograms((prev) =>
        prev.map((p) =>
          p._id === enrollmentId ? { ...p, status: "in_progress" } : p,
        ),
      );
    } catch (err) {
      toastError(err.response?.data?.message);
    }
  };

  if (loading) return <Loading />;

  if (!programs.length)
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-center mx-4">
        <BookOpen className="text-slate-300 mb-4" size={60} />
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">No Enrollments Found</h2>
        <p className="text-slate-500 max-w-xs mt-2 text-sm font-medium">You haven't enrolled in any internship programs yet.</p>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12 px-4">
      {/* HEADER */}
      <div className="border-b border-slate-200 pb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Internship Programs</h1>
        <p className="text-slate-500 mt-1 font-medium italic">Manage your active enrollments and access your learning materials.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {programs.map((enrollment) => {
          const program = enrollment.program;

          return (
            <div key={enrollment._id} className="group bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
              
              {/* TOP STRIP: PROGRAM LOGO & STATUS */}
              <div className="p-8 pb-4 flex justify-between items-start gap-4">
                <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg shadow-indigo-100 group-hover:bg-black transition-colors">
                  <Layers size={28} />
                </div>
                <div className="flex flex-col items-end gap-2">
                   
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </span>
                </div>
              </div>

              {/* PROGRAM TITLE & DESCRIPTION */}
              <div className="px-8 space-y-3">
                <h2 className="text-2xl font-black text-slate-800 leading-tight">{program.title}</h2>
                <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed italic">
                  "{program.description}"
                </p>
              </div>

              {/* CORE METADATA GRID */}
              <div className="p-8 grid grid-cols-2 gap-4">
                <MetaItem icon={BookOpen} label="Domain" value={program.domain} />
                <MetaItem icon={Clock} label="Duration" value={`${program.durationInWeeks} Weeks`} />
                <MetaItem icon={Calendar} label="Timeline" value={`${new Date(program.startDate).toLocaleDateString()} - ${new Date(program.endDate).toLocaleDateString()}`} />
                <MetaItem icon={ShieldCheck} label="Type" value={program.type} capitalize />
              </div>

              {/* MENTOR CARD (Inlined) */}
              <div className="mx-8 p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 font-bold">
                        {enrollment.mentor.name.charAt(0)}
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Your Mentor</p>
                        <p className="text-sm font-bold text-slate-700 mt-1">{enrollment.mentor.name}</p>
                    </div>
                </div>
                <div className="text-slate-300 hover:text-indigo-600 transition-colors cursor-help">
                    <Mail size={18} />
                </div>
              </div>

              {/* BOTTOM ACTION SECTION */}
              <div className="p-8 mt-auto flex flex-col gap-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-300 px-1">
                    <span>Enrollment: {enrollment.status.replace("_", " ")}</span>
                    {program.type === 'paid' && (
                        <span className={enrollment.paymentStatus === 'paid' ? 'text-emerald-500' : 'text-amber-500'}>
                            Payment: {enrollment.paymentStatus || 'Pending'}
                        </span>
                    )}
                </div>

                {/* LOGIC-BASED BUTTONS */}
                {enrollment.status === "approved" && program.type === "free" && (
                    <ActionButton onClick={() => handleStart(enrollment._id)} icon={PlayCircle} label="Start Internship" color="green" />
                )}

                {enrollment.status === "approved" && program.type === "paid" && enrollment.paymentStatus !== "paid" && (
                    <ActionButton 
                        onClick={() => initiatePayment({
                            enrollment,
                            onSuccess: () => { toastSuccess("Payment successful!"); fetchPrograms(); },
                            onFailure: (msg) => { toastError(msg); },
                        })} 
                        icon={CreditCard} 
                        label={`Complete Payment (₹${program.price})`} 
                        color="indigo" 
                    />
                )}

                {enrollment.status === "approved" && program.type === "paid" && enrollment.paymentStatus === "paid" && (
                    <ActionButton onClick={() => handleStart(enrollment._id)} icon={PlayCircle} label="Start Internship" color="green" />
                )}

                {enrollment.status === "in_progress" && (
                    <div className="w-full bg-emerald-50 text-emerald-600 py-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest border border-emerald-100">
                        <CheckCircle2 size={18}/> In Progress
                    </div>
                )}

                {enrollment.status === "completed" && (
                    <div className="w-full bg-slate-100 text-slate-400 py-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest">
                        <CheckCircle2 size={18}/> Program Completed
                    </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const MetaItem = ({ icon: Icon, label, value, capitalize }) => (
  <div className="flex items-center gap-3">
    <div className="p-2 bg-slate-50 text-slate-400 rounded-xl">
      <Icon size={14} />
    </div>
    <div className="flex flex-col">
       <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">{label}</span>
       <span className={`text-[11px] font-bold text-slate-600 mt-1 ${capitalize ? 'capitalize' : ''}`}>
          {value}
       </span>
    </div>
  </div>
);

const ActionButton = ({ onClick, icon: Icon, label, color }) => {
    const colors = {
        green: "bg-emerald-600 hover:bg-black shadow-emerald-100",
        indigo: "bg-indigo-600 hover:bg-black shadow-indigo-100",
    }
    return (
        <button
            onClick={onClick}
            className={`w-full ${colors[color]} text-white py-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-[0.98] cursor-pointer group`}
        >
            <Icon size={18} className="group-hover:scale-110 transition-transform"/>
            {label}
        </button>
    )
}

export default InternPrograms;