/* eslint-disable no-unused-vars */
import { useState } from "react";
import { updateProgram } from "../../api/program.api";
import { toastError, toastSuccess } from "../../utils/toast";
import { 
  X, 
  BookOpen, 
  Layers, 
  Calendar, 
  Clock, 
  FileText, 
  ShieldCheck, 
  Edit3 
} from "lucide-react";

const domains = [
  "Backend Development",
  "Frontend Development",
  "Web Development",
  "AI / ML",
  "Data Science",
  "Mobile App Development",
];

const UpdateProgramModal = ({ program, onClose, refresh }) => {
  const [loading, setLoading] = useState(false);
  const [durationInweek, setDurationInWeek] = useState(program.durationInWeeks);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    title: program.title || "",
    domain: program.domain || "",
    description: program.description || "",
    rules: program.rules || "",
    startDate: program.startDate?.slice(0, 10) || "",
    endDate: program.endDate?.slice(0, 10) || "",
  });

  const today = new Date().toISOString().split("T")[0];

  const getMinEndDate = () => {
    if (!form.startDate) return today;
    const start = new Date(form.startDate);
    start.setDate(start.getDate() + 7);
    return start.toISOString().split("T")[0];
  };

  const calculateDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate - startDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays < 7) {
      toastError("Duration must be minimum one week");
      return 0;
    }
    return Math.ceil(diffDays / 7);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    else if (form.title.length < 5) newErrors.title = "Minimum 5 characters required";
    else if (form.title.length > 100) newErrors.title = "Maximum 100 characters allowed";

    if (!form.domain) newErrors.domain = "Domain is required";
    if (!form.startDate) newErrors.startDate = "Start date is required";
    if (!form.endDate) newErrors.endDate = "End date is required";

    if (!form.description.trim()) newErrors.description = "Description is required";
    else if (form.description.length < 10) newErrors.description = "Minimum 10 characters required";
    else if (form.description.length > 500) newErrors.description = "Maximum 500 characters allowed";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };

    if ((name === "startDate" || name === "endDate") && updatedForm.startDate && updatedForm.endDate) {
      if (new Date(updatedForm.endDate) <= new Date(updatedForm.startDate)) {
        toastError("End date must be after start date");
        return;
      }
      const weeks = calculateDuration(updatedForm.startDate, updatedForm.endDate);
      if (weeks > 0) {
        setDurationInWeek(weeks);
        updatedForm.durationInWeeks = weeks;
      }
    }
    setForm(updatedForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      const res = await updateProgram(program._id, form);
      toastSuccess(res.message);
      refresh();
      onClose();
    } catch (err) {
      toastError(err.response?.data?.message || "Failed to update program");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Edit3 size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Update Program</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Editing: {program.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-all cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* BODY */}
        <div className="px-8 py-8 space-y-8 overflow-y-auto custom-scrollbar">
          
          {/* CORE DETAILS SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <FormLabel icon={BookOpen} label="Program Title" />
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter program title"
                className={`w-full bg-slate-50 border ${errors.title ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'} rounded-2xl px-5 py-3.5 transition-all outline-none font-medium text-slate-700`}
              />
              {errors.title && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-2">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <FormLabel icon={Layers} label="Domain" />
              <select
                name="domain"
                value={form.domain}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-slate-700 cursor-pointer appearance-none"
              >
                <option value="">Select domain</option>
                {domains.map((d) => <option key={d}>{d}</option>)}
              </select>
              {errors.domain && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-2">{errors.domain}</p>}
            </div>

            <div className="space-y-2">
              <FormLabel icon={Clock} label="Calculated Duration" />
              <div className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-3.5 font-black text-slate-500 flex items-center justify-center gap-2">
                {durationInweek} Weeks <span className="text-[10px] font-medium text-slate-400">(Auto-updated)</span>
              </div>
            </div>
          </div>

          {/* DATE PICKERS */}
          <div className="bg-blue-50/50 p-6 rounded-4xl border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <FormLabel icon={Calendar} label="Start Date" />
              <input
                type="date"
                name="startDate"
                min={today}
                value={form.startDate}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
              {errors.startDate && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-1">{errors.startDate}</p>}
            </div>

            <div className="space-y-2">
              <FormLabel icon={Calendar} label="End Date" />
              <input
                type="date"
                name="endDate"
                min={getMinEndDate()}
                value={form.endDate}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
              {errors.endDate && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* TEXT AREAS */}
          <div className="space-y-6">
            <div className="space-y-2">
              <FormLabel icon={ShieldCheck} label="Internship Rules (Optional)" />
              <textarea
                name="rules"
                value={form.rules}
                onChange={handleChange}
                rows={3}
                placeholder="List requirements or behavior guidelines..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-slate-600 resize-none"
              />
            </div>

            <div className="space-y-2">
              <FormLabel icon={FileText} label="Program Description" />
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="What will interns learn in this program?"
                className={`w-full bg-slate-50 border ${errors.description ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'} rounded-2xl px-5 py-4 transition-all outline-none font-medium text-slate-600 resize-none`}
              />
              {errors.description && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-2">{errors.description}</p>}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-6 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/30 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] text-slate-500 hover:bg-white hover:shadow-md transition-all cursor-pointer"
          >
            Cancel Changes
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-10 py-3 bg-blue-600 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Syncing..." : "Update Program"}
          </button>
        </div>
      </form>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
};

// Sub-component for clean labels
const FormLabel = ({ icon: Icon, label }) => (
  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
    <Icon size={14} className="text-blue-500" />
    {label}
  </label>
);

export default UpdateProgramModal;