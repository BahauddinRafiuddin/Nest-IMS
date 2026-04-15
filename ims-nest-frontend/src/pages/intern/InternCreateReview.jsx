/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Star, Clock, CheckCircle2, AlertCircle, MessageSquare } from "lucide-react";
import { createReview, getMyReview } from "../../api/intern.api";
import { toastError, toastSuccess } from "../../utils/toast";

const InternCreateReview = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  const [myReview, setMyReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

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

  useEffect(() => {
    fetchMyReview();
  }, []);

  const handleSubmit = async () => {
    if (!rating) return toastError("Please select a rating");

    try {
      setLoading(true);
      const res = await createReview({ rating, comment });
      toastSuccess(res.message || "Review submitted");
      fetchMyReview();
    } catch (error) {
      toastError(error?.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (value, size = 20) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={size}
        className={i < value ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}
      />
    ));
  };

  if (pageLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Loading your review...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* HEADER */}
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Internship Experience
        </h1>
        <p className="mt-2 text-gray-600">
          {myReview 
            ? "Summary of the feedback you provided for your internship." 
            : "We value your feedback. Tell us how your Nest JS Internship went!"}
        </p>
      </div>

      {myReview ? (
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden">
          {/* Status Banner */}
          <div className={`px-6 py-4 flex items-center gap-3 ${
            myReview.status === "APPROVED" ? "bg-green-50" : 
            myReview.status === "REJECTED" ? "bg-red-50" : "bg-blue-50"
          }`}>
            {myReview.status === "APPROVED" && <CheckCircle2 className="text-green-600" size={20} />}
            {myReview.status === "REJECTED" && <AlertCircle className="text-red-600" size={20} />}
            {myReview.status === "PENDING" && <Clock className="text-blue-600 animate-pulse" size={20} />}
            
            <span className={`text-sm font-bold uppercase tracking-wider ${
              myReview.status === "APPROVED" ? "text-green-700" : 
              myReview.status === "REJECTED" ? "text-red-700" : "text-blue-700"
            }`}>
              {myReview.status}
            </span>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{myReview.program?.title}</h3>
                <p className="text-sm text-gray-400">Submitted on {new Date(myReview.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="flex gap-1 bg-gray-50 p-2 rounded-xl">
                {renderStars(myReview.rating, 24)}
              </div>
            </div>

            <div className="relative">
              <MessageSquare className="absolute -top-2 -left-2 text-gray-100 h-10 w-10 -z-10" />
              <p className="text-gray-700 italic text-lg leading-relaxed pl-4 border-l-4 border-gray-100">
                "{myReview.comment || "No comment provided."}"
              </p>
            </div>

            {/* Dynamic Status Messaging */}
            <div className="pt-4 border-t border-gray-50">
              {myReview.status === "APPROVED" && (
                <div className="text-sm text-green-700 font-medium">
                  🎉 Your review is live! It helps other students choose the right programs.
                </div>
              )}

              {myReview.status === "PENDING" && (
                <div className="text-sm text-blue-700 font-medium">
                  🛡️ Under AI Moderation: Our system is currently reviewing your feedback for community guidelines.
                </div>
              )}

              {myReview.status === "REJECTED" && (
                <div className="rounded-2xl bg-red-50 p-4 border border-red-100">
                  <p className="text-sm text-red-800 font-bold mb-1">Super Admin Rejected Your Review</p>
                  <p className="text-xs text-red-600 leading-tight">
                    This usually happens due to the use of profanity, abusive language, or irrelevant content. Please ensure your feedback is professional.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* CREATE REVIEW FORM */
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-8 space-y-8">
          <div className="space-y-4 text-center">
            <label className="block text-lg font-bold text-gray-800">
              Overall Rating
            </label>
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="transition-transform active:scale-90 cursor-pointer"
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    size={42}
                    className={`transition-colors ${
                      (hover || rating) >= star
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-400 font-medium italic">
              {rating > 0 ? `You've selected ${rating} stars` : "Tap a star to rate your experience"}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">
              Share your thoughts
            </label>
            <textarea
              rows="5"
              placeholder="What did you learn? How was the mentorship? (Avoid offensive language)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border-2 border-gray-100 rounded-2xl px-5 py-4 text-gray-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none resize-none bg-gray-50"
            />
          </div>

          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <Clock className="text-amber-600 shrink-0" size={18} />
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              Note: To maintain a professional community, all comments undergo AI moderation. Reviews containing profanity or abuse will be rejected by administrators.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !rating}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Submitting...
              </span>
            ) : "Post My Review"}
          </button>
        </div>
      )}
    </div>
  );
};

export default InternCreateReview;