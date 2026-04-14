/* eslint-disable no-unused-vars */
import { useState } from "react";
import { X, ClipboardList, AlignLeft, Layers, User, AlertCircle, Calendar } from "lucide-react";
import { toastError, toastSuccess } from "../../utils/toast";
import { createTask } from "../../api/mentor.api";

const CreateTaskModal = ({ programs, onClose, onCreated }) => {
  const [loading, setLoading] = useState(false);
  const [deadlineError, setDeadlineError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    title: "",
    description: "",
    programId: "",
    internId: "",
    priority: "medium",
    deadline: "",
  });

  const selectedProgram = programs.find((p) => p._id === form.programId);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "deadline") {
      if (value < today) {
        setDeadlineError("Deadline cannot be earlier than today");
      } else {
        setDeadlineError("");
      }
    }

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    if (!form.title || !form.programId || !form.internId || !form.deadline) {
      return toastError("Please fill all required fields");
    }

    if (form.deadline < today) {
      return setDeadlineError("Deadline cannot be earlier than today");
    }

    try {
      setLoading(true);
      const res = await createTask(form);
      toastSuccess("Task created successfully");
      onCreated(res.task);
      onClose();
    } catch (err) {
      toastError(err.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* ================= HEADER ================= */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Create New Task</h2>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">Assignment Details</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-xl transition-all cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* ================= FORM CONTENT ================= */}
        <div className="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* LEFT COLUMN: PRIMARY INFO */}
            <div className="md:col-span-2 space-y-5">
              <FormLabel icon={ClipboardList} label="Task Title" required />
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Implement User Authentication"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-slate-700 font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="md:col-span-2 space-y-5">
              <FormLabel icon={AlignLeft} label="Task Description" />
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="3"
                placeholder="Briefly explain the requirements..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-slate-700 font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none placeholder:text-slate-400"
              />
            </div>

            {/* RIGHT COLUMN: ASSIGNMENT SETTINGS */}
            <div className="space-y-5">
              <FormLabel icon={Layers} label="Target Program" required />
              <select
                name="programId"
                value={form.programId}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-slate-700 font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none cursor-pointer appearance-none"
              >
                <option value="">Select program</option>
                {programs.map((p) => (
                  <option key={p._id} value={p._id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-5">
              <FormLabel icon={User} label="Assign Intern" required />
              <select
                name="internId"
                value={form.internId}
                onChange={handleChange}
                disabled={!selectedProgram}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-slate-700 font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
              >
                <option value="">Select intern</option>
                {selectedProgram?.interns?.length > 0 ? (
                  selectedProgram.interns.map((i) => (
                    <option key={i.intern._id} value={i.intern._id}>{i.intern.name}</option>
                  ))
                ) : (
                  <option disabled>No interns enrolled</option>
                )}
              </select>
            </div>

            <div className="space-y-5">
              <FormLabel icon={AlertCircle} label="Priority Level" />
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-slate-700 font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none cursor-pointer appearance-none"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div className="space-y-5">
              <FormLabel icon={Calendar} label="Completion Deadline" required />
              <input
                type="date"
                name="deadline"
                min={today}
                value={form.deadline}
                onChange={handleChange}
                className={`w-full bg-slate-50 border rounded-2xl px-5 py-3 font-bold outline-none transition-all cursor-pointer
                ${deadlineError ? "border-red-500 ring-4 ring-red-500/10 text-red-600" : "border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-700"}`}
              />
              {deadlineError && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-2">{deadlineError}</p>}
            </div>
          </div>
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="p-8 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-4 bg-slate-50/30">
          <button
            onClick={onClose}
            className="px-8 py-3.5 border border-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-white hover:shadow-md transition-all cursor-pointer"
          >
            Discard
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-10 py-3.5 bg-indigo-600 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-70 cursor-pointer"
          >
            {loading ? "Processing..." : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Sub-component for clean Labels
const FormLabel = ({ icon: Icon, label, required }) => (
  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1 ml-1">
    <Icon size={14} className="text-indigo-500" />
    {label} {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

export default CreateTaskModal;