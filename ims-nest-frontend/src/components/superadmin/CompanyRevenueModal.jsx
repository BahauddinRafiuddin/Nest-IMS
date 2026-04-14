import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getCompanyRevenueDetails } from "../../api/superAdmin.api";

const CompanyRevenueModal = ({ company, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getCompanyRevenueDetails(company._id);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [company]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 relative animate-fadeIn">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-red-500 transition cursor-pointer"
        >
          <X size={22} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {company.name}
          </h2>
          <p className="text-sm text-gray-500">
            Revenue & Commission Overview
          </p>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-500">
            Loading financial data...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Total Revenue */}
            <div className="bg-blue-50 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">
                ₹{data.totalRevenue}
              </h3>
            </div>

            {/* Super Admin Commission */}
            <div className="bg-indigo-50 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Super Admin Commission
              </p>
              <h3 className="text-2xl font-bold text-indigo-600 mt-1">
                ₹{data.totalCommission}
              </h3>
            </div>

            {/* Company Earnings */}
            <div className="bg-green-50 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-gray-500">Company Earnings</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">
                ₹{data.totalCompanyEarning}
              </h3>
            </div>

            {/* Available Balance */}
            <div className="bg-emerald-50 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-gray-500">Available Balance</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                ₹{data.availableBalance}
              </h3>
            </div>

            {/* Total Transactions (Full Width) */}
            <div className="sm:col-span-2 bg-gray-50 rounded-2xl p-5 shadow-sm text-center">
              <p className="text-sm text-gray-500">
                Total Transactions
              </p>
              <h3 className="text-xl font-semibold text-gray-800 mt-1">
                {data.totalTransactions}
              </h3>
            </div>

          </div>
        )}

        {/* Footer Button */}
        <div className="mt-8 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition cursor-pointer font-medium"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default CompanyRevenueModal;