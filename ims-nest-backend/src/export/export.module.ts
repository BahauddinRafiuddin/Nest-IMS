import { Module } from "@nestjs/common";
import { ExportService } from "./export.service";
import { ExcelService } from "./excel/excel.service";
import { PdfService } from "./pdf/pdf.service";


@Module({
  providers: [ExportService, ExcelService, PdfService],
  exports: [ExportService],
})
export class ExportModule {}