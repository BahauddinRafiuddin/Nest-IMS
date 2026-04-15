import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
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
  createCompany(@Body() body: CreateCompanyDto,@GetUser() user:any) {
    return this.companyService.createCompany(body,user.userId)
  }

  @Get()
  @Roles(Role.SUPER_ADMIN)
  getAllCompanies(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;

    return this.companyService.getAllCompanies(pageNumber, limitNumber);
  }

  @Patch(':id/toggle-status')
  @Roles(Role.SUPER_ADMIN)
  toggleCompanyStatus(@Param('id') id: string) {
    return this.companyService.toggleCompanyStatus(id);
  }

  @Get(':id/finance')
  @Roles(Role.SUPER_ADMIN)
  getCompanyFinance(@Param('id') companyId: string) {
    return this.companyService.getCompanyFinance(companyId);
  }

  @Get(':id/commission-history')
  @Roles(Role.SUPER_ADMIN)
  getCompanyCommissionHistory(
    @Param('id') companyId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.companyService.getCompanyCommissionHistory(
      companyId,
      Number(page) || 1,
      Number(limit) || 5
    );
  }

  @Patch(':id/commission')
  @Roles(Role.SUPER_ADMIN)
  updateCompanyCommission(
    @Param('id') companyId: string,
    @Body('commissionPercentage') commissionPercentage: number,
    @GetUser() user: any
  ) {
    return this.companyService.updateCompanyCommission(
      companyId,
      commissionPercentage,
      user.userId
    );
  }

}
