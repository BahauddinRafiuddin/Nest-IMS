import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Google Inc.' })
  name!: string;

  @ApiProperty({ example: 'company@gmail.com' })
  email!: string;

  @ApiProperty({ example: '+919876543210', required: false })
  phone?: string;

  @ApiProperty({ example: 'Surat, Gujarat', required: false })
  address?: string;

  @ApiProperty({ example: 20 })
  commissionPercentage!: number;

  @ApiProperty({ example: 'Admin Name' })
  adminName!: string;
}