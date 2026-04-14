/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { createReview, getMyReview } from "../../api/intern.api";
import { toastError, toastSuccess } from "../../utils/toast";

const InternCreateReview = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  const [myReview, setMyReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // ================= FETCH REVIEW =================
  const fetchMyReview = async () => {
    try {
      const res = await getMyReview();
      setMyReview(res.review || null);
    } catch (error) {
      toastError("Failed to fetch your review");
    } finally {
      setPageLoading(false);
    }
  };
  // console.log(myReview);
  useEffect(() => {
    fetchMyReview();
  }, []);

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!rating) {
      return toastError("Please select a rating");
    }

    try {
      setLoading(true);

      const res = await createReview({
        rating,
        comment,
      });

      toastSuccess(res.message || "Review submitted");

      fetchMyReview();
    } catch (error) {
      toastError(error?.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  // ================= RENDER STARS ================= 
  const renderStars = (value) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={20}
        className={
          i < value ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }
      />
    ));
  };

  if (pageLoading) {
    return <div className="text-center p-12 text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Rate Your Internship
        </h1>
        <p className="text-gray-500 text-sm">
          Share your experience and feedback after successfully completing your
          internship.
        </p>
      </div>

      {/* ================= IF REVIEW EXISTS ================= */}
      {myReview ? (
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-gray-800">Your Review</p>
              <p className="text-xs text-gray-400">
                Submitted on {new Date(myReview.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-1">{renderStars(myReview.rating)}</div>
          </div>

          {myReview.comment && (
            <p className="text-gray-600 text-sm leading-relaxed">
              "{myReview.comment}"
            </p>
          )}

          {myReview.status === "approved" && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3">
              ✅ Your review has been approved and published.
            </div>
          )}

          {myReview.status === "pending" && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded-lg p-3">
              ⏳ Your review is under moderation. It will appear after admin
              approval.
            </div>
          )}

          {myReview.status === "rejected" && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              ❌ Your review was rejected by the admin due to guideline
              violations.
            </div>
          )}
        </div>
      ) : (
        /* ================= CREATE REVIEW FORM ================= */
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-6">
          {/* STAR RATING */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Rating *
            </label>

            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={30}
                  className={`cursor-pointer transition ${
                    (hover || rating) >= star
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>

            <p className="text-xs text-gray-400">Click a star to rate</p>
          </div>

          {/* COMMENT */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Comment (Optional)
            </label>

            <textarea
              rows="4"
              placeholder="Share your experience with the company..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>

          {/* NOTE */}
          <div className="bg-gray-50 border rounded-lg p-3 text-xs text-gray-500">
            ⭐ Ratings are shared directly with the company. 💬 Comments are
            automatically checked by our AI moderation system to ensure
            respectful feedback before being published.
          </div>

          {/* BUTTON */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium transition cursor-pointer disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      )}
    </div>
  );
};

export default InternCreateReview;
