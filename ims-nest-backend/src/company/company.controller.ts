import { Body, Controller, Get, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateCompanyDto } from './dto/create-company.dto';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { Role } from '@prisma/client';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ExportService } from '../export/export.service';
import { ExportQueryDto } from '../export/dto/export-query.dto';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Company')
@ApiBearerAuth()
@Controller('company')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompanyController {
  constructor(
    private companyService: CompanyService,
    private exportService: ExportService
  ) { }

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create new company (Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Company created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  createCompany(@Body() body: CreateCompanyDto, @GetUser() user: any) {
    return this.companyService.createCompany(body, user.userId)
  }

  @Get()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all companies with pagination' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'List of companies' })
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
  @ApiOperation({ summary: 'Activate/Deactivate company' })
  @ApiParam({ name: 'id', example: 'company-id' })
  @ApiResponse({ status: 200, description: 'Company status updated' })
  toggleCompanyStatus(@Param('id') id: string) {
    return this.companyService.toggleCompanyStatus(id);
  }

  @Get(':id/finance')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get company finance details' })
  @ApiParam({ name: 'id', example: 'company-id' })
  @ApiResponse({ status: 200, description: 'Finance data fetched' })
  getCompanyFinance(@Param('id') companyId: string) {
    return this.companyService.getCompanyFinance(companyId);
  }

  @Get(':id/commission-history')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get company commission history' })
  @ApiParam({ name: 'id', example: 'company-id' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 5 })
  @ApiResponse({ status: 200, description: 'Commission history fetched' })
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
  @ApiOperation({ summary: 'Update company commission percentage' })
  @ApiParam({ name: 'id', example: 'company-id' })
  @ApiResponse({ status: 200, description: 'Commission updated' })
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



  @Get(':id/commission-history/export')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Export commission history (Excel/PDF)' })
  @ApiParam({ name: 'id', example: 'company-id' })
  @ApiQuery({ name: 'format', required: false, example: 'excel' })
  @ApiResponse({ status: 200, description: 'File exported successfully' })
  async exportCommissionHistory(
    @Param('id') companyId: string,
    @Query() query: ExportQueryDto,
    @Res() res: Response,
  ) {
    const history = await this.companyService.getCommissionHistoryForExport(companyId)

    const columns = [
      { header: 'Company', key: 'company', width: 25 },
      { header: 'Commission', key: 'commission', width: 15 },
      { header: 'Start Date', key: 'startDate', width: 15 },
      { header: 'End Date', key: 'endDate', width: 15 },
      { header: 'Duration', key: 'duration', width: 15 },
    ];

    return this.exportService.export({
      res,
      data: history,
      columns,
      fileName: 'commission-history',
      format: query.format || 'excel',
    });
  }
}
