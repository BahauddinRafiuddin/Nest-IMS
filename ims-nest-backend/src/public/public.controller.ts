import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PublicService } from './public.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Query } from '@nestjs/common';

@Controller('public')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PublicController {
  constructor(private publicService: PublicService) { }
  
  @Get('companies')
  @Roles(Role.PUBLIC_USER)
  getCompaniesWithPrograms(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '9',
    @Query('search') search?: string
  ) {
    return this.publicService.getAllCompaniesWithPrograms(
      Number(page),
      Number(limit),
      search
    );
  }

}
