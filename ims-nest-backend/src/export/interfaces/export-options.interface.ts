import { Response } from 'express';
import { ExportColumn } from './export-column.interface';

export interface ExportOptions<T = any> {
  res: Response;
  data: T[];
  columns: ExportColumn[];
  fileName: string;
  format: 'excel' | 'pdf';
}