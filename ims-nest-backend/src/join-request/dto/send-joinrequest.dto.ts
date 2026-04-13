import { IsNotEmpty, IsOptional, IsUUID } from "class-validator";

export class SendJoinrequestDto {
  @IsNotEmpty()
  @IsUUID()
  companyId!: string

  @IsOptional()
  @IsUUID()
  programId?: string

  @IsOptional()
  message?: string
}