import { Body, Controller, Post, UseGuards, Get, Query, Patch, Param } from '@nestjs/common';
import { ProgramService } from './program.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateProgramDto } from './dto/create-program.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UpdateProgramDto } from './dto/update-program.dto';
import { ChangeProgramStatusDto } from './dto/change-status.dto';
import { Role } from '@prisma/client';

@Controller('program')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProgramController {
  constructor(private programService: ProgramService) { }

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