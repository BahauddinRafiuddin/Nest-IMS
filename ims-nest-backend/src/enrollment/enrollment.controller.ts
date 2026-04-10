import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { GetUser } from '../common/decorators/get-user.decorator';

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
}
