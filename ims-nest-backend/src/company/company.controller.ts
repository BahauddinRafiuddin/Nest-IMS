import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateCompanyDto } from './dto/create-company.dto';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { Role } from '@prisma/client';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('company')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompanyController {
  constructor(private companyService: CompanyService) { }


  @Post()
  @Roles(Role.SUPER_ADMIN)
  createCompany(@Body() body: CreateCompanyDto) {
    return this.companyService.createCompany(body)
  }

  @Get('reviews')
  @Roles(Role.ADMIN)
  getCompanyReviews(
    @GetUser() user: any,
    @Query('page') page = 1,
    @Query('limit') limit = 5,
    @Query('rating') rating:number,
  ) {
    return this.companyService.getCompanyReviews(user.companyId, Number(page), Number(limit), Number(rating))
  }

}
