import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Role } from '@prisma/client';

@Controller('enrollment')
@UseGuards(JwtAuthGuard, RolesGuard)

export class EnrollmentController {
  constructor(private enrollmentService: EnrollmentService) { }

  // Admin enroll Intern
  @Post('enroll')
  @Roles("ADMIN")
  enrollIntern(@Body() body: CreateEnrollmentDto, @GetUser() user: any) {
    return this.enrollmentService.enrollIntern(body, user)
  }

  // Intern Programs
  @Get('my')
  @Roles("INTERN")
  getMyEnrollments(@GetUser() user: any) {
    return this.enrollmentService.getInternEnrollments(user)
  }

  // Mentro Program
  @Get('/mentor')
  @Roles(Role.MENTOR)
  getMentorPrograms(
    @GetUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 5;
    return this.enrollmentService.getMentorEnrollments(user, pageNumber, limitNumber)
  }

  // Start InternShip
  @Patch('/:id/start')
  @Roles('INTERN')
  startInternship(@Param('id') id: string, @GetUser() user: any) {
    return this.enrollmentService.startInternship(id, user)
  }

  // Mentor Can Complete Internship
  @Patch('/:id/complete')
  @Roles("MENTOR")
  completeInternship(
    @Param('id') id: string,
    @GetUser() user: any
  ) {
    return this.enrollmentService.completeInternship(id, user)
  }

  // get Enrolled Intern Under Mento
  @Get('interns')
  @Roles(Role.MENTOR)
  getMentorInterns(
    @GetUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 5;
    return this.enrollmentService.getMentorInterns(user.userId, pageNumber, limitNumber)
  }
}
