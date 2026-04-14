/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import {
  getPendingReviews,
  approveReview,
  rejectReview,
} from "../../api/superAdmin.api";
import { toastError, toastSuccess } from "../../utils/toast";
import { Check, X } from "lucide-react";
import Loading from "../../components/common/Loading";

const PendingReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await getPendingReviews();
      setReviews(res.reviews || []);
    } catch (error) {
      toastError("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await approveReview(id);
      toastSuccess(res.message || "Review approved");

      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (error) {
      toastError(error?.response?.data?.message || "Failed to approve review");
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await rejectReview(id);
      toastSuccess(res.message || "Review rejected");

      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (error) {
      toastError(error?.response?.data?.message || "Failed to reject review");
    }
  };

  if (loading) {
    return <Loading />;
  }
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Pending Reviews
        </h1>
        <p className="text-gray-500 text-sm">
          Approve or reject intern reviews before publishing
        </p>
      </div>

      {/* REVIEW TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No pending reviews
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {/* TABLE HEADER */}
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Intern</th>
                  <th className="px-6 py-4 text-left font-semibold">Company</th>
                  <th className="px-6 py-4 text-left font-semibold">Program</th>
                  <th className="px-6 py-4 text-left font-semibold">Rating</th>
                  <th className="px-6 py-4 text-left font-semibold">Comment</th>
                  <th className="px-6 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* TABLE BODY */}
              <tbody className="divide-y">
                {reviews.map((review) => (
                  <tr key={review._id} className="hover:bg-gray-50 transition">
                    {/* INTERN */}
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {review.intern?.name}
                    </td>

                    {/* COMPANY */}
                    <td className="px-6 py-4 text-gray-700">
                      {review.company?.name}
                    </td>

                    {/* PROGRAM */}
                    <td className="px-6 py-4 text-gray-600">
                      {review.program?.title}
                    </td>

                    {/* RATING */}
                    <td className="px-6 py-4">
                      <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-xs font-semibold">
                        ⭐ {review.rating}
                      </span>
                    </td>

                    {/* COMMENT */}
                    <td className="px-6 py-4 text-gray-600 max-w-xs">
                      {review.comment}
                    </td>

                    {/* ACTION BUTTONS */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleApprove(review._id)}
                          className="flex items-center gap-1 bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer"
                        >
                          <Check size={14} />
                          Approve
                        </button>

                        <button
                          onClick={() => handleReject(review._id)}
                          className="flex items-center gap-1 bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer"
                        >
                          <X size={14} />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingReviews;
