import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
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

  @Post('enroll')
  @Roles("ADMIN")
  enrollIntern(@Body() body: CreateEnrollmentDto, @GetUser() user: any) {
    return this.enrollmentService.enrollIntern(body, user)
  }

  @Get('my')
  @Roles("INTERN")
  getMyEnrollments(@GetUser() user: any) {
    return this.enrollmentService.myEnrollments(user)
  }

  @Patch('/:id/start')
  @Roles('INTERN')
  startInternship(@Param('id') id: string, @GetUser() user: any) {
    return this.enrollmentService.startInternship(id, user)
  }
}
