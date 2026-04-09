import { Body, Controller, Post, UseGuards,Get } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "../common/guards/jwt.guard";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('/register')
  register(@Body() body:RegisterDto) {
    return this.authService.register(body)
  }

  @Post('/login')
  login(@Body() body:LoginDto){
    return this.authService.login(body)
  }

  @Get('protected')
  @UseGuards(JwtAuthGuard)
  test(){
    return{message:"Protected Route Working"}
  }
}