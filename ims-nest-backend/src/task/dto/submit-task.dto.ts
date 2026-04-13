import { IsOptional, IsString, IsUrl } from 'class-validator';

export class SubmitTaskDto {

  @IsOptional()
  @IsString()
  submissionText?: string;

  @IsOptional()
  @IsUrl()
  submissionLink?: string;

  @IsOptional()
  @IsString()
  submissionFile?: string;
}