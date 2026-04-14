/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState, useMemo } from "react";
import { getCompanyReviews, exportReviewsApi } from "../../api/admin.api";
import { toastError } from "../../utils/toast";
import {
  Star,
  MessageSquare,
  Quote,
  Calendar,
  Award,
  Filter,
} from "lucide-react";

import Pagination from "../../components/common/Pagination";
import Loading from "../../components/common/Loading";

const CompanyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [minRating, setMinRating] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const limit = 5;

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await getCompanyReviews(page, limit, minRating);
      setReviews(res.reviews || []);
      setTotalPages(res.totalPages);
    } catch (error) {
      toastError("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, minRating]);

  // Calculate Average Rating for Header Stat
  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={14}
        className={
          i < rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
        }
      />
    ));
  };

  const handleExport = async (format) => {
    if (reviews.length === 0) {
      return toastError("No data to export!");
    }
    setLoading(true);
    try {
      await exportReviewsApi(minRating, format);
    } catch (error) {
      console.error("Export failed", error);
      toastError("Failed to export report");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Intern Feedback
          </h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <MessageSquare size={16} className="text-indigo-500" />
            Insights and testimonials from completed internship programs.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* RATING FILTER */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
            <Filter size={16} className="text-slate-400" />
            <select
              value={minRating}
              onChange={(e) => {
                setMinRating(e.target.value);
                setPage(1);
              }}
              className="text-sm font-bold text-slate-700 outline-none bg-transparent cursor-pointer"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars Only</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleExport("excel")}
              disabled={loading}
              className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-100 hover:bg-emerald-100 cursor-pointer transition-colors"
            >
              Export Excel
            </button>
            <button
              onClick={() => handleExport("pdf")}
              disabled={loading}
              className="bg-rose-50 text-rose-700 px-4 py-2 rounded-xl text-sm font-bold border border-rose-100 hover:bg-rose-100 cursor-pointer transition-colors"
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* REVIEWS GRID */}
      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
          <Quote size={48} className="text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium text-lg">
            No reviews have been submitted yet.
          </p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="group relative bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Decorative Quote Icon */}
                <Quote
                  className="absolute top-6 right-6 text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  size={40}
                />

                <div className="space-y-5">
                  {/* TOP: USER INFO */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
                      {review.intern?.name?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 truncate">
                        {review.intern?.name}
                      </h3>
                      <div className="flex items-center gap-1 text-indigo-600">
                        <Award size={12} />
                        <span className="text-[11px] font-bold uppercase tracking-tight truncate">
                          {review.program?.title}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* RATING SLIDER */}
                  <div className="flex items-center gap-2 bg-slate-50 w-fit px-3 py-1 rounded-full border border-slate-100">
                    <div className="flex gap-0.5">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-xs font-bold text-slate-600">
                      {review.rating}.0
                    </span>
                  </div>

                  {/* COMMENT BOX */}
                  <div className="relative">
                    <p className="text-slate-600 text-sm leading-relaxed italic relative z-10">
                      "{review.comment || ""}"
                    </p>
                  </div>

                  {/* FOOTER */}
                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      <span className="text-[11px] font-medium">
                        {new Date(review.createdAt).toLocaleDateString(
                          "en-GB",
                          { day: "2-digit", month: "short", year: "numeric" },
                        )}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase">
                      Verified Feedback
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION WRAPPER */}
          <div className="pt-8 flex justify-center">
            <Pagination page={page} totalPages={totalPages} setPage={setPage} />
          </div>
        </>
      )}
    </div>
  );
};

export default CompanyReviews;
