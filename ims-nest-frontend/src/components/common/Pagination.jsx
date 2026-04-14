import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ page, totalPages, setPage }) => {
  // Don't render if there's only one page or no data
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 px-2">
      {/* PAGE INFO */}
      <div className="text-sm text-slate-500 font-medium">
        Showing page <span className="text-slate-900 font-bold">{page}</span> of{" "}
        <span className="text-slate-900 font-bold">{totalPages}</span>
      </div>

      {/* CONTROLS */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-2xl shadow-sm">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className={`group flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold transition-all
            ${
              page === 1
                ? "text-slate-300 cursor-not-allowed"
                : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer active:scale-95"
            }`}
        >
          <ChevronLeft 
            size={18} 
            className={`${page === 1 ? "" : "group-hover:-translate-x-0.5 transition-transform"}`} 
          />
          <span>Previous</span>
        </button>

        {/* DIVIDER */}
        <div className="w-px h-6 bg-slate-100 mx-1 hidden sm:block"></div>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className={`group flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold transition-all
            ${
              page === totalPages
                ? "text-slate-300 cursor-not-allowed"
                : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer active:scale-95"
            }`}
        >
          <span>Next</span>
          <ChevronRight 
            size={18} 
            className={`${page === totalPages ? "" : "group-hover:translate-x-0.5 transition-transform"}`} 
          />
        </button>
      </div>
    </div>
  );
};

export default Pagination;