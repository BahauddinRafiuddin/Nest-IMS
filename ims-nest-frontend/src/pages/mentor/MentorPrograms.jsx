/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { getMentorPrograms, completeInternship } from "../../api/mentor.api";
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  Briefcase,
  CheckCircle,
  IndianRupee,
  Layers,
  ChevronDown,
  ChevronUp,
  Award,
} from "lucide-react";
import Loading from "../../components/common/Loading";
import Pagination from "../../components/common/Pagination";
import { toastError, toastSuccess } from "../../utils/toast";
import ConfirmModal from "../../components/common/ConfirmModal";

const MentorPrograms = () => {
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 1;
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);

  useEffect(() => {
    const fetchMentorPrograms = async () => {
      try {
        const res = await getMentorPrograms(page,limit);
        setPrograms(res.programs || []);
        setTotalPages(res.totalPages)
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMentorPrograms();
  }, [page,limit]);

  const handleComplete = async () => {
    try {
      const res = await completeInternship(selectedEnrollment._id);
      setPrograms((prev) =>
        prev.map((program) => ({
          ...program,
          interns: program.interns.map((enrollment) =>
            enrollment._id === selectedEnrollment._id
              ? { ...enrollment, status: "completed" }
              : enrollment,
          ),
        })),
      );
      toastSuccess(res.message || "Internship marked as completed ✅");
      setSelectedEnrollment(null);
    } catch (error) {
      console.log(error);
      toastError(error.response?.data?.message || "Something went wrong");
    }
  };
  if (loading) return <Loading />;

  if (!programs.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-center mx-4">
        <BookOpen className="text-slate-300 mb-4" size={60} />
        <h2 className="text-xl font-bold text-slate-800">No Programs Found</h2>
        <p className="text-slate-500 max-w-xs mt-2 text-sm font-medium">
          You are not assigned to any internship programs at the moment.
        </p>
      </div>
    );
  }
  // console.log(programs[1]);
  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12 px-4">
      {selectedEnrollment && (
        <ConfirmModal
          title="Mark as Completed?"
          message="Are you sure you want to authorize this internship completion? This action cannot be undone."
          onConfirm={handleComplete}
          onCancel={() => setSelectedEnrollment(null)}
        />
      )}
      {/* HEADER */}
      <div className="border-b border-slate-200 pb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Curriculum & Management
        </h1>
        <p className="text-slate-500 mt-1 font-medium italic">
          Monitor your assigned programs and authorize internship completions.
        </p>
      </div>

      {/* PROGRAM GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {programs.map((program) => (
          <div
            key={program._id}
            className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            {/* TOP SECTION: IDENTIFIER */}
            <div className="p-8 pb-0">
              <div className="flex justify-between items-start gap-4 mb-4">
                <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-100">
                  <Layers size={24} />
                </div>
                <span
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(program.status)}`}
                >
                  {program.status}
                </span>
              </div>

              <h2 className="text-2xl font-black text-slate-800 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
                {program.title}
              </h2>
              <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-6">
                {program.description}
              </p>

              {/* INFO GRID: Making all data readable */}
              <div className="grid grid-cols-2 gap-4 pb-8 border-b border-slate-50">
                <InfoBox
                  icon={BookOpen}
                  label="Domain"
                  value={program.domain}
                />
                <InfoBox
                  icon={Clock}
                  label="Duration"
                  value={`${program.durationInWeeks} Weeks`}
                />
                <InfoBox
                  icon={CheckCircle}
                  label="Req. Tasks"
                  value={program.minimumTasksRequired}
                />
                <InfoBox
                  icon={Briefcase}
                  label="Mode"
                  value={program.type}
                  capitalize
                />
                <InfoBox
                  icon={IndianRupee}
                  label="Pricing"
                  value={program.type === "free" ? "Free" : `₹${program.price}`}
                />
                <InfoBox
                  icon={Calendar}
                  label="Active Status"
                  value={program.isActive ? "Yes" : "No"}
                />
              </div>
            </div>

            {/* DATE STRIP */}
            <div className="bg-slate-50 px-8 py-3 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Calendar size={14} />
              {new Date(program.startDate).toLocaleDateString()} —{" "}
              {new Date(program.endDate).toLocaleDateString()}
            </div>

            {/* INTERN MANAGEMENT SECTION */}
            <div className="p-8 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <Users size={18} className="text-indigo-600" />
                  Assigned Intern ({program.interns.length})
                </h3>
              </div>

              {program.interns.length === 0 ? (
                <div className="py-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-400 font-bold italic uppercase">
                    Waiting for enrollments...
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-100 overflow-y-auto pr-2 custom-scrollbar">
                  {program.interns.map((enrollment) => (
                    <div
                      key={enrollment._id}
                      className="group/item relative bg-white border border-slate-100 rounded-3xl p-5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50/50 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-linear-to-br from-slate-100 to-indigo-50 flex items-center justify-center text-indigo-600 font-black text-lg shadow-inner">
                            {enrollment.intern.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 group-hover/item:text-indigo-600 transition-colors">
                              {enrollment.intern.name}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                              <Clock size={12} /> Joined{" "}
                              {new Date(
                                enrollment.createdAt || Date.now(),
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div
                          className={`self-start sm:self-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${enrollment.status === "completed" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}
                        >
                          {enrollment.status.replace("_", " ")}
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="mt-5 pt-5 border-t border-slate-50">
                        {enrollment.status === "in_progress" ? (
                          <button
                            onClick={() => setSelectedEnrollment(enrollment)}
                            className="w-full bg-indigo-600 hover:bg-black text-white text-xs font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-lg shadow-indigo-100 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Award size={14} /> Mark as Completed
                          </button>
                        ) : (
                          <div className="bg-emerald-50 text-emerald-600 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest">
                            <CheckCircle size={16} /> Certified & Completed
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <Pagination
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />
    </div>
  );
};

// --- HELPER COMPONENTS ---

const InfoBox = ({ icon: Icon, label, value, capitalize }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-1.5 text-slate-400">
      <Icon size={14} />
      <span className="text-[10px] font-black uppercase tracking-widest">
        {label}
      </span>
    </div>
    <p
      className={`text-sm font-bold text-slate-700 ${capitalize ? "capitalize" : ""}`}
    >
      {value}
    </p>
  </div>
);

const getStatusStyles = (status) => {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "upcoming":
      return "bg-amber-50 text-amber-700 border-amber-100";
    case "completed":
      return "bg-slate-100 text-slate-500 border-slate-200";
    default:
      return "bg-rose-50 text-rose-700 border-rose-100";
  }
};

export default MentorPrograms;
