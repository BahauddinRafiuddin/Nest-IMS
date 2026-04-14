/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState, useMemo } from "react";
import {
  getAllPrograms,
  changeProgramStatus,
  exportProgramsApi,
} from "../../api/program.api";
import {
  SearchX,
  Plus,
  Search,
  Calendar,
  Clock,
  User as UserIcon,
  Briefcase,
  Tag,
  CheckCircle2,
  Edit3,
  UserPlus,
  Layers,
  Download,
} from "lucide-react";

import ProgramStatusBadge from "../../components/program/ProgramStatusBadge";
import EnrollInternModal from "../../components/program/EnrollInternModal";
import CreateProgramModal from "../../components/program/CreateProgramModal";
import UpdateProgramModal from "../../components/program/UpdateProgramModal";
import { toastError, toastSuccess } from "../../utils/toast";
import ConfirmModal from "../../components/common/ConfirmModal";
import Pagination from "../../components/common/Pagination";
import Loading from "../../components/common/Loading";

const Programs = () => {
  const [confirmData, setConfirmData] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editProgram, setEditProgram] = useState(null);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 1; // Updated limit

  const fetchPrograms = async () => {
    try {
      // setLoading(true)
      const res = await getAllPrograms(page, limit, search);
      setPrograms(res.programs || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      toastError(err.response?.data?.message || "Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, [page, search]);

  const handleExport = async (format) => {
    if (programs.length === 0) {
      return toastError("No data available to export");
    }
    setLoading(true);
    try {
      await exportProgramsApi(search, format);
      toastSuccess(`${format.toUpperCase()} exported successfully`);
    } catch (err) {
      toastError(err.message || "Export failed");
    } finally {
      setLoading(false);
    }
  };
  const handleStatusChange = async (program) => {
    let nextStatus = program.status === "upcoming" ? "active" : "completed";
    if (nextStatus === "completed" && program.totalTasks < 10) {
      toastError("Program must have at least 10 tasks before completing.");
      return;
    }
    try {
      await changeProgramStatus(program._id, nextStatus);
      toastSuccess(`Program marked as ${nextStatus}`);
      fetchPrograms();
    } catch (err) {
      toastError(err.response?.data?.message || "Status update failed");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* MODALS */}
      {showCreate && (
        <CreateProgramModal
          onClose={() => setShowCreate(false)}
          refresh={fetchPrograms}
        />
      )}
      {selectedProgram && (
        <EnrollInternModal
          program={selectedProgram}
          onClose={() => setSelectedProgram(null)}
          refresh={fetchPrograms}
        />
      )}
      {editProgram && (
        <UpdateProgramModal
          program={editProgram}
          onClose={() => setEditProgram(null)}
          refresh={fetchPrograms}
        />
      )}
      {confirmData && (
        <ConfirmModal
          title="Update Status"
          message={`Transition "${confirmData.program.title}" to ${confirmData.nextStatus.toUpperCase()}?`}
          onConfirm={() => {
            handleStatusChange(confirmData.program);
            setConfirmData(null);
          }}
          onCancel={() => setConfirmData(null)}
        />
      )}

      {/* HEADER AREA */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Internship Programs
          </h1>
          <p className="text-slate-500 mt-1">
            Curate and oversee the educational journey of your interns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group flex-1 min-w-75">
            <Search
              className="absolute left-3 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
              size={18}
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search programs, domains, or mentors..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport("excel")}
              disabled={loading}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-emerald-50 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm cursor-pointer"
            >
              <Download size={16} className="text-emerald-600" /> Excel
            </button>
            <button
              onClick={() => handleExport("pdf")}
              disabled={loading}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-rose-50 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm cursor-pointer"
            >
              <Download size={16} className="text-rose-600" /> PDF
            </button>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95 cursor-pointer"
          >
            <Plus size={20} />
            <span>Create</span>
          </button>
        </div>
      </div>

      {/* PROGRAMS LIST */}
      {programs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
          <SearchX size={60} className="text-slate-200 mb-4" />
          <h3 className="text-lg font-bold text-slate-800">
            No programs found
          </h3>
          <p className="text-slate-500 text-sm mb-6">
            Try adjusting your search filters.
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-indigo-600 font-bold hover:underline"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {programs.map((program) => (
            <div
              key={program._id}
              className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-indigo-200 transition-all duration-300"
            >
              {/* Status Side Accent */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  program.status === "active"
                    ? "bg-emerald-500"
                    : program.status === "upcoming"
                      ? "bg-amber-500"
                      : "bg-slate-400"
                }`}
              />

              <div className="p-6 flex flex-col lg:flex-row gap-6">
                {/* Main Content */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {program.title}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <ProgramStatusBadge status={program.status} />
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${program.type === "paid" ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-slate-100 text-slate-600"}`}
                        >
                          {program.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 italic">
                    {program.description ||
                      "No description provided for this internship program."}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                    <InfoItem
                      icon={Layers}
                      label="Domain"
                      value={program.domain}
                    />
                    <InfoItem
                      icon={UserIcon}
                      label="Mentor"
                      value={program.mentor?.name}
                    />
                    <InfoItem
                      icon={Clock}
                      label="Duration"
                      value={`${program.durationInWeeks} Weeks`}
                    />
                    <InfoItem
                      icon={Tag}
                      label="Price"
                      value={
                        program.type === "free" ? "Free" : `₹${program.price}`
                      }
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400" />
                      <span className="text-xs font-semibold text-slate-500">
                        {new Date(program.startDate).toLocaleDateString(
                          "en-GB",
                          { day: "2-digit", month: "short" },
                        )}{" "}
                        —{" "}
                        {new Date(program.endDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-slate-400" />
                      <span className="text-xs font-semibold text-slate-500">
                        Min. Tasks: {program.minimumTasksRequired}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vertical Divider (Desktop Only) */}
                <div className="hidden lg:block w-px bg-slate-100" />

                {/* Actions Section */}
                <div className="flex flex-row lg:flex-col justify-center gap-3 shrink-0">
                  {program.status === "upcoming" && (
                    <ActionButton
                      onClick={() => setSelectedProgram(program)}
                      icon={UserPlus}
                      label="Enroll"
                      variant="indigo"
                    />
                  )}
                  {program.status !== "completed" && (
                    <>
                      <ActionButton
                        onClick={() =>
                          setConfirmData({
                            program,
                            nextStatus:
                              program.status === "upcoming"
                                ? "active"
                                : "completed",
                          })
                        }
                        icon={CheckCircle2}
                        label={
                          program.status === "upcoming"
                            ? "Activate"
                            : "Complete"
                        }
                        variant={
                          program.status === "upcoming" ? "blue" : "emerald"
                        }
                      />
                      <ActionButton
                        onClick={() => setEditProgram(program)}
                        icon={Edit3}
                        label="Edit"
                        variant="amber"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center pt-6">
        <Pagination
          page={page}
          totalPages={totalPages}
          setPage={(newPage) => {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: "smooth" }); // Good UX: scroll to top on page change
          }}
        />
      </div>
    </div>
  );
};

// Sub-components for cleaner code
const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-1.5 text-slate-400">
      <Icon size={14} />
      <span className="text-[10px] font-bold uppercase tracking-wider">
        {label}
      </span>
    </div>
    <p className="text-sm font-bold text-slate-700 truncate">{value || "—"}</p>
  </div>
);

const ActionButton = ({ onClick, icon: Icon, label, variant }) => {
  const styles = {
    indigo:
      "bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border-indigo-100",
    blue: "bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border-blue-100",
    emerald:
      "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border-emerald-100",
    amber:
      "bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white border-amber-100",
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-200 active:scale-95 cursor-pointer w-full lg:min-w-30 ${styles[variant]}`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
};

export default Programs;
