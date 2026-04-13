// dto/change-status.dto.ts
import { IsEnum } from 'class-validator';
import { ProgramStatus } from '@prisma/client';

export class ChangeProgramStatusDto {
  @IsEnum(ProgramStatus)
  changedStatus!: ProgramStatus;
}