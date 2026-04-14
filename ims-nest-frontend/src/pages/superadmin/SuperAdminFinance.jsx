/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { 
  Download, 
  Filter, 
  TrendingUp, 
  Wallet, 
  Building2, 
  Receipt, 
  Calendar, 
  ArrowUpRight,
  SearchX
} from "lucide-react";
import { getAllTransactionReport } from "../../api/superAdmin.api";
import { toastError } from "../../utils/toast";
import * as XLSX from "xlsx";
import Loading from "../../components/common/Loading";

const SuperAdminFinance = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({});
  const [breakdown, setBreakdown] = useState([]);
  const [filters, setFilters] = useState({
    commission: "",
    startDate: "",
    endDate: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getAllTransactionReport(filters);
      setTransactions(res.transactions || []);
      setSummary(res.summary || {});
      setBreakdown(res.commissionBreakdown || []);
    } catch (err) {
      toastError("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const exportExcel = () => {
    if (!transactions.length) return toastError("No data to export");
    const excelData = transactions.map((t) => ({
      Company: t.company?.name,
      Intern: t.intern?.name,
      Program: t.program?.title,
      Amount: t.totalAmount,
      "Super Admin Commission": t.superAdminCommission,
      Date: new Date(t.createdAt).toLocaleDateString(),
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(workbook, "platform_transactions.xlsx");
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10 px-4">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Platform Transactions</h1>
          <p className="text-slate-500 mt-1 font-medium">Analyze and manage system-wide revenue flow.</p>
        </div>

        <button
          onClick={exportExcel}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Download size={18} />
          Export Report
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <SummaryCard 
          title="Total Revenue" 
          value={`₹${summary.totalRevenue?.toLocaleString() || 0}`} 
          icon={TrendingUp} 
          color="indigo" 
        />
        <SummaryCard 
          title="Super Profit" 
          value={`₹${summary.totalCommission?.toLocaleString() || 0}`} 
          icon={Wallet} 
          color="emerald" 
        />
        <SummaryCard 
          title="Company Payouts" 
          value={`₹${summary.totalCompanyEarning?.toLocaleString() || 0}`} 
          icon={Building2} 
          color="amber" 
        />
        <SummaryCard 
          title="Total Sales" 
          value={summary.totalTransactions || 0} 
          icon={Receipt} 
          color="slate" 
        />
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-50 space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Commission %</label>
            <input
              type="number"
              placeholder="e.g. 10"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={filters.commission}
              onChange={(e) => setFilters({ ...filters, commission: e.target.value })}
            />
        </div>
        <div className="flex-1 min-w-50 space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Start Date</label>
            <input
              type="date"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
        </div>
        <div className="flex-1 min-w-50 space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">End Date</label>
            <input
              type="date"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
        </div>
        <button
          onClick={fetchData}
          className="bg-slate-900 hover:bg-black text-white rounded-xl px-8 py-2.5 font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
        >
          <Filter size={18} /> Apply
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COMMISSION BREAKDOWN */}
        <div className="bg-white rounded-4xl border border-slate-200 p-6 shadow-sm overflow-hidden h-fit">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-slate-800">Tier Analysis</h2>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">By Percent</span>
          </div>

          <div className="space-y-4">
            {breakdown.map((b) => (
              <div key={b._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:border-indigo-200 transition-colors">
                <div>
                    <div className="text-lg font-black text-slate-800">{b._id}% <span className="text-xs font-medium text-slate-400 italic">Tier</span></div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{b.totalTransactions} Transactions</div>
                </div>
                <div className="text-right">
                    <div className="text-emerald-600 font-bold">₹{b.totalCommission.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400 font-medium tracking-tight">Rev: ₹{b.totalRevenue.toLocaleString()}</div>
                </div>
              </div>
            ))}
            {breakdown.length === 0 && <div className="py-10 text-center text-slate-400 italic text-sm">No data available</div>}
          </div>
        </div>

        {/* TRANSACTION TABLE */}
        <div className="lg:col-span-2 bg-white rounded-4xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction / Entity</th>
                            <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pricing</th>
                            <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Commission</th>
                            <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {transactions.map((t) => (
                            <tr key={t._id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 shadow-inner">
                                            {t.company?.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{t.company?.name}</div>
                                            <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium italic"><ArrowUpRight size={12}/>{t.program?.title}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="text-sm font-bold text-slate-700">₹{t.totalAmount.toLocaleString()}</div>
                                    <div className="text-[10px] font-black text-indigo-500 bg-indigo-50 inline-block px-1.5 py-0.5 rounded-md mt-1 italic">{t.commissionPercentage}%</div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="text-sm font-bold text-emerald-600">₹{t.superAdminCommission.toLocaleString()}</div>
                                    <div className="text-[10px] text-slate-400 font-medium">Profit</div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="text-xs font-bold text-slate-500 flex items-center justify-end gap-1"><Calendar size={12}/> {new Date(t.createdAt).toLocaleDateString()}</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {transactions.length === 0 && (
                    <div className="py-24 flex flex-col items-center justify-center text-slate-400">
                        <SearchX size={48} className="opacity-20 mb-4"/>
                        <p className="font-bold tracking-tight">No transactions found</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, icon: Icon, color }) => {
  const themes = {
    indigo: "bg-indigo-500 text-white shadow-indigo-100",
    emerald: "bg-emerald-500 text-white shadow-emerald-100",
    amber: "bg-amber-500 text-white shadow-amber-100",
    slate: "bg-slate-900 text-white shadow-slate-100",
  };
  return (
    <div className={`relative overflow-hidden p-6 rounded-3xl shadow-xl ${themes[color]}`}>
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</p>
          <h2 className="text-2xl font-black">{value}</h2>
        </div>
        <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md">
          <Icon size={24} />
        </div>
      </div>
      <div className="absolute -bottom-2 -right-2 opacity-10">
          <Icon size={80}/>
      </div>
    </div>
  );
};

export default SuperAdminFinance;