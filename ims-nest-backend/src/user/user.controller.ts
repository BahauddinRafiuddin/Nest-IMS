import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Role } from '@prisma/client';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private userService: UserService) { }

  // Admin Create Interns
  @Post('intern')
  @Roles(Role.ADMIN)
  createIntern(@Body() body: CreateUserDto, @GetUser() user: any) {
    return this.userService.createUser(body, user, "INTERN")
  }

  // Admin Create Mentor
  @Post('mentor')
  @Roles(Role.ADMIN)
  createMentor(@Body() body: CreateUserDto, @GetUser() user: any) {
    return this.userService.createUser(body, user, "MENTOR")
  }

  // User Profile
  @Get("profile")
  getMyProfile(@GetUser() user: any) {
    return this.userService.getMyProfile(user.userId)
  }

  // Get Available Mentor for program creation
  @Get('availableMentors')
  @Roles(Role.ADMIN)
  getAvailableMentor(@GetUser() user: any) {
    return this.userService.getAvailableMentor(user.companyId)
  }

  // Get Available Interns For Enrollments
  @Get('availableInterns')
  @Roles(Role.ADMIN)
  getAvailableInterns(@GetUser() user: any) {
    return this.userService.getAvailableInterns(user.companyId)
  }

  // Get All Interns
  @Get('/interns')
  @Roles(Role.ADMIN)
  getAllInterns(
    @GetUser() user: any,
    @Query('page') page = 1,
    @Query('limit') limit = 5,
    @Query('search') search?: string
  ) {
    return this.userService.getAllInterns(user.companyId, Number(page), Number(limit), search)
  }

  @Get('/mentors')
  @Roles(Role.ADMIN)
  getAllMentors(
    @GetUser() user: any,
    @Query('page') page = 1,
    @Query('limit') limit = 5,
    @Query('search') search?: string
  ) {
    return this.userService.getAllMentors(user.companyId, Number(page), Number(limit), search)
  }

  @Patch('intern/:id/status')
  @Roles(Role.ADMIN)
  updateInternStatus(
    @Param('id') internId: string,
    @Body('isActive') isActive: boolean,
    @GetUser() user: any
  ) {
    return this.userService.updateInternStatus(
      internId,
      isActive,
      user.companyId
    );
  }

}
