import { IsString, IsOptional, IsUUID, IsDateString, IsEnum } from 'class-validator';
import { TaskPriority } from '@prisma/client';

export class CreateTaskDto {

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  programId!: string;

  @IsUUID()
  assignedInternId!: string;

  @IsDateString()
  deadline!: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;
}