import { useEffect, useState } from "react";
import { IndianRupee, BookOpen, Calendar, Receipt } from "lucide-react";
import { getInternPaymentHistory } from "../../api/intern.api";
import StatCard from "../../components/ui/StatCard";
import TableExportButtons from "../../components/common/TableExportButtons";
import Loading from "../../components/common/Loading";

const InternPayments = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 5;

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await getInternPaymentHistory();
        setData(res);
      } catch (error) {
        console.error("Payment fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return (
      <Loading/>
    );
  }

  if (!data) {
    return (
      <div className="py-20 text-center text-red-500">
        Failed to load payment data
      </div>
    );
  }

  const { summary, payments } = data;
  const start = (page - 1) * limit;
  const paginatedPayments = payments.slice(start, start + limit);
  const totalPages = Math.ceil(payments.length / limit);
  const exportData = payments.map((p) => ({
    Program: p.programTitle,
    Company: p.companyName,
    Amount: `₹${p.amount}`,
    Method: p.paymentMethod,
    Status: p.status,
    Date: new Date(p.createdAt).toLocaleDateString(),
  }));

  const columns = ["Program", "Company", "Amount", "Method", "Status", "Date"];

  return (
    <div className="space-y-10">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
        <p className="text-gray-500 mt-1">
          View all your internship payment records
        </p>
      </div>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <StatCard
          title="Total Amount Paid"
          value={`₹${summary.totalPaid}`}
          icon={IndianRupee}
          color="bg-blue-600"
        />

        <StatCard
          title="Programs Purchased"
          value={summary.totalProgramsPurchased}
          icon={BookOpen}
          color="bg-green-600"
        />

        <StatCard
          title="Last Payment Date"
          value={
            summary.lastPaymentDate
              ? new Date(summary.lastPaymentDate).toLocaleDateString()
              : "N/A"
          }
          icon={Calendar}
          color="bg-indigo-600"
        />
      </div>

      {/* ================= TRANSACTION TABLE ================= */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Transaction Details
          </h2>

          <TableExportButtons
            data={exportData}
            columns={columns}
            fileName="payment-history"
          />
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No payments found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3">Program</th>
                  <th className="text-left px-4 py-3">Company</th>
                  <th className="text-left px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Method</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Date</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {paginatedPayments.map((payment) => (
                  <tr
                    key={payment.paymentId}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {payment.programTitle}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {payment.companyName}
                    </td>

                    <td className="px-4 py-3 font-semibold text-blue-600">
                      ₹{payment.amount}
                    </td>

                    <td className="px-4 py-3 text-gray-600 capitalize">
                      {payment.paymentMethod}
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600">
                        {payment.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex justify-end items-center gap-3 mt-6">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Prev
                </button>

                <span className="text-sm font-medium">
                  Page {page} of {totalPages}
                </span>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InternPayments;
