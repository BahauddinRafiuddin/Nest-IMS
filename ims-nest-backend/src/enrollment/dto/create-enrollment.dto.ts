import { IsNotEmpty } from "class-validator";


export class CreateEnrollmentDto {
  @IsNotEmpty()
  internId!: string;

  @IsNotEmpty()
  programId!: string;
}