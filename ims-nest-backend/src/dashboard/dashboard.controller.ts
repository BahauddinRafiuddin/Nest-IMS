import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { DashboardService } from './dashboard.service';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ExportService } from '../export/export.service';
import type { Response } from 'express';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService, private exportService: ExportService) { }

  @Get('super-admin')
  @Roles(Role.SUPER_ADMIN)
  getSuperAdminDashboard() {
    return this.dashboardService.getSuperAdminDashboard();
  }

  @Get('platform-finance')
  @Roles(Role.SUPER_ADMIN)
  getPlatformFinanceStats() {
    return this.dashboardService.getPlatformFinanceStats();
  }

  // SuperAdmin Can Export All Transaction
  @Get('export/transaction-report')
  @Roles(Role.SUPER_ADMIN)
  async exportTransactionReport(
    @Query() query: any, // later we improve DTO
    @Res() res: Response,
  ) {
    // 1. Get filtered OR full data
    const result = await this.dashboardService.getCompanyTransactionReport(
      query,
      true, //  EXPORT MODE
    );

    // 2. Map data 
    const payments = result as any[];
    const data = payments.map((p) => ({
      internName: p.intern?.name,
      internEmail: p.intern?.email,
      company: p.company?.name,
      program: p.program?.title,
      amount: p.totalAmount,
      commission: p.superAdminCommission,
      companyEarning: p.companyEarning,
      commissionPercentage: `${p.commissionPercentage}%`,
      date: p.createdAt.toISOString().split('T')[0],
    }));

    // 3. Columns
    const columns = [
      { header: 'Intern Name', key: 'internName', width: 25 },
      { header: 'Email', key: 'internEmail', width: 30 },
      { header: 'Company', key: 'company', width: 25 },
      { header: 'Program', key: 'program', width: 25 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Commission', key: 'commission', width: 15 },
      { header: 'Company Earning', key: 'companyEarning', width: 20 },
      { header: 'Commission %', key: 'commissionPercentage', width: 15 },
      { header: 'Date', key: 'date', width: 15 },
    ];

    // 4. Export
    return this.exportService.export({
      res,
      data,
      columns,
      fileName: 'transaction-report',
      format: query.format || 'excel',
    });
  }

  // Company Admin Can get transaction
  @Get('company-transaction-report')
  @Roles(Role.SUPER_ADMIN)
  getCompanyTransactionReport(
    @Query('commission') commission?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('companyId') companyId?: string
  ) {
    return this.dashboardService.getCompanyTransactionReport({
      commission,
      startDate,
      endDate,
      companyId,
    });
  }

  @Get('admin/export/transaction-report')
  @Roles(Role.ADMIN)
  async exportAdminTransactionReport(
    @GetUser() user: any,
    @Query() query: any,
    @Res() res: Response,
  ) {
    // 🔥 Force companyId from logged-in admin
    const filters = {
      ...query,
      companyId: user.companyId, // ✅ SECURITY
    };

    // 1. Fetch data
    const payments =
      await this.dashboardService.getTransactionReportForExport(filters);

    // 2. Map data
    const data = payments.map((p) => ({
      internName: p.intern?.name,
      internEmail: p.intern?.email,
      program: p.program?.title,
      amount: p.totalAmount,
      companyEarning: p.companyEarning,
      commissionPercentage: `${p.commissionPercentage}%`,
      date: p.createdAt.toISOString().split('T')[0],
    }));

    // 3. Columns (ADMIN should NOT see super admin commission ❗)
    const columns = [
      { header: 'Intern Name', key: 'internName', width: 25 },
      { header: 'Email', key: 'internEmail', width: 30 },
      { header: 'Program', key: 'program', width: 25 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Company Earning', key: 'companyEarning', width: 20 },
      { header: 'Commission %', key: 'commissionPercentage', width: 15 },
      { header: 'Date', key: 'date', width: 15 },
    ];

    // 4. Export
    return this.exportService.export({
      res,
      data,
      columns,
      fileName: 'admin-transaction-report',
      format: query.format || 'excel',
    });
  }

  @Get('admin')
  @Roles(Role.ADMIN)
  getAdminDashboard(@GetUser() user: any) {
    return this.dashboardService.getAdminDashboard(user.companyId);
  }

  @Get('admin-finance')
  @Roles(Role.ADMIN)
  getAdminFinanceOverview(
    @GetUser() user: any,
    @Query('commission') commission?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.dashboardService.getAdminFinanceOverview({
      companyId: user.companyId,
      commission,
      startDate,
      endDate,
      page: Number(page) || 1,
      limit: Number(limit) || 2,
    });
  }

  @Get('mentor')
  @Roles(Role.MENTOR)
  getMentorDashboard(@GetUser() user: any) {
    return this.dashboardService.getMentorDashboard(user.userId, user.companyId);
  }

  @Get('mentor-performance')
  @Roles(Role.MENTOR)
  getInternPerformance(@GetUser() user: any) {
    return this.dashboardService.getInternPerformance(user.userId);
  }
}
