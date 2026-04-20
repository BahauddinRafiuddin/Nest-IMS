import { IsEmail, IsNotEmpty, IsOptional, MinLength } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Rafiuddin' })
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'user@gmail.com' })
  @IsEmail()
  email!: string

  @ApiProperty({ example: 'Password@123' })
  @MinLength(8)
  password!: string

  @ApiProperty({ example: 'PUBLIC_USER', required: false })
  @IsOptional()
  role?: string

  @ApiProperty({ example: 'company-id', required: false })
  @IsOptional()
  companyId?: string
}