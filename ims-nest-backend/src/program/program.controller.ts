import { Body, Controller, Post, UseGuards,Get } from '@nestjs/common';
import { ProgramService } from './program.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateProgramDto } from './dto/create-program.dto';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('program')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ProgramController {
  constructor(private programService: ProgramService) { }

  @Post('')
  createProgram(@Body() body: CreateProgramDto, @GetUser() user: any) {
    return this.programService.createProgram(body, user)
  }

  @Get('')
  getPrograms(@GetUser() user: any){
    return this.programService.getPrograms(user)
  }
}