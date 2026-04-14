/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import {
  IndianRupee,
  TrendingUp,
  Wallet,
  Repeat,
  Download,
  Filter,
  Calendar,
  Percent,
  History,
  PieChart,
} from "lucide-react";
import { exportFinanceApi, getAdminFinanceOverview } from "../../api/admin.api";
import StatCard from "../../components/ui/StatCard";
import * as XLSX from "xlsx";
import { toastError } from "../../utils/toast";
import Loading from "../../components/common/Loading";
import Pagination from "../../components/common/Pagination";

const AdminFinance = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    commission: "",
    startDate: "",
    endDate: "",
  });

  const fetchFinance = async (currentPage = page) => {
    try {
      setLoading(true);
      const res = await getAdminFinanceOverview({
        ...filters,
        page: currentPage,
      });
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, [page]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    setPage(1); // Reset to page 1 when searching
    fetchFinance(1);
  };

  const resetFilters = () => {
    setFilters({ commission: "", startDate: "", endDate: "" });
    setPage(1);
  };

  const handleExport = async (format) => {
    if (data.length === 0) {
      return toastError("No data to export");
    }
    setLoading(true);
    try {
      await exportFinanceApi(filters, format);
    } catch (err) {
      console.error("Export failed", err);
      toastError("Failed to export report");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  const { summary, transactions, commissionBreakdown, pagination } = data;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* 1. HEADER & EXPORT */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Finance Overview
          </h1>
          <p className="text-slate-500 mt-1">
            Real-time revenue tracking and commission distribution.
          </p>
        </div>
        <button
          onClick={() => handleExport("excel")}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Download size={18} className="text-indigo-600" />
          Export Report
        </button>
      </div>

      {/* 2. KEY STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gross Revenue"
          value={`₹${summary.totalRevenue.toLocaleString()}`}
          icon={IndianRupee}
          color="bg-indigo-600"
        />
        <StatCard
          title="Platform Fees"
          value={`₹${summary.totalCommission.toLocaleString()}`}
          icon={TrendingUp}
          color="bg-violet-600"
        />
        <StatCard
          title="Company Net"
          value={`₹${summary.totalCompanyEarning.toLocaleString()}`}
          icon={Wallet}
          color="bg-emerald-600"
        />
        <StatCard
          title="Volume"
          value={summary.totalTransactions}
          icon={Repeat}
          color="bg-slate-800"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* 3. FILTERS (LEFT/TOP) */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6 text-slate-800 font-bold">
              <Filter size={18} className="text-indigo-600" />
              <h3>Refine Results</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Commission %
                </label>
                <div className="relative">
                  <Percent
                    size={14}
                    className="absolute left-3 top-3 text-slate-400"
                  />
                  <input
                    type="number"
                    name="commission"
                    value={filters.commission}
                    onChange={handleFilterChange}
                    placeholder="Filter by rate..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar
                    size={14}
                    className="absolute left-3 top-3 text-slate-400"
                  />
                  <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  End Date
                </label>
                <div className="relative">
                  <Calendar
                    size={14}
                    className="absolute left-3 top-3 text-slate-400"
                  />
                  <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-8">
              <button
                onClick={applyFilters}
                className="bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition shadow-md shadow-indigo-100 cursor-pointer"
              >
                Apply
              </button>
              <button
                onClick={resetFilters}
                className="bg-slate-100 text-slate-600 py-2 rounded-lg font-bold hover:bg-slate-200 transition cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* 4. COMMISSION BREAKDOWN (RIGHT) */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <PieChart size={18} className="text-indigo-600" />
                <h3>Commission Breakdown</h3>
              </div>
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition uppercase tracking-tighter cursor-pointer"
              >
                {showBreakdown ? "[ Collapse ]" : "[ Expand View ]"}
              </button>
            </div>

            {showBreakdown ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/50 text-slate-500 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold">Rate</th>
                      <th className="px-6 py-4 text-left font-bold">Revenue</th>
                      <th className="px-6 py-4 text-left font-bold">
                        Platform Fees
                      </th>
                      <th className="px-6 py-4 text-left font-bold">
                        Net Earning
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {commissionBreakdown.map((b) => (
                      <tr
                        key={b._id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold">
                            {b._id}%
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">
                          ₹{b.totalRevenue.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-indigo-600 font-semibold">
                          ₹{b.totalCommission.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-emerald-600 font-bold">
                          ₹{b.totalEarning.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm italic">
                Click expand to view revenue distribution by percentage.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. RECENT TRANSACTIONS */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
          <History size={18} className="text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-800">
            Recent Transactions
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left px-6 py-4 font-bold uppercase tracking-wider text-[10px]">
                  Intern / Program
                </th>
                <th className="text-left px-6 py-4 font-bold uppercase tracking-wider text-[10px]">
                  Amount
                </th>
                <th className="text-left px-6 py-4 font-bold uppercase tracking-wider text-[10px]">
                  Distribution
                </th>
                <th className="text-left px-6 py-4 font-bold uppercase tracking-wider text-[10px]">
                  Net Earning
                </th>
                <th className="text-left px-6 py-4 font-bold uppercase tracking-wider text-[10px]">
                  Method
                </th>
                <th className="text-left px-6 py-4 font-bold uppercase tracking-wider text-[10px]">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((txn) => (
                <tr
                  key={txn._id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">
                      {txn.intern?.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {txn.program?.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    ₹{txn.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-indigo-600 font-semibold text-xs">
                      Fees: ₹{txn.superAdminCommission}
                    </div>
                    <div className="text-slate-400 text-[10px]">
                      Rate: {txn.commissionPercentage}%
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                      ₹{txn.companyEarning.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">
                      {txn.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">
                    {new Date(txn.createdAt).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && (
            <div className="py-20 text-center text-slate-400">
              <History size={40} className="mx-auto mb-3 opacity-20" />
              <p>No financial records match your filters.</p>
            </div>
          )}
        </div>
        {/* PAGINATION COMPONENT */}
        <div className="pb-6 px-4">
          <Pagination
            page={page}
            totalPages={pagination?.totalPages || 1}
            setPage={setPage}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminFinance;
