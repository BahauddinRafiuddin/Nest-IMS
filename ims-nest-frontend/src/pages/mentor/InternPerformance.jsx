import { useEffect, useState } from "react";
import { getInternPerformance } from "../../api/mentor.api";
import {
  User,
  Star,
  Trophy,
  Target,
  AlertCircle,
  Search,
  Mail,
  BookOpen
} from "lucide-react";
import Loading from "../../components/common/Loading";
import Pagination from "../../components/common/Pagination"; // Import your component

const InternPerformance = () => {
  const [loading, setLoading] = useState(true);
  const [interns, setInterns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage =5;

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await getInternPerformance();
        setInterns(res.interns || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, []);

  // Reset to page 1 when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredInterns = interns.filter(i => 
    i.intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.program?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // PAGINATION LOGIC
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInterns = filteredInterns.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInterns.length / itemsPerPage);

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4">
      
      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Intern Performance</h1>
          <p className="text-slate-500 mt-1 font-medium italic text-sm">
            Evaluating progress based on task completion and accuracy.
          </p>
        </div>

        <div className="relative group min-w-75">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Search by name or program..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {!filteredInterns.length ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
          <div className="bg-slate-50 p-6 rounded-full mb-4">
            <User size={48} className="text-slate-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">No Results Found</h2>
          <p className="text-slate-400 text-sm font-medium">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Intern Profile</th>
                    <th className="px-6 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Program</th>
                    <th className="px-6 py-5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Task Ratio</th>
                    <th className="px-6 py-5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Average Score</th>
                    <th className="px-6 py-5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completion</th>
                    <th className="px-6 py-5 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentInterns.map((item) => (
                    <tr key={item.intern._id} className="hover:bg-slate-50/80 transition-colors group cursor-default">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {item.intern.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{item.intern.name}</div>
                            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5 lowercase">
                               <Mail size={12}/> {item.intern.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                          <BookOpen size={16} className="text-slate-300" />
                          {item.program?.title || "N/A"}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                         <div className="flex items-center justify-center gap-4">
                            <div className="text-center">
                              <p className="text-[10px] font-black text-emerald-600 uppercase">Appr</p>
                              <p className="text-sm font-bold text-slate-700">{item.approved}</p>
                            </div>
                            <div className="w-px h-6 bg-slate-100"></div>
                            <div className="text-center">
                              <p className="text-[10px] font-black text-rose-500 uppercase">Rej</p>
                              <p className="text-sm font-bold text-slate-700">{item.rejected}</p>
                            </div>
                         </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex flex-col items-center">
                          <div className={`px-3 py-1 rounded-lg text-xs font-black shadow-sm flex items-center gap-1 ${getScoreColor(item.averageScore)}`}>
                            <Target size={12}/> {item.averageScore}/10
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 min-w-35">
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="text-[11px] font-black text-slate-700">{item.completion}%</span>
                          <div className="w-full max-w-25 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-700 ease-out ${item.completion === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`} 
                              style={{ width: `${item.completion}%` }} 
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <GradeBadge grade={item.grade} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAGINATION COMPONENT */}
          <Pagination 
            page={currentPage} 
            totalPages={totalPages} 
            setPage={setCurrentPage} 
          />
        </>
      )}
    </div>
  );
};

// --- HELPER COMPONENTS (Keep unchanged) ---
const getScoreColor = (score) => {
  if (score >= 8) return "bg-emerald-50 text-emerald-700 border border-emerald-100";
  if (score >= 6) return "bg-amber-50 text-amber-700 border border-amber-100";
  return "bg-rose-50 text-rose-700 border border-rose-100";
};

const GradeBadge = ({ grade }) => {
  if (grade === "Excellent") return (
    <div className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100">
      <Trophy size={14} /> {grade}
    </div>
  );
  if (grade === "Good") return (
    <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
      <Star size={14} className="fill-indigo-700" /> {grade}
    </div>
  );
  return (
    <div className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-400 border border-slate-100 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
      <AlertCircle size={14} /> {grade}
    </div>
  );
};

export default InternPerformance;