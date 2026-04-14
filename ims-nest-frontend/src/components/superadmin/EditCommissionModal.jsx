import { useState } from "react";
import { X } from "lucide-react";
import { updateCompanyCommission } from "../../api/superAdmin.api";
import { toastError, toastSuccess } from "../../utils/toast";

const EditCommissionModal = ({ company, onClose, onSuccess }) => {
  const [commission, setCommission] = useState(
    company.commissionPercentage || 0,
  )
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (commission === "" || commission === null) {
      return toastError("Commission cannot be empty");
    }

    if (commission <= 0) {
      return toastError("Commission must be greater than zero");
    }

    if (commission > 100) {
      return toastError("Commission cannot be more than 100%");
    }

    try {
      setLoading(true);
      const res = await updateCompanyCommission(
        company._id,
        Number(commission),
      )
      toastSuccess(res.data?.message || "Commission updated successfully");
      onSuccess()
      onClose()
    } catch (err) {
      toastError(err.data?.message || "Failed to update commission");
    } finally {
      setLoading(false)
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Edit Commission
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">
              Commission Percentage (%)
            </label>
            <input
              type="number"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition cursor-pointer"
          >
            {loading ? "Updating..." : "Update Commission"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCommissionModal;
