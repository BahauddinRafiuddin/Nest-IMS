import { Body, Controller, Get, Param, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Role } from '@prisma/client';
import { ExportService } from '../export/export.service';
import type { Response } from "express"

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private userService: UserService, private exportService: ExportService) { }

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

  // Export All Interns
  @Get('/interns/export')
  @Roles(Role.ADMIN)
  async exportInterns(
    @GetUser() user: any,
    @Query('search') search: string,
    @Query('format') format: 'excel' | 'pdf',
    @Res() res: Response,
  ) {
    const interns = await this.userService.getInternsForExport(
      user.companyId,
      search,
    );

    const data = interns.map((i) => ({
      name: i.name,
      email: i.email,
      isActive: i.isActive ? 'Active' : 'Inactive',
      mentor: i.mentor?.name || 'N/A',
      status: i.enrollmentStatus || 'N/A',
    }));

    const columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Status', key: 'isActive', width: 15 },
      { header: 'Mentor', key: 'mentor', width: 25 },
      { header: 'Enrollment', key: 'status', width: 20 },
    ];

    return this.exportService.export({
      res,
      data,
      columns,
      fileName: 'interns',
      format: format || 'excel',
    });
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

  // Export All Mentors
  @Get('/mentors/export')
  @Roles(Role.ADMIN)
  async exportMentors(
    @GetUser() user: any,
    @Query('search') search: string,
    @Query('format') format: 'excel' | 'pdf',
    @Res() res: Response,
  ) {
    const mentors = await this.userService.getMentorsForExport(
      user.companyId,
      search,
    );

    const data = mentors.map((m) => ({
      name: m.name,
      email: m.email,
      isActive: m.isActive ? 'Active' : 'Inactive',
      interns: m.internCount,
      active: m.activeInternships,
      completed: m.completedInternships,
    }));

    const columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Status', key: 'isActive', width: 15 },
      { header: 'Total Interns', key: 'interns', width: 20 },
      { header: 'Active', key: 'active', width: 15 },
      { header: 'Completed', key: 'completed', width: 15 },
    ];

    return this.exportService.export({
      res,
      data,
      columns,
      fileName: 'mentors',
      format: format || 'excel',
    });
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
