import { ProgramType } from "@prisma/client";
import { Type } from "class-transformer";
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
  @Type(()=>Number)
  @IsNumber()
  minimumTasksRequired!: number

  @IsEnum(ProgramType)
  type!: ProgramType
  
  @Type(()=>Number)
  @IsNumber()
  price!: number

  @IsOptional()
  rules?: string

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}