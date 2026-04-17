import { IsIn, IsOptional } from 'class-validator';

export class ExportQueryDto {
  @IsOptional()
  @IsIn(['excel', 'pdf'])
  format?: 'excel' | 'pdf' = 'excel';
}