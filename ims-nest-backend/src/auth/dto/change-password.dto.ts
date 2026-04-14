import { IsNotEmpty, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  currentPassword!: string;

  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).*$/, {
    message: 'Password must contain 1 capital letter, 1 number, and 1 symbol',
  })
  newPassword!: string;
}