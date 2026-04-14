import { useState } from "react";
import { X, Star, Link, FileText, Download, User, Mail, MessageSquare, CheckCircle, AlertCircle } from "lucide-react";
import { toastError, toastSuccess } from "../../utils/toast";
import { reviewTask } from "../../api/mentor.api";

const ReviewTaskModal = ({ task, onClose, refresh }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    status: "approved",
    score: "",
    feedback: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.score === "" || form.score < 0 || form.score > 10) {
      return toastError("Score must be between 0 and 10");
    }

    try {
      setLoading(true);
      await reviewTask(task._id, {
        status: form.status,
        score: Number(form.score),
        feedback: form.feedback,
      });
      toastSuccess("Task reviewed successfully");
      await refresh();
      onClose();
    } catch (error) {
      toastError(error.response?.data?.message || "Failed to review task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in duration-300">
        
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Evaluate Submission</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Reviewing Task ID: {task._id.slice(-6)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* ================= BODY ================= */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          
          {/* 1. TASK CONTEXT SECTION */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600">
               <FileText size={18} />
               <h3 className="text-xs font-black uppercase tracking-[0.2em]">Assignment Details</h3>
            </div>
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
              <h4 className="text-lg font-extrabold text-slate-800 mb-2">{task.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium mb-6">
                {task.description}
              </p>
              
              <div className="flex flex-wrap gap-6 pt-6 border-t border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Intern</p>
                    <p className="text-sm font-bold text-slate-700">{task.assignedIntern?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Email</p>
                    <p className="text-sm font-bold text-slate-700">{task.assignedIntern?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. THE SUBMISSION (THE WORK) */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-600">
               <CheckCircle size={18} />
               <h3 className="text-xs font-black uppercase tracking-[0.2em]">Intern's Submission</h3>
            </div>

            <div className="space-y-4">
                {/* Submission Text Area */}
                {task.submissionText && (
                  <div className="bg-emerald-50/30 border border-emerald-100 rounded-3xl p-6 relative">
                    <MessageSquare className="absolute top-6 right-6 text-emerald-200" size={24} />
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">Written Response</p>
                    <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      {task.submissionText}
                    </div>
                  </div>
                )}

                {/* Attachments Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {task.submissionLink && (
                     <a href={task.submissionLink} target="_blank" rel="noreferrer" 
                        className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-50 transition-all group">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                              <Link size={16} />
                           </div>
                           <span className="text-xs font-bold text-slate-600 tracking-tight">Live Project Link</span>
                        </div>
                        <ArrowRight size={14} className="text-slate-300" />
                     </a>
                   )}

                   {task.submissionFile && (
                     <a href={task.submissionFile} target="_blank" rel="noreferrer" 
                        className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-50 transition-all group">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                              <Download size={16} />
                           </div>
                           <span className="text-xs font-bold text-slate-600 tracking-tight">Attached File</span>
                        </div>
                        <ArrowRight size={14} className="text-slate-300" />
                     </a>
                   )}
                </div>
            </div>
          </section>

          {/* 3. YOUR REVIEW (FORM) */}
          <section className="pt-8 border-t border-slate-100 space-y-6">
            <div className="flex items-center gap-2 text-slate-800">
               <Star size={18} className="text-amber-500 fill-amber-500" />
               <h3 className="text-xs font-black uppercase tracking-[0.2em]">Your Grading</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* STATUS */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Decision</label>
                <div className="relative">
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="approved">✅ Approve Task</option>
                    <option value="rejected">❌ Reject & Request Resubmission</option>
                  </select>
                </div>
              </div>

              {/* SCORE */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Score (out of 10)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    name="score"
                    value={form.score}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Enter score..."
                  />
                  <Star className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-200" size={16} />
                </div>
              </div>
            </div>

            {/* FEEDBACK */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reviewer Feedback</label>
              <textarea
                rows="4"
                name="feedback"
                value={form.feedback}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-5 py-4 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                placeholder="Share your thoughts or suggest improvements..."
              />
            </div>
          </section>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={handleSubmit}
            className="px-10 py-3 bg-indigo-600 hover:bg-black text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Processing..." : "Submit Decision"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Simple Arrow helper for links
const ArrowRight = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14m-7-7 7 7-7 7" />
  </svg>
);

export default ReviewTaskModal;