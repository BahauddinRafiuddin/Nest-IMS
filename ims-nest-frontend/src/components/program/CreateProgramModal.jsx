import { useEffect, useState } from "react";
import { createProgram } from "../../api/program.api";
import { getAvailableMentors } from "../../api/admin.api";
import { toastError, toastSuccess } from "../../utils/toast";
import { 
  X, 
  BookOpen, 
  User, 
  Calendar, 
  IndianRupee, 
  ClipboardList, 
  FileText,
  Info
} from "lucide-react";

const domains = [
  "Backend Development",
  "Frontend Development",
  "Web Development",
  "AI / ML",
  "Data Science",
  "Mobile App Development",
];

const CreateProgram = ({ onClose, refresh }) => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    title: "",
    domain: "",
    description: "",
    mentor: "",
    durationInWeeks: "",
    minimumTasksRequired: "",
    startDate: "",
    endDate: "",
    type: "free",
    price: 0,
    rules: "",
  });

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const loadMentors = async () => {
      try {
        const res = await getAvailableMentors();
        setMentors(res.mentors);
      } catch {
        toastError("Failed to load mentors");
      }
    };
    loadMentors();
  }, []);

  console.log(mentors)
  const calculateDuration = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffDays = (e - s) / (1000 * 60 * 60 * 24);
    if (diffDays < 7) {
      toastError("Minimum program duration is 1 week");
      return 0;
    }
    return Math.ceil(diffDays / 7);
  };

  const getMinEndDate = () => {
    if (!form.startDate) return today;
    const start = new Date(form.startDate);
    start.setDate(start.getDate() + 7);
    return start.toISOString().split("T")[0];
  };

  const validate = () => {
    const err = {};
    if (!form.title.trim()) err.title = "Program title is required";
    if (!form.domain) err.domain = "Domain is required";
    if (!form.mentor) err.mentor = "Mentor selection is required";
    if (!form.minimumTasksRequired) err.minimumTasksRequired = "Specify MinimumTasks it is required";
    if (form.minimumTasksRequired > 30) err.minimumTasksRequired = "Not More Than 30";
    if (!form.startDate) err.startDate = "Start date is required";
    if (!form.endDate) err.endDate = "End date is required";
    if (!form.description.trim()) err.description = "Description is required";
    if (!form.rules.trim()) err.rules = "Rules are required";
    if (form.type === "paid" && (!form.price || form.price <= 0)) {
      err.price = "Price must be greater than 0";
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...form, [name]: value };
    if ((name === "startDate" || name === "endDate") && updated.startDate && updated.endDate) {
      if (new Date(updated.endDate) <= new Date(updated.startDate)) {
        toastError("End date must be after start date");
        return;
      }
      const weeks = calculateDuration(updated.startDate, updated.endDate);
      if (weeks > 0) updated.durationInWeeks = weeks;
    }
    if (name === "type" && value === "free") {
      updated.price = 0;
    }
    setForm(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      await createProgram(form);
      toastSuccess("Program created successfully");
      refresh();
      onClose();
    } catch (err) {
      toastError(err.response?.data?.message || "Failed to create program");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Create Program</h2>
            <p className="text-slate-500 text-sm font-medium mt-1">Design a new internship experience for your students.</p>
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
        <div className="px-8 py-8 space-y-10 overflow-y-auto custom-scrollbar">
          
          {/* SECTION 1: GENERAL INFO */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
              <BookOpen size={20} className="text-indigo-600" />
              <h3 className="font-bold text-slate-700 uppercase tracking-wider text-sm">Basic Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Program Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Full Stack Web Development Immersive"
                  className={`w-full bg-slate-50 border ${errors.title ? 'border-red-500' : 'border-slate-200'} rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium`}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Domain</label>
                <select
                  name="domain"
                  value={form.domain}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border ${errors.domain ? 'border-red-500' : 'border-slate-200'} rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold cursor-pointer appearance-none`}
                >
                  <option value="">Select domain</option>
                  {domains.map((d) => <option key={d}>{d}</option>)}
                </select>
                {errors.domain && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.domain}</p>}
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Assign Mentor</label>
                <select
                  name="mentor"
                  value={form.mentor}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border ${errors.mentor ? 'border-red-500' : 'border-slate-200'} rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold cursor-pointer appearance-none`}
                >
                  <option value="">Select mentor</option>
                  {mentors.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
                </select>
                {errors.mentor && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.mentor}</p>}
              </div>
            </div>
          </section>

          {/* SECTION 2: SCHEDULE & REQUIREMENTS */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-l-4 border-emerald-500 pl-3">
              <Calendar size={20} className="text-emerald-500" />
              <h3 className="font-bold text-slate-700 uppercase tracking-wider text-sm">Schedule & Tasks</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-4xl border border-slate-100">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  min={today}
                  value={form.startDate}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  min={getMinEndDate()}
                  value={form.endDate}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Duration</label>
                <div className="w-full bg-slate-200/50 border border-slate-200 rounded-xl px-4 py-2.5 font-black text-slate-600 text-center">
                  {form.durationInWeeks || 0} Weeks
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Minimum Tasks for Completion</label>
                <div className="relative">
                  <ClipboardList className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="number"
                    name="minimumTasksRequired"
                    value={form.minimumTasksRequired}
                    onChange={handleChange}
                    placeholder="e.g. 10"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold"
                  />
                </div>
                {errors.minimumTasksRequired && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.minimumTasksRequired}</p>}
              </div>
            </div>
          </section>

          {/* SECTION 3: PRICING */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-l-4 border-amber-500 pl-3">
              <IndianRupee size={20} className="text-amber-500" />
              <h3 className="font-bold text-slate-700 uppercase tracking-wider text-sm">Pricing Model</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'type', value: 'free' } })}
                  className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${form.type === 'free' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'} cursor-pointer`}
                >
                  Free Program
                </button>
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'type', value: 'paid' } })}
                  className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${form.type === 'paid' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500'} cursor-pointer`}
                >
                  Paid Program
                </button>
              </div>

              {form.type === "paid" && (
                <div className="animate-in slide-in-from-left-4 duration-300">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="Enter amount"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none font-black"
                    />
                  </div>
                  {errors.price && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.price}</p>}
                </div>
              )}
            </div>
          </section>

          {/* SECTION 4: CONTENT */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-l-4 border-slate-800 pl-3">
              <FileText size={20} className="text-slate-800" />
              <h3 className="font-bold text-slate-700 uppercase tracking-wider text-sm">Program Content</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">About the Program</label>
                <textarea
                  rows={4}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Detailed overview of what students will learn..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 focus:ring-4 focus:ring-slate-500/10 focus:border-slate-800 outline-none transition-all font-medium resize-none"
                />
                {errors.description && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Rules & Expectations</label>
                <textarea
                  rows={4}
                  name="rules"
                  value={form.rules}
                  onChange={handleChange}
                  placeholder="Guidelines, attendance policy, submission rules..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 focus:ring-4 focus:ring-slate-500/10 focus:border-slate-800 outline-none transition-all font-medium resize-none"
                />
                {errors.rules && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.rules}</p>}
              </div>
            </div>
          </section>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-6 border-t border-slate-100 flex justify-end gap-4 bg-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] text-slate-500 hover:bg-slate-50 transition-all cursor-pointer"
          >
            Discard
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-10 py-3 bg-indigo-600 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-70 cursor-pointer"
          >
            {loading ? "Launching..." : "Launch Program"}
          </button>
        </div>
      </form>

      {/* CSS for custom scrollbar */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}} />
    </div>
  );
};

export default CreateProgram;