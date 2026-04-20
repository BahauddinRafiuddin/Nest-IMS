import { IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPassword@123' })
  @IsNotEmpty()
  currentPassword!: string;

  @ApiProperty({
    example: 'NewPassword@123',
    description: 'Must contain 1 uppercase, 1 number, 1 symbol'
  })
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).*$/, {
    message: 'Password must contain 1 capital letter, 1 number, and 1 symbol',
  })
  newPassword!: string;
}