/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { Mail, Calendar, Briefcase, User, Check, X, Loader2 } from 'lucide-react';
import { getJoinRequests, reviewJoinRequest } from '../../api/admin.api'; // Import the review function
import Pagination from '../../components/common/Pagination';
import { toast } from 'react-hot-toast'; // Optional: for notifications

const JoinRequestsPage = () => {
  const [data, setData] = useState({ requests: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [processingId, setProcessingId] = useState(null); // Tracks which ID is being updated

  const fetchRequests = async (page) => {
    setLoading(true);
    try {
      const response = await getJoinRequests(page);
      setData(response);
    } catch (error) {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    setProcessingId(id);
    try {
      const response = await reviewJoinRequest(id, action);
      if (response.success) {
        toast.success(`Request ${action}ed successfully`);
        // Refresh the list to remove the processed request
        fetchRequests(currentPage);
      }
    } catch (error) {
      toast.error("Action failed. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchRequests(currentPage);
  }, [currentPage]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Join Requests</h1>
            <p className="text-gray-500 text-sm">Review applications for your company programs</p>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-semibold text-sm">
            Pending: {data.pagination.total || 0}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
              <p className="text-gray-400 animate-pulse">Fetching latest requests...</p>
            </div>
          ) : data.requests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Applicant</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Program</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Applied Date</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.requests.map((req) => (
                    <tr key={req._id} className="hover:bg-blue-50/30 transition-all duration-200 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-linear-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold shadow-sm">
                            {req.user?.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">
                              {req.user?.name}
                            </div>
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                              <Mail size={12} /> {req.user?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          <Briefcase size={14} />
                          {req.program?.title || 'Not Selected Any Program'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                        {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          {/* ACCEPT BUTTON */}
                          <button 
                            disabled={processingId === req._id}
                            onClick={() => handleAction(req._id, 'accepted')}
                            className="p-2.5 text-green-600 bg-green-50 hover:bg-green-600 hover:text-white rounded-xl transition-all border border-green-100 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingId === req._id ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                          </button>
                          
                          {/* REJECT BUTTON */}
                          <button 
                            disabled={processingId === req._id}
                            onClick={() => handleAction(req._id, 'rejected')}
                            className="p-2.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-all border border-red-100 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-24 text-center">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="text-gray-400" size={32} />
              </div>
              <p className="text-gray-800 font-bold">Inbox is empty</p>
              <p className="text-gray-400 text-sm mt-1">No pending join requests at the moment.</p>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {data.pagination.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination 
              currentPage={data.pagination.currentPage} 
              totalPages={data.pagination.pages} 
              onPageChange={(page) => setCurrentPage(page)} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinRequestsPage;