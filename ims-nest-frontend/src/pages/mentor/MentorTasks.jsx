/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { getMentorPrograms, getMentorTasks } from "../../api/mentor.api";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  User,
  Calendar,
  Layers,
  SearchX,
  ArrowUpRight,
} from "lucide-react";
import ReviewTaskModal from "../../components/mentor/ReviewTaskModal";
import CreateTaskModal from "../../components/mentor/CreateTaskModal";
import Loading from "../../components/common/Loading";
import Pagination from "../../components/common/Pagination"; // Import pagination

const priorityColors = {
  low: "bg-emerald-50 text-emerald-700 border-emerald-100",
  medium: "bg-amber-50 text-amber-700 border-amber-100",
  high: "bg-rose-50 text-rose-700 border-rose-100",
};

const statusColors = {
  pending: "bg-slate-100 text-slate-600",
  submitted: "bg-indigo-50 text-indigo-700 border-indigo-100",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
};

const MentorTasks = () => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [programs, setPrograms] = useState([]);

  // PAGINATION STATE
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [totalPages, setTotalPages] = useState(1);
  const limit = 1;

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filterOptions = [
    { label: "All Status", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Submitted", value: "submitted" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ];

  const handleTaskCreated = (newTask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await getMentorTasks(page, limit, statusFilter);
      setTasks(res.mentorTasks || []);
      setStats(res.stats || {});
      setTotalPages(res.pagination.totalPages || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [page, statusFilter, showCreateModal]);

  useEffect(() => {
    const fetchMentorPrograms = async () => {
      try {
        const res = await getMentorPrograms();
        setPrograms(res.programs || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentorPrograms();
    fetchTasks();
  }, [showCreateModal]);

  // Handle filter change
  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1); // Important: Reset to first page when filtering
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12 px-4">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Task Management
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic text-sm">
            Assign objectives, track progress, and evaluate submissions.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-black text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-indigo-100 active:scale-95 cursor-pointer"
        >
          <Plus size={18} />
          <span>Create Task</span>
        </button>
      </div>

      {/* STATS STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MiniStat
          label="Total"
          value={stats.totalTasks}
          icon={ClipboardList}
          color="indigo"
        />
        <MiniStat
          label="Review"
          value={stats.pendingReviews}
          icon={Clock}
          color="amber"
        />
        <MiniStat
          label="Approved"
          value={stats.approvedTasks}
          icon={CheckCircle}
          color="emerald"
        />
        <MiniStat
          label="Rejected"
          value={stats.rejectedTasks}
          icon={XCircle}
          color="rose"
        />
        <MiniStat
          label="Late"
          value={stats.lateSubmissions}
          icon={AlertTriangle}
          color="orange"
        />
      </div>

      {/* TASK FEED */}
      <div className="space-y-6">
        {/* TASK FEED HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">
              Assignment Feed
            </h3>

            {/* CUSTOM DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl hover:border-indigo-300 hover:bg-white transition-all duration-300 group cursor-pointer"
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-indigo-600">
                  {
                    filterOptions.find((opt) => opt.value === statusFilter)
                      ?.label
                  }
                </span>
                <ArrowUpRight
                  size={12}
                  className={`text-slate-400 transition-transform duration-300 ${isFilterOpen ? "rotate-0" : "rotate-90"}`}
                />
              </button>

              {isFilterOpen && (
                <>
                  {/* Click outside overlay */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsFilterOpen(false)}
                  />

                  <div className="absolute top-full mt-2 left-0 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-indigo-100/50 p-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setStatusFilter(option.value);
                          setPage(1);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer ${
                          statusFilter === option.value
                            ? "bg-indigo-50 text-indigo-600"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <span className="text-[10px] font-bold text-slate-400">
            {stats.totalTasks || 0} active tasks
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-center">
            <SearchX size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">
              No tasks found
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="group relative bg-white rounded-4xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* STATUS INDICATOR BAR */}
                    <div
                      className={`w-full lg:w-2 h-2 lg:h-auto ${
                        task.status === "approved"
                          ? "bg-emerald-500"
                          : task.status === "rejected"
                            ? "bg-rose-500"
                            : task.status === "submitted"
                              ? "bg-indigo-500"
                              : "bg-slate-200"
                      }`}
                    />

                    <div className="p-6 lg:p-8 flex-1">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* TASK CONTENT */}
                        <div className="space-y-4 max-w-2xl">
                          <div className="flex items-center gap-3">
                            <h2 className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                              {task.title}
                            </h2>
                            <span
                              className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${priorityColors[task.priority]}`}
                            >
                              {task.priority} Priority
                            </span>
                          </div>

                          <p className="text-sm text-slate-500 font-medium leading-relaxed italic">
                            "{task.description}"
                          </p>

                          <div className="flex flex-wrap gap-4 pt-2">
                            <MetaPill
                              icon={User}
                              label="Intern"
                              value={task.assignedIntern?.name}
                            />
                            <MetaPill
                              icon={Layers}
                              label="Status"
                              value={task.status}
                              colorBadge={statusColors[task.status]}
                            />
                            <MetaPill
                              icon={Calendar}
                              label="Deadline"
                              value={new Date(task.deadline).toDateString()}
                            />
                          </div>
                        </div>

                        {/* ACTION AREA */}
                        <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 min-w-40">
                          <div className="text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              Attempts
                            </p>
                            <p className="text-lg font-black text-slate-700">
                              {task.attempts}
                            </p>
                          </div>

                          {task.status === "submitted" &&
                          task.reviewStatus !== "reviewed" ? (
                            <button
                              onClick={() => setSelectedTask(task)}
                              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-black text-white rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                            >
                              Review <ArrowUpRight size={14} />
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                              <CheckCircle size={14} />{" "}
                              {task.status === "approved"
                                ? "Completed"
                                : "Evaluated"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION COMPONENT */}
            <Pagination page={page} totalPages={totalPages} setPage={setPage} />
          </>
        )}
      </div>

      {/* MODALS */}
      {showCreateModal && (
        <CreateTaskModal
          programs={programs}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleTaskCreated}
        />
      )}

      {selectedTask && (
        <ReviewTaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          refresh={fetchTasks}
        />
      )}
    </div>
  );
};

// --- SUB COMPONENTS (UNCHANGED) ---

const MiniStat = ({ label, value, icon: Icon, color }) => {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
    orange: "bg-orange-50 text-orange-600",
  };
  return (
    <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
      <div className={`p-2 rounded-xl ${colors[color]}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter leading-none">
          {label}
        </p>
        <p className="text-xl font-black text-slate-800 leading-tight">
          {value || 0}
        </p>
      </div>
    </div>
  );
};

const MetaPill = ({ icon: Icon, label, value, colorBadge }) => (
  <div className="flex items-center gap-2">
    <div className="p-1.5 bg-slate-50 text-slate-400 rounded-lg">
      <Icon size={12} />
    </div>
    <div className="flex flex-col">
      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">
        {label}
      </span>
      <span
        className={`text-[11px] font-bold ${colorBadge ? `px-1.5 py-0.5 rounded ${colorBadge} inline-block w-fit mt-0.5` : "text-slate-700"}`}
      >
        {value || "N/A"}
      </span>
    </div>
  </div>
);

export default MentorTasks;
