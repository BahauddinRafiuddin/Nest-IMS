import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { ExportColumn } from '../interfaces/export-column.interface';

@Injectable()
export class PdfService {
  generate(
    res: Response,
    data: any[],
    columns: ExportColumn[],
    fileName: string,
  ) {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    const pageWidth = 595.28;
    const margin = 50;
    const usableWidth = pageWidth - margin * 2;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${fileName}.pdf`,
    );

    doc.pipe(res);

    // 🔹 TITLE
    doc
      .font('Helvetica-Bold')
      .fontSize(20)
      .text(fileName.toUpperCase(), { align: 'center' });

    doc.moveDown(1.5);

    const colCount = columns.length;
    const colWidth = usableWidth / colCount;
    const rowHeight = 25;

    let currentY = doc.y;

    // 🔹 DRAW ROW FUNCTION
    const drawRow = (rowData: any, isHeader = false) => {
      const startX = margin;

      doc
        .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(isHeader ? 10 : 9);

      // Header background
      if (isHeader) {
        doc
          .rect(startX, currentY - 5, usableWidth, rowHeight)
          .fill('#f2f2f2');
        doc.fillColor('#000000');
      }

      columns.forEach((col, i) => {
        const x = startX + i * colWidth;

        const text = isHeader
          ? col.header
          : String(rowData[col.key] ?? '');

        doc.text(text, x + 5, currentY, {
          width: colWidth - 10,
          ellipsis: true,
        });
      });

      // Row separator line
      doc
        .moveTo(startX, currentY + 18)
        .lineTo(startX + usableWidth, currentY + 18)
        .strokeColor('#e5e5e5')
        .stroke();

      currentY += rowHeight;

      // 🔥 Pagination FIX
      if (currentY > 750) {
        doc.addPage();
        currentY = 50;

        // Re-draw header on new page
        drawRow({}, true);
        currentY += 5;
      }
    };

    // 🔹 HEADER
    drawRow({}, true);
    currentY += 5;

    // 🔹 DATA
    data.forEach((row) => {
      drawRow(row);
    });

    doc.end();
  }
}