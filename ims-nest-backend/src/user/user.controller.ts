import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class UserController {
  constructor(private userService: UserService) { }

  @Post('intern')
  createIntern(@Body() body: CreateUserDto, @GetUser() user: any) {
    return this.userService.createUser(body, user, "INTERN")
  }

  @Post('mentor')
  createMentor(@Body() body: CreateUserDto, @GetUser() user: any) {
    return this.userService.createUser(body, user, "MENTOR")
  }
}
