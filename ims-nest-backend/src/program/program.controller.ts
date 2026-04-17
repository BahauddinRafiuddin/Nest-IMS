import { Body, Controller, Post, UseGuards, Get, Query, Patch, Param, Res } from '@nestjs/common';
import { ProgramService } from './program.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateProgramDto } from './dto/create-program.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UpdateProgramDto } from './dto/update-program.dto';
import { ChangeProgramStatusDto } from './dto/change-status.dto';
import { Role } from '@prisma/client';
import type { Response } from 'express';
import { ExportService } from '../export/export.service';

@Controller('program')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProgramController {
  constructor(private programService: ProgramService,private exportService:ExportService) { }

  // Create Program
  @Post('')
  @Roles('ADMIN')
  createProgram(@Body() body: CreateProgramDto, @GetUser() user: any) {
    return this.programService.createProgram(body, user)
  }

  // Get All Programs
  @Get('')
  @Roles('ADMIN')
  getPrograms(@GetUser() user: any,
    @Query('page') page = 1,
    @Query('limit') limit = 5,
    @Query('search') search?: string) {
    return this.programService.getPrograms(user.companyId, Number(page), Number(limit), search)
  }

  // Export All Programs
  @Get('export')
  @Roles('ADMIN')
  async exportPrograms(
    @GetUser() user: any,
    @Query('search') search: string,
    @Query('format') format: 'excel' | 'pdf',
    @Res() res: Response,
  ) {
    // 1. Fetch full data
    const programs = await this.programService.getProgramsForExport(
      user.companyId,
      search,
    );

    // 2. Map data
    const data = programs.map((p) => ({
      title: p.title,
      domain: p.domain,
      status: p.status,
      mentor: p.mentor?.name || 'N/A',
      tasks: p.totalTasks,
      duration: `${p.durationInWeeks} weeks`,
      type: p.type,
      price: p.price,
      startDate: p.startDate
        ? new Date(p.startDate).toISOString().split('T')[0]
        : 'N/A',
      endDate: p.endDate
        ? new Date(p.endDate).toISOString().split('T')[0]
        : 'N/A',
    }));

    // 3. Columns
    const columns = [
      { header: 'Title', key: 'title', width: 30 },
      { header: 'Domain', key: 'domain', width: 25 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Mentor', key: 'mentor', width: 25 },
      { header: 'Tasks', key: 'tasks', width: 10 },
      { header: 'Duration', key: 'duration', width: 15 },
      { header: 'Type', key: 'type', width: 10 },
      { header: 'Price', key: 'price', width: 10 },
      { header: 'Start Date', key: 'startDate', width: 15 },
      { header: 'End Date', key: 'endDate', width: 15 },
    ];

    // 4. Export
    return this.exportService.export({
      res,
      data,
      columns,
      fileName: 'programs',
      format: format || 'excel',
    });
  }
  // Update Program
  @Patch('/:id')
  @Roles("ADMIN")
  updateProgram(
    @Param('id') id: string,
    @GetUser() user: any,
    @Body() dto: UpdateProgramDto
  ) {
    return this.programService.updateProgram(id, user, dto);
  }

  // Change Program status
  @Patch('/:id/status')
  @Roles("ADMIN")
  changeStatus(
    @Param('id') id: string,
    @GetUser() user: any,
    @Body() dto: ChangeProgramStatusDto
  ) {
    return this.programService.changeProgramStatus(
      id,
      user,
      dto
    );
  }

}