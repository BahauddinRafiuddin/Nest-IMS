const colors = {
  upcoming: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
};

const ProgramStatusBadge = ({ status }) => (
  <span
    className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status]}`}
  >
    {status.toUpperCase()}
  </span>
);

export default ProgramStatusBadge;
