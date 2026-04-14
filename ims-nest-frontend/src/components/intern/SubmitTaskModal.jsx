import { useState } from "react";
import { X } from "lucide-react";

const SubmitTaskModal = ({ task, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    submissionText: "",
    submissionLink: "",
    submissionFile: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    if (!form.submissionText && !form.submissionLink && !form.submissionFile) {
      alert("Please provide at least one submission field");
      return;
    }

    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
        >
          <X />
        </button>

        <h2 className="text-xl font-bold mb-4">Submit Task</h2>

        <p className="text-sm text-gray-500 mb-4">{task.title}</p>

        {/* Text */}
        <textarea
          name="submissionText"
          placeholder="Submission explanation"
          rows="4"
          className="w-full border rounded-lg p-3 mb-3"
          value={form.submissionText}
          onChange={handleChange}
        />

        {/* Link */}
        <input
          type="text"
          name="submissionLink"
          placeholder="GitHub / Drive link"
          className="w-full border rounded-lg p-3 mb-3"
          value={form.submissionLink}
          onChange={handleChange}
        />

        {/* File URL */}
        <input
          type="text"
          name="submissionFile"
          placeholder="File URL (optional)"
          className="w-full border rounded-lg p-3 mb-5"
          value={form.submissionFile}
          onChange={handleChange}
        />

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            Submit Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitTaskModal;
