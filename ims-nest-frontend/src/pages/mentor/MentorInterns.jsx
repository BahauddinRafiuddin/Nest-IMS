import { useEffect, useState } from "react";
import { getMentorInterns } from "../../api/mentor.api";
import {
  Users,
  Mail,
  Calendar,
  BookOpen,
  Clock,
  UserCircle2,
  ChevronRight,
  SearchX,
} from "lucide-react";
import Loading from "../../components/common/Loading";
import Pagination from "../../components/common/Pagination"; // Import your component

const MentorInterns = () => {
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);

  // PAGINATION STATE
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 1;

  useEffect(() => {
    const fetchMentorInterns = async () => {
      try {
        setLoading(true)
        const res = await getMentorInterns(page, limit);
        const interns = res.interns || [];
        const validInterns = interns.filter((e) => e.program !== null);
        setEnrollments(validInterns);
        setTotalPages(res.totalPages);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMentorInterns();
  }, [page,limit]);

  if (loading) return <Loading />;

  if (!enrollments.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-center mx-4">
        <div className="bg-slate-50 p-6 rounded-full mb-4">
          <SearchX size={48} className="text-slate-300" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">
          No Interns Assigned
        </h2>
        <p className="text-slate-500 max-w-xs mt-2 text-sm font-medium">
          Once students enroll in your programs, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12 px-4">
      {/* PAGE HEADER */}
      <div className="border-b border-slate-200 pb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          My Interns
        </h1>
        <p className="text-slate-500 mt-1 font-medium italic text-sm">
          Managing talent and enrollment across your active programs.
        </p>
      </div>

      {/* ENROLLMENT SECTIONS */}
      <div className="space-y-12">
        {enrollments.map((item) => (
          <div
            key={item._id}
            className="group animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            {/* PROGRAM STRIP */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-start gap-4">
                <div className="bg-indigo-600 text-white p-3 rounded-xl shadow-lg shadow-indigo-100 shrink-0">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {item.program.title}
                  </h2>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 mt-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} /> {item.program.durationInWeeks} Weeks
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />{" "}
                      {new Date(item.program.startDate).toLocaleDateString()} —{" "}
                      {new Date(item.program.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`self-start md:self-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm
                ${
                  item.program.status === "active"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}
              >
                {item.program.status}
              </div>
            </div>

            {/* INTERN CARD */}
            <div className="bg-white rounded-4xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="grid grid-cols-1 md:grid-cols-12 items-center p-6 gap-6">
                {/* Name & Identity */}
                <div className="md:col-span-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <UserCircle2 size={30} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">
                      {item.intern.name}
                    </h3>
                    <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-tighter">
                      Verified Intern
                    </p>
                  </div>
                </div>

                {/* Contact */}
                <div className="md:col-span-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                    <div className="p-1.5 bg-slate-50 rounded-lg">
                      <Mail size={14} />
                    </div>
                    {item.intern.email}
                  </div>
                </div>

                {/* Enrollment Date */}
                <div className="md:col-span-3">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">
                    Enrolled On
                  </p>
                  <div className="flex items-center gap-2 text-slate-600 text-sm font-bold">
                    <Calendar size={14} className="text-slate-400" />
                    {new Date(item.enrolledAt).toDateString()}
                  </div>
                </div>

                {/* Action Link */}
                <div className="md:col-span-1 flex justify-end">
                  <button className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION COMPONENT */}
      <Pagination
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />
    </div>
  );
};

export default MentorInterns;
