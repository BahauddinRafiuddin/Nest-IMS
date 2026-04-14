/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { getMyPerformance, getMyProgram } from "../../api/intern.api";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  ClipboardList,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  BarChart3,
} from "lucide-react";
import Loading from "../../components/common/Loading";

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-4">
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${color}`}
    >
      <Icon size={22} />
    </div>

    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-xl font-bold">{value}</h2>
    </div>
  </div>
);

const Performance = () => {
  const [loading, setLoading] = useState(true);
  const [performance, setPerformance] = useState(null);
  const [pStatus, setPStatus] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const programRes = await getMyProgram();
        const programId = programRes.enrollement[0].program._id;
        // console.log(programRes)
        setPStatus(programRes.enrollement[0].status);
        const perfRes = await getMyPerformance(programId);
        setPerformance(perfRes.performance);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading)
    return (
     <Loading/>
    );

  if (!performance)
    return (
      <div className="bg-white p-10 rounded-xl text-center shadow">
        Performance not available
      </div>
    );
  const completion = Number(performance.completionPercentage);
  const data = [
    {
      name: "Approved",
      value: performance.approvedTasks,
    },
    {
      name: "Rejected",
      value: performance.rejectedTasks,
    },
    {
      name: "Pending",
      value: performance.pendingTasks,
    },
  ];

  const COLORS = ["#22c55e", "#ef4444", "#f59e0b"];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white shadow-lg rounded-lg px-4 py-2 border">
          <p className="font-semibold text-gray-700">{payload[0].name}</p>
          <p className="text-sm text-gray-500">Tasks: {payload[0].value}</p>
        </div>
      );
    }

    return null;
  };
  return (
    <div className="space-y-8">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">My Performance</h1>
        <p className="text-gray-500 mt-1">
          Track your internship progress and evaluation
        </p>
      </div>

      {/* ================= STAT CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tasks"
          value={performance.totalTasks}
          icon={ClipboardList}
          color="bg-blue-600"
        />

        <StatCard
          title="Approved"
          value={performance.approvedTasks}
          icon={CheckCircle}
          color="bg-green-600"
        />

        <StatCard
          title="Pending"
          value={performance.pendingTasks}
          icon={Clock}
          color="bg-yellow-500"
        />

        <StatCard
          title="Rejected"
          value={performance.rejectedTasks}
          icon={XCircle}
          color="bg-red-600"
        />
      </div>

      {/* ================= PERFORMANCE SUMMARY ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COMPLETION */}
        {/* <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <div className="flex items-center gap-2 font-semibold">
            <BarChart3 size={20} />
            Completion
          </div>

          <div className="text-3xl font-bold text-indigo-600">
            {completion}%
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all"
              style={{ width: `${completion}%` }}
            />
          </div>

          <p className="text-sm text-gray-500">Based on approved tasks</p>
        </div> */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <div className="flex items-center gap-2 font-semibold">
            <BarChart3 size={20} />
            Completion
          </div>
          <div className="relative h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                  <Tooltip content={<CustomTooltip />} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Percentage */}
            <div className="absolute text-3xl font-bold text-indigo-600">
              {completion}%
            </div>
          </div>
        </div>
        {/* GRADE */}
        {pStatus === "completed" && (
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col justify-center items-center space-y-3">
            <Star className="text-yellow-400" size={40} />

            <p className="text-gray-500 text-sm">Final Grade</p>

            <h1
              className={`text-5xl font-extrabold ${
                performance.grade === "Fail" ? "text-red-600" : "text-green-600"
              }`}
            >
              {performance.grade}
            </h1>

            <p className="text-sm text-gray-400">Auto calculated</p>
          </div>
        )}
        {/* SCORE */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <p className="font-semibold">Average Score</p>

          <div className="text-4xl font-bold text-green-600">
            {performance.averageScore}/10
          </div>

          <p className="text-sm text-gray-500">From reviewed tasks</p>

          <div className="text-sm text-gray-600">
            Late Submissions: <b>{performance.lateSubmissions}</b>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Performance;
