import { useEffect, useState } from "react";
import { enrollIntern, getAvailableInterns } from "../../api/program.api";
import { toastError, toastSuccess } from "../../utils/toast";

const EnrollInternModal = ({ program, onClose, refresh }) => {
  const [interns, setInterns] = useState([]);
  const [internId, setInternId] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================
  // Load interns
  // ==========================
  useEffect(() => {
    const loadInterns = async () => {
      try {
        const res = await getAvailableInterns();
        setInterns(res.interns);
      } catch {
        toastError("Failed to load interns");
      }
    };

    loadInterns();
  }, []);

  // Enroll intern
 const handleEnroll = async (e) => {
  e.preventDefault();

  if (!internId) {
    return toastError("Please select an intern");
  }

  try {
    setLoading(true);

    const res = await enrollIntern(internId,program._id);

    toastSuccess(res.message);

    refresh();
    onClose();

  } catch (err) {
    toastError(
      err.response?.data?.message ||
      "Failed to enroll intern"
    );

  } finally {
    setLoading(false);
  }
};


  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleEnroll}
        className="bg-white w-full max-w-md rounded-xl p-6 space-y-5"
      >
        <h2 className="text-xl font-bold text-gray-800">Enroll Intern</h2>

        <p className="text-sm text-gray-500">
          Program: <b>{program.title}</b>
        </p>

        <select
          className="border p-3 w-full rounded"
          value={internId}
          onChange={(e) => setInternId(e.target.value)}
          required
        >
          <option value="">Select Intern</option>

          {interns.map((intern) => (
            <option key={intern._id} value={intern._id}>
              {intern.name} ({intern.email})
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-4 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Enrolling..." : "Enroll"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnrollInternModal;
