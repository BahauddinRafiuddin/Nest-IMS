import { Users } from "lucide-react";

const StatCard = ({ title, value, icon: Icon, color }) => {
  return (
    <div
      className={`bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition `}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h2 className="text-3xl font-bold mt-2 text-gray-800">
            {value}
          </h2>
        </div>

        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
        >
          {Icon && <Icon className="text-white" size={22} />}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
