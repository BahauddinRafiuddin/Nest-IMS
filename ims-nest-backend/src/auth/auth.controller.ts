import { Body, Controller, Post, UseGuards, Get, Patch } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "../common/guards/jwt.guard";
import { GetUser } from "../common/decorators/get-user.decorator";
import { ChangePasswordDto } from "./dto/change-password.dto";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('/register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body)
  }

  @Post('/login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@GetUser() user: any) {
    return this.authService.getMe(user)
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  changePassword(
    @GetUser() user: any,
    @Body() body: ChangePasswordDto
  ) {
    return this.authService.changePassword(user.userId, body);
  }
}