/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import {
  createIntern,
  exportInternsApi,
  getAllInterns,
  updateInternStatus,
} from "../../api/admin.api";
import { toastError, toastSuccess } from "../../utils/toast";
import {
  User,
  Mail,
  X,
  Search,
  SearchX,
  UserPlus,
  ShieldCheck,
  Download,
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";
import Pagination from "../../components/common/Pagination";
import Loading from "../../components/common/Loading";

const Interns = () => {
  const [interns, setInterns] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [toggleStatus, setToggleStatus] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const limit = 5;

  const [form, setForm] = useState({ name: "", email: "" });

  const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]{2,}@[a-z0-9.-]+\.[a-z]{2,}$/;
  const fullNameRegex = /^[A-Za-z ]{3,30}$/;

  const fetchData = async () => {
    try {
      const internRes = await getAllInterns(page, limit, search);
      setInterns(internRes.interns);
      setTotalPages(internRes.totalPages);
    } catch (err) {
      console.log(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const handleExport = async (format) => {
    if (interns.length === 0) {
      return toastError("No data available to export");
    }
    setLoading(true);
    try {
      await exportInternsApi(search, format);
    } catch (error) {
      toastError("Export failed");
    } finally {
      setLoading(false);
    }
  };
  const handleStatusToggle = async (id, status) => {
    try {
      const res = await updateInternStatus(id, status);
      toastSuccess(res.message);
      setToggleStatus(null);
      fetchData();
    } catch (err) {
      toastError(err.response?.data?.message);
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
      const res = await createIntern(form);
      toastSuccess(res.message);
      setForm({ name: "", email: "" });
      setShowForm(false);
      fetchData();
    } catch (err) {
      toastError(err.response?.data?.message || "Creation failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  // Enrollment Status Badge Logic
  const getEnrollmentBadge = (status) => {
    const styles = {
      approved: "bg-blue-50 text-blue-700 border-blue-100",
      in_progress: "bg-amber-50 text-amber-700 border-amber-100",
      completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
      cancelled: "bg-rose-50 text-rose-700 border-rose-100",
      none: "bg-slate-50 text-slate-500 border-slate-100",
    };
    const labels = {
      approved: "Upcoming",
      in_progress: "Active",
      completed: "Alumni",
      cancelled: "Dropped",
      none: "Unenrolled",
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${styles[status || "none"]}`}
      >
        {labels[status || "none"]}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10 px-4">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Intern Directory
          </h1>
          <p className="text-slate-500 mt-1">
            Manage, monitor, and onboard new internship candidates.
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
            <span>Add Intern</span>
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
                  Onboard New Intern
                </h2>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">
                  Registration Details
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
                    placeholder="John Doe"
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
                  Email Address
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
                    placeholder="john@company.com"
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
                {loading ? "Registering..." : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DATA DISPLAY */}
      {interns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
          <SearchX size={64} className="text-slate-200 mb-4" />
          <h2 className="text-xl font-bold text-slate-800">
            No interns matched
          </h2>
          <p className="text-slate-500 max-w-xs mt-2 text-sm">
            We couldn't find any interns matching your current search criteria.
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
                      Identity
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Assigned Mentor
                    </th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      System Status
                    </th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Internship Phase
                    </th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {interns.map((intern) => (
                    <tr
                      key={intern._id}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold shadow-inner">
                            {intern.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                              {intern.name}
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-1">
                              <Mail size={12} />
                              {intern.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">
                        {intern.mentor ? (
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                            {intern.mentor.name}
                          </div>
                        ) : (
                          <span className="text-slate-300 italic">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${intern.isActive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
                        >
                          <ShieldCheck size={12} />{" "}
                          {intern.isActive ? "Active" : "Locked"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getEnrollmentBadge(intern.enrollmentStatus)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setToggleStatus(intern)}
                          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                            intern.isActive
                              ? "text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white"
                              : "text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white"
                          }`}
                        >
                          {intern.isActive ? "Deactivate" : "Activate"}
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

      {toggleStatus && (
        <ConfirmModal
          title="Security Action"
          message={`Are you sure you want to ${toggleStatus.isActive ? "lock" : "unlock"} access for ${toggleStatus.name}?`}
          onCancel={() => setToggleStatus(null)}
          onConfirm={() =>
            handleStatusToggle(toggleStatus._id, !toggleStatus.isActive)
          }
        />
      )}
    </div>
  );
};

export default Interns;
