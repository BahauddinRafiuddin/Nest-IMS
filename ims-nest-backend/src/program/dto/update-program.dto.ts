// dto/update-program.dto.ts
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateProgramDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  rules?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}