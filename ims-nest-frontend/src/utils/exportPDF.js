import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// function to break long words
const breakLongText = (text, maxLength = 20) => {
  if (!text) return "";

  return text.replace(
    new RegExp(`(.{${maxLength}})`, "g"),
    "$1 "
  );
};

export const exportToPDF = (columns, rows, fileName) => {
  const doc = new jsPDF();

  // apply text breaking to every cell
  const formattedRows = rows.map(row =>
    row.map(cell =>
      typeof cell === "string" ? breakLongText(cell) : cell
    )
  );

  autoTable(doc, {
    head: [columns],
    body: formattedRows,

    styles: {
      fontSize: 9,
      overflow: "linebreak",
      cellPadding: 3
    },

    tableWidth: "auto",

    margin: { top: 20 },

    didDrawPage: (data) => {
      doc.setFontSize(14);
      doc.text(fileName, data.settings.margin.left, 12);
    }
  });

  doc.save(`${fileName}.pdf`);
};