import { FileDown, FileSpreadsheet, FileText } from "lucide-react";
import { exportToExcel } from "../../utils/exportExcel";
import { exportToPDF } from "../../utils/exportPDF";
import { toastError } from "../../utils/toast";

const TableExportButtons = ({ data, columns, fileName }) => {
  const handleExcel = () => {
    if (!data || data.length === 0) {
      toastError("No data to download");
      return;
    }
    exportToExcel(data, fileName);
  };

  const handlePDF = () => {
    if (!data || data.length === 0) {
      toastError("No data to download");
      return;
    }
    const rows = data.map((obj) => Object.values(obj));
    exportToPDF(columns, rows, fileName);
  };

  // Shared button styles for consistency
  const btnBase = "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-sm active:scale-95 border cursor-pointer";

  return (
    <div className="flex items-center gap-3">
      {/* Excel Button */}
      <button
        onClick={handleExcel}
        className={`${btnBase} bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-md`}
      >
        <FileSpreadsheet size={16} className="text-emerald-600" />
        <span>Export Excel</span>
      </button>

      {/* PDF Button */}
      <button
        onClick={handlePDF}
        className={`${btnBase} bg-white text-rose-700 border-rose-200 hover:bg-rose-50 hover:border-rose-300 hover:shadow-md`}
      >
        <FileText size={16} className="text-rose-600" />
        <span>Export PDF</span>
      </button>
      
      {/* Alternatively, if you want a generic 'Download' button style: */}
      {/* <button
        onClick={handlePDF}
        className={`${btnBase} bg-slate-800 text-white border-slate-900 hover:bg-slate-700 hover:shadow-lg`}
      >
        <FileDown size={16} />
        <span>Download Report</span>
      </button> 
      */}
    </div>
  );
};

export default TableExportButtons;