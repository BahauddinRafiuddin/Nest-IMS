import { Injectable, BadRequestException } from '@nestjs/common';
import { ExcelService } from './excel/excel.service';
import { PdfService } from './pdf/pdf.service';
import { ExportOptions } from './interfaces/export-options.interface';

@Injectable()
export class ExportService {
  constructor(
    private readonly excelService: ExcelService,
    private readonly pdfService: PdfService,
  ) {}

  async export({
    res,
    data,
    columns,
    fileName,
    format,
  }: ExportOptions) {
    if (format === 'excel') {
      return this.excelService.generate(res, data, columns, fileName);
    }

    if (format === 'pdf') {
      return this.pdfService.generate(res, data, columns, fileName);
    }

    throw new BadRequestException('Invalid export format');
  }
}