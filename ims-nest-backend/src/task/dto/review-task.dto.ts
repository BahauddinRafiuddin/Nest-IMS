import { TaskStatus } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsOptional, Max, Min } from "class-validator";


export class ReviewTaskDto {

  @IsOptional()
  feedback?: string

  @IsNotEmpty()
  @Min(0)
  @Max(10)
  score!: number

  @IsNotEmpty()
  @IsEnum(TaskStatus)
  status!: TaskStatus
}