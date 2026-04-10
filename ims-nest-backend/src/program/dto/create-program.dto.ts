import { ProgramType } from "@prisma/client";
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class CreateProgramDto {

  @IsNotEmpty()
  title!: string

  @IsNotEmpty()
  domain!: string

  @IsOptional()
  description?: string;

  @IsNotEmpty()
  mentorId!: string

  @IsNotEmpty()
  @IsNumber()
  minimumTasksRequired!: number

  @IsEnum(ProgramType)
  type!: ProgramType

  @IsNumber()
  price!: number

  @IsOptional()
  rules?: string

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}