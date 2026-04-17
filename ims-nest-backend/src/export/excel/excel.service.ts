import { Injectable } from "@nestjs/common";

import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { ExportColumn } from "../interfaces/export-column.interface";

@Injectable()
export class ExcelService {
  async generate(
    res: Response,
    data: any[],
    columns: ExportColumn[],
    fileName: string,
  ) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(fileName);

    worksheet.columns = columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width || 20,
    }));

    // Add rows in chunks (important for large data)
    data.forEach((row) => worksheet.addRow(row));

    worksheet.getRow(1).font = { bold: true };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${fileName}.xlsx`,
    );

    await workbook.xlsx.write(res); // STREAM
    res.end();
  }
}