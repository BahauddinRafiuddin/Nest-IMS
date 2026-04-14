/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import {
  createMentor,
  getAllMentors,
  deleteMentorById,
  exportMentorApi,
} from "../../api/admin.api";
import { toastError, toastSuccess } from "../../utils/toast";
import {
  User,
  Mail,
  X,
  Search,
  SearchX,
  UserPlus,
  Trash2,
  ShieldCheck,
  GraduationCap,
  Clock,
  CheckCircle2,
  Download,
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";
import Pagination from "../../components/common/Pagination";
import Loading from "../../components/common/Loading";

const Mentors = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 5;

  const [deleteMentor, setDeleteMentor] = useState(null);

  const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]{2,}@[a-z0-9.-]+\.[a-z]{2,}$/;
  const fullNameRegex = /^[A-Za-z ]{3,30}$/;

  const [form, setForm] = useState({ name: "", email: "" });

  const fetchMentors = async () => {
    try {
      const res = await getAllMentors(page, limit, search);
      setMentors(res.mentors);
      setTotalPages(res.totalPages);
    } catch (error) {
      toastError(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, [page, search]);

  const handleExport = async (format) => {
    if (mentors.length === 0) {
      return toastError("No data available to export");
    }
    setLoading(true);
    try {
      await exportMentorApi(search, format);
    } catch (error) {
      toastError(error?.response?.data?.message || "Export failed");
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    let err = {};
    if (!form.name.trim()) err.name = "Full name is required";
    else if (!fullNameRegex.test(form.name))
      err.name = "Only alphabets allowed";
    if (!emailRegex.test(form.email)) err.email = "Invalid email address";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      const res = await createMentor(form);
      toastSuccess(res.message);
      setForm({ name: "", email: "" });
      setShowForm(false);
      fetchMentors();
    } catch (err) {
      toastError(err.response?.data?.message || "Mentor creation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await deleteMentorById(deleteMentor._id);
      toastSuccess(res.message);
      setDeleteMentor(null);
      fetchMentors();
    } catch (err) {
      toastError(err.response?.data?.message || "Delete failed");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10 px-4">
      {/* CONFIRM MODAL */}
      {deleteMentor && (
        <ConfirmModal
          title="Delete Mentor Account"
          message={`Are you sure you want to remove "${deleteMentor.name}" from the system? This will also unassign them from their active programs.`}
          onCancel={() => setDeleteMentor(null)}
          onConfirm={handleDelete}
        />
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Mentor Faculty
          </h1>
          <p className="text-slate-500 mt-1">
            Manage expert mentors and track their program performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-70">
            <Search
              className="absolute left-3 top-3 text-slate-400"
              size={18}
            />
            <input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all"
            />
          </div>
          {/* --- EXPORT BUTTONS START --- */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport("excel")}
              disabled={loading}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
              title="Download Excel"
            >
              <Download size={16} className="text-emerald-600" />
              <span className="hidden sm:inline">Excel</span>
            </button>

            <button
              onClick={() => handleExport("pdf")}
              disabled={loading}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
              title="Download PDF"
            >
              <Download size={16} className="text-rose-600" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95 cursor-pointer"
          >
            <UserPlus size={18} />
            <span>Add Mentor</span>
          </button>
        </div>
      </div>

      {/* CREATE FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 bg-slate-50 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Register Mentor
                </h2>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">
                  Faculty Onboarding
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-3 text-slate-400"
                    size={18}
                  />
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Dr. Jane Smith"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                {errors.name && (
                  <p className="text-rose-500 text-[10px] font-bold uppercase">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Professional Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-3 text-slate-400"
                    size={18}
                  />
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="jane@university.edu"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                {errors.email && (
                  <p className="text-rose-500 text-[10px] font-bold uppercase">
                    {errors.email}
                  </p>
                )}
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] disabled:bg-slate-300"
              >
                {loading ? "Registering..." : "Onboard Mentor"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {mentors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
          <SearchX size={64} className="text-slate-200 mb-4" />
          <h2 className="text-xl font-bold text-slate-800">No mentors found</h2>
          <p className="text-slate-500 max-w-xs mt-2 text-sm">
            We couldn't find any mentors matching your search results.
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="mt-4 text-indigo-600 font-bold hover:underline"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Mentor Profile
                    </th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Enrollment Stats
                    </th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Management
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {mentors.map((mentor) => (
                    <tr
                      key={mentor._id}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                            {mentor.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                              {mentor.name}
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-1">
                              <Mail size={12} />
                              {mentor.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <StatBadge
                            icon={GraduationCap}
                            count={mentor.internCount}
                            color="indigo"
                            label="Total"
                          />
                          <StatBadge
                            icon={Clock}
                            count={mentor.activeInternships}
                            color="amber"
                            label="Active"
                          />
                          <StatBadge
                            icon={CheckCircle2}
                            count={mentor.completedInternships}
                            color="emerald"
                            label="Finished"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                          <ShieldCheck size={12} /> Faculty Member
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setDeleteMentor(mentor)}
                          className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all active:scale-90"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </div>
      )}
    </div>
  );
};

const StatBadge = ({ icon: Icon, count, color, label }) => {
  const styles = {
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };
  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[11px] font-bold ${styles[color]}`}
      title={`${label}: ${count}`}
    >
      <Icon size={12} />
      <span>{count || 0}</span>
    </div>
  );
};

export default Mentors;
