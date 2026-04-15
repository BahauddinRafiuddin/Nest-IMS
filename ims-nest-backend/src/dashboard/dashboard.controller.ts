import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { DashboardService } from './dashboard.service';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

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
