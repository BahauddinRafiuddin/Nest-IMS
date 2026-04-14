import React, { useEffect, useState } from "react";
import { getMyRequests } from "../../api/publicUser.api.js";

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await getMyRequests();
      setRequests(res.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-green-100 text-green-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading your requests...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-semibold mb-6">My Requests</h1>

      {requests.length === 0 ? (
        <p className="text-gray-500">No requests found</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-5"
            >
              {/* Company */}
              <h2 className="text-lg font-semibold text-gray-800">
                {req.company?.name}
              </h2>

              <p className="text-sm text-gray-500">
                {req.company?.email}
              </p>

              {/* Program */}
              {req.program && (
                <p className="mt-2 text-sm text-gray-700">
                  🎓 Program:{" "}
                  <span className="font-medium">
                    {req.program.title}
                  </span>
                </p>
              )}

              {/* Message */}
              {req.message && (
                <p className="mt-2 text-sm text-gray-600 italic">
                  "{req.message}"
                </p>
              )}

              {/* Status */}
              <div className="mt-4 flex items-center justify-between">
                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusStyle(
                    req.status
                  )}`}
                >
                  {req.status}
                </span>

                <span className="text-xs text-gray-400">
                  {new Date(req.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Extra Info */}
              {req.status === "accepted" && (
                <p className="mt-3 text-sm text-green-600 font-medium">
                  🎉 You are now an intern!
                </p>
              )}

              {req.status === "rejected" && (
                <p className="mt-3 text-sm text-red-500">
                  ❌ Request was rejected
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRequests;