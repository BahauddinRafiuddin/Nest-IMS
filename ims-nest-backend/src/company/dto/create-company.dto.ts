import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsString,
} from 'class-validator';

export class CreateCompanyDto {
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsNumber()
  @Min(1)
  @Max(95)
  commissionPercentage!: number;

  @IsNotEmpty()
  adminName!: string;
}