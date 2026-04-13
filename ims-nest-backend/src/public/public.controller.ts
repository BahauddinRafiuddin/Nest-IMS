import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PublicService } from './public.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('public')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PublicController {
  constructor(private publicService: PublicService) { }

  @Get('companies')
  @Roles(Role.PUBLIC_USER)
  getCompaniesWithPrograms(@Param('page') page = 1, @Param('limit') limit = 5, search?: string) {
    return this.publicService.getAllCompaniesWithPrograms(Number(page), Number(limit), search)
  }

}
