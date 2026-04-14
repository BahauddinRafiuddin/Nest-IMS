/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { getAllCompaniesCommissionHistory } from "../../api/superAdmin.api";
import { toastError } from "../../utils/toast";
const CommissionHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await getAllCompaniesCommissionHistory();
      setHistory(res.data || []);
    } catch (error) {
      toastError("Failed to load commission history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);
  
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Commission History
        </h1>
        <p className="text-gray-500 text-sm">
          Track commission changes across all companies
        </p>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading commission history...
          </div>
        ) : history.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No commission history found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {/* TABLE HEADER */}
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold">Company</th>

                  <th className="text-left px-6 py-4 font-semibold">
                    Commission
                  </th>

                  <th className="text-left px-6 py-4 font-semibold">
                    Start Date
                  </th>

                  <th className="text-left px-6 py-4 font-semibold">
                    End Date
                  </th>

                  <th className="text-left px-6 py-4 font-semibold">
                    Duration
                  </th>

                  <th className="text-left px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>

              {/* TABLE BODY */}
              <tbody className="divide-y">
                {history.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition">
                    {/* Company */}
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {item.companyName}
                    </td>

                    {/* Commission */}
                    <td className="px-6 py-4">
                      <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold">
                        {item.commissionPercentage}%
                      </span>
                    </td>

                    {/* Start */}
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(item.startDate).toLocaleDateString()}
                    </td>

                    {/* End */}
                    <td className="px-6 py-4 text-gray-600">
                      {item.endDate
                        ? new Date(item.endDate).toLocaleDateString()
                        : "Present"}
                    </td>

                    {/* Duration */}
                    <td className="px-6 py-4 text-gray-700">
                      {item.durationDays} days
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {item.endDate ? (
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">
                          Past
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">
                          Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommissionHistory;
