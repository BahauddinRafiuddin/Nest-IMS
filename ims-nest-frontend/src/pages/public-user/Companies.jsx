import { useEffect, useState, useCallback } from "react";
import {
  getAllCompaniesWithPrograms,
  sendJoinRequest,
} from "../../api/publicUser.api.js";
import { toastError, toastSuccess } from "../../utils/toast";
import Pagination from "../../components/common/Pagination.jsx"; // Adjust path as needed
import {
  Building2,
  Mail,
  Briefcase,
  Search,
  ArrowRight,
  Loader2,
} from "lucide-react";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(null);

  // Pagination & Search States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      // Passing search and page to API helper
      const res = await getAllCompaniesWithPrograms({ page, limit: 9, search });
      setCompanies(res.companies || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
      toastError("Failed to load companies");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleJoinCompany = async (company) => {
    try {
      setSending(company.id);
      await sendJoinRequest({
        companyId: company.id,
        message: `Hi, I want to join ${company.name}. Please consider my request.`,
      });
      toastSuccess("Request sent successfully 🚀");
    } catch (err) {
      toastError(err?.message || "Error");
    } finally {
      setSending(null);
    }
  };

  const handleJoinProgram = async (company, program) => {
    console.log(company, program);
    try {
      setSending(program.id);
      await sendJoinRequest({
        companyId: company.id,
        programId: program.id,
        message: `Hi, I want to enroll in "${program.title}" at ${company.name}.`,
      });
      toastSuccess("Program request sent 🚀");
    } catch (err) {
      toastError(err?.message || "Error");
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen bg-slate-50/50">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Partner Companies
          </h1>
          <p className="text-slate-500 mt-1">
            Discover opportunities and join leading industry programs.
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="relative group">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Search companies..."
            className="pl-10 pr-4 py-2.5 w-full md:w-72 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset to page 1 on new search
            }}
          />
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
          <Loader2 className="animate-spin mb-2 text-indigo-600" size={32} />
          <p className="font-medium">Fetching opportunities...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
          <Building2 className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-slate-900">
            No companies found
          </h3>
          <p className="text-slate-500">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {companies.map((company) => (
              <div
                key={company.id}
                className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col"
              >
                {/* CARD HEADER */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <Building2 size={24} />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
                      Verified Partner
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {company.name}
                  </h2>

                  <div className="flex items-center gap-2 text-slate-500 mt-1 mb-4 text-sm">
                    <Mail size={14} />
                    <span>{company.email}</span>
                  </div>

                  {company.description && (
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {company.description}
                    </p>
                  )}

                  {/* PROGRAMS LIST */}
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <Briefcase size={12} />
                      Available Programs
                    </div>

                    {company.programs?.length > 0 ? (
                      <div className="grid gap-2">
                        {company.programs.map((program) => (
                          <div
                            key={program.id}
                            className="group/item flex items-center justify-between bg-slate-50 hover:bg-indigo-50/50 p-3 rounded-xl border border-transparent hover:border-indigo-100 transition-all"
                          >
                            <div className="overflow-hidden">
                              <p className="text-sm font-semibold text-slate-800 truncate">
                                {program.title}
                              </p>
                              <p className="text-xs text-slate-500 capitalize italic">
                                {program.type}
                                {/* Only show price if the program is paid and price exists */}
                                {program.type?.toLowerCase() === "paid" &&
                                  program.price && (
                                    <span className="ml-1 font-semibold text-indigo-600">
                                      - ₹{program.price}
                                    </span>
                                  )}
                              </p>
                            </div>

                            <button
                              disabled={sending === program.id}
                              onClick={() =>
                                handleJoinProgram(company, program)
                              }
                              className="ml-2 p-2 bg-white text-indigo-600 rounded-lg shadow-sm border border-slate-100 hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
                            >
                              {sending === program.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <ArrowRight size={16} />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-4 text-center border border-dashed border-slate-200 rounded-xl">
                        <p className="text-xs text-slate-400 italic">
                          No active programs
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* CARD FOOTER */}
                <div className="mt-auto p-6 pt-0">
                  <button
                    disabled={sending === company.id}
                    onClick={() => handleJoinCompany(company)}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-all font-bold text-sm shadow-lg shadow-slate-200 flex items-center justify-center gap-2 active:scale-95 disabled:bg-slate-400 cursor-pointer"
                  >
                    {sending === company.id ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Express Interest in Company"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </>
      )}
    </div>
  );
};

export default Companies;
