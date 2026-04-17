import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) { }

  async getSuperAdminDashboard() {
    const [
      totalCompanies,
      activeCompanies,
      inactiveCompanies,
      totalAdmins,
      recentCompanies,
    ] = await this.prisma.$transaction([

      // Total companies
      this.prisma.company.count(),

      // Active companies
      this.prisma.company.count({
        where: { isActive: true },
      }),

      // Inactive companies
      this.prisma.company.count({
        where: { isActive: false },
      }),

      // Total admins
      this.prisma.user.count({
        where: { role: 'ADMIN' },
      }),

      // Recent companies (last 5)
      this.prisma.company.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      success: true,
      stats: {
        totalCompanies,
        activeCompanies,
        inactiveCompanies,
        totalAdmins,
      },
      recentCompanies,
    };
  }

  async getPlatformFinanceStats() {
    const [
      aggregation,
      totalTransactions,
      totalCompanies,
    ] = await this.prisma.$transaction([

      //  Aggregate finance
      this.prisma.payment.aggregate({
        where: {
          paymentStatus: 'SUCCESS',
        },
        _sum: {
          totalAmount: true,
          superAdminCommission: true,
          companyEarning: true,
        },
      }),

      //  Total transactions
      this.prisma.payment.count({
        where: {
          paymentStatus: 'SUCCESS',
        },
      }),

      //  Total companies
      this.prisma.company.count(),
    ]);

    return {
      success: true,
      data: {
        totalRevenue: aggregation._sum.totalAmount || 0,
        totalCommission: aggregation._sum.superAdminCommission || 0,
        totalCompanyEarning: aggregation._sum.companyEarning || 0,
        totalTransactions,
        totalCompanies,
      },
    };
  }

  async getCompanyTransactionReport(query: {
    commission?: string;
    startDate?: string;
    endDate?: string;
    companyId?: string;
  }, isExport = false) {
    const { commission, startDate, endDate, companyId } = query;

    // 🔥 Build filter
    const where: any = {
      paymentStatus: 'SUCCESS',
    };

    if (companyId) {
      where.companyId = companyId;
    }

    if (commission) {
      where.commissionPercentage = Number(commission);
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // 🔥 Fetch all payments (for transaction list)
    const payments = await this.prisma.payment.findMany({
      where,
      include: {
        intern: { select: { name: true, email: true } },
        program: { select: { title: true, price: true } },
        company: { select: { name: true, commissionPercentage: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 🔥 Summary (same as reduce)
    const summary = payments.reduce(
      (acc, p) => {
        acc.totalRevenue += p.totalAmount;
        acc.totalCommission += p.superAdminCommission;
        acc.totalCompanyEarning += p.companyEarning;
        acc.totalTransactions += 1;
        return acc;
      },
      {
        totalRevenue: 0,
        totalCommission: 0,
        totalCompanyEarning: 0,
        totalTransactions: 0,
      },
    );

    // 🔥 Commission Breakdown (group by commission %)
    const breakdownRaw = await this.prisma.payment.groupBy({
      by: ['commissionPercentage'],
      where,
      _sum: {
        totalAmount: true,
        superAdminCommission: true,
      },
      _count: true,
    });

    const commissionBreakdown = breakdownRaw.map((item) => ({
      commissionPercentage: item.commissionPercentage,
      totalRevenue: item._sum.totalAmount || 0,
      totalCommission: item._sum.superAdminCommission || 0,
      totalTransactions: item._count,
    }));

    // 🔥 Company Wise Summary
    const companyRaw = await this.prisma.payment.groupBy({
      by: ['companyId'],
      where,
      _sum: {
        totalAmount: true,
        superAdminCommission: true,
      },
      _count: true,
    });

    // 🔥 Fetch company names
    const companyIds = companyRaw.map((c) => c.companyId);

    const companies = await this.prisma.company.findMany({
      where: {
        id: { in: companyIds },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const companyMap = new Map(companies.map((c) => [c.id, c.name]));

    const companyWiseSummary = companyRaw.map((item) => ({
      companyId: item.companyId,
      companyName: companyMap.get(item.companyId),
      totalRevenue: item._sum.totalAmount || 0,
      totalCommission: item._sum.superAdminCommission || 0,
      totalTransactions: item._count,
    }));

    if (isExport) {
      return payments
    }
    return {
      success: true,
      summary,
      transactions: payments,
      companyWiseSummary,
      commissionBreakdown,
    };
  }

  async getAdminDashboard(companyId: string) {
    const [
      totalInterns,
      activeInterns,
      totalMentors,
      totalPrograms,
      activePrograms,
      completedPrograms,
    ] = await this.prisma.$transaction([

      this.prisma.user.count({
        where: {
          role: 'INTERN',
          companyId,
        },
      }),

      this.prisma.user.count({
        where: {
          role: 'INTERN',
          companyId,
          isActive: true,
        },
      }),

      this.prisma.user.count({
        where: {
          role: 'MENTOR',
          companyId,
        },
      }),

      this.prisma.internshipProgram.count({
        where: {
          companyId,
        },
      }),

      this.prisma.internshipProgram.count({
        where: {
          companyId,
          status: 'ACTIVE',
        },
      }),

      this.prisma.internshipProgram.count({
        where: {
          companyId,
          status: 'COMPLETED',
        },
      }),

    ]);

    return {
      success: true,
      dashboard: {
        totalInterns,
        activeInterns,
        inactiveInterns: totalInterns - activeInterns,
        totalMentors,
        totalPrograms,
        activePrograms,
        completedPrograms,
      },
    };
  }

  async getAdminFinanceOverview(query: {
    companyId: string;
    commission?: string;
    startDate?: string;
    endDate?: string;
    page: number;
    limit: number;
  }) {
    const { companyId, commission, startDate, endDate, page, limit } = query;

    const where: any = {
      paymentStatus: 'SUCCESS',
      companyId,
    };

    if (commission) {
      where.commissionPercentage = Number(commission);
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // total count
    const totalCount = await this.prisma.payment.count({ where });
    const totalPages = Math.ceil(totalCount / limit);

    // paginated transactions
    const payments = await this.prisma.payment.findMany({
      where,
      include: {
        intern: { select: { name: true, email: true } },
        program: { select: { title: true, price: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // summary (same as reduce)
    const allPayments = await this.prisma.payment.findMany({ where });

    const summary = allPayments.reduce(
      (acc, p) => {
        acc.totalRevenue += p.totalAmount;
        acc.totalCommission += p.superAdminCommission;
        acc.totalCompanyEarning += p.companyEarning;
        return acc;
      },
      {
        totalRevenue: 0,
        totalCommission: 0,
        totalCompanyEarning: 0,
      }
    );

    // breakdown (group by commission)
    const breakdownRaw = await this.prisma.payment.groupBy({
      by: ['commissionPercentage'],
      where,
      _sum: {
        totalAmount: true,
        superAdminCommission: true,
        companyEarning: true,
      },
      _count: true,
    });

    const commissionBreakdown = breakdownRaw.map((item) => ({
      commissionPercentage: item.commissionPercentage,
      totalRevenue: item._sum.totalAmount || 0,
      totalCommission: item._sum.superAdminCommission || 0,
      totalEarning: item._sum.companyEarning || 0,
      totalTransactions: item._count,
    }));

    return {
      success: true,
      summary: {
        ...summary,
        totalTransactions: totalCount,
      },
      transactions: payments,
      commissionBreakdown,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
      },
    };
  }

  async getMentorDashboard(mentorId: string, companyId: string) {

    const mentor = await this.prisma.user.findUnique({
      where: { id: mentorId },
    });

    if (!mentor || mentor.role !== 'MENTOR') {
      throw new ForbiddenException('Not authorized');
    }

    // Programs
    const programs = await this.prisma.internshipProgram.findMany({
      where: {
        mentorId,
        companyId,
      },
    });

    const totalPrograms = programs.length;

    const activePrograms = programs.filter(
      (p) => p.status === 'ACTIVE'
    ).length;

    // Intern count (unique)
    const totalInterns = await this.prisma.enrollment.count({
      where: {
        mentorId,
      },
    });

    // Tasks
    const tasks = await this.prisma.task.findMany({
      where: {
        mentorId,
      },
      include: {
        program: {
          select: { title: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalTasks = tasks.length;

    const pendingReviews = tasks.filter(
      (t) => t.reviewStatus === 'PENDING' && t.status === 'SUBMITTED'
    ).length;

    const approvedTasks = tasks.filter(
      (t) => t.status === 'APPROVED'
    ).length;

    const rejectedTasks = tasks.filter(
      (t) => t.status === 'REJECTED'
    ).length;

    // Recent Data
    const recentTasks = tasks.slice(0, 3);

    const recentPrograms = programs
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);

    return {
      success: true,
      dashboard: {
        totalPrograms,
        activePrograms,
        totalInterns,
        totalTasks,
        pendingReviews,
        approvedTasks,
        rejectedTasks,
      },
      recentPrograms,
      recentTasks,
    };
  }

  async getInternPerformance(mentorId: string) {

    const tasks = await this.prisma.task.findMany({
      where: {
        mentorId,
      },
      include: {
        assignedIntern: {
          select: { id: true, name: true, email: true },
        },
        program: {
          select: { title: true },
        },
      },
    });

    const performanceMap: any = {};

    tasks.forEach((task) => {
      const internId = task.assignedIntern.id;

      if (!performanceMap[internId]) {
        performanceMap[internId] = {
          intern: task.assignedIntern,
          program: task.program,
          totalTasks: 0,
          submitted: 0,
          approved: 0,
          rejected: 0,
          pending: 0,
          late: 0,
          totalScore: 0,
          scoredTasks: 0,
          attempts: 0,
        };
      }

      const p = performanceMap[internId];

      p.totalTasks++;
      p.attempts += task.attempts || 0;

      if (task.isLate) p.late++;

      if (task.status === 'SUBMITTED') p.submitted++;
      if (task.status === 'APPROVED') {
        p.approved++;

        if (task.score !== null && task.score !== undefined) {
          p.totalScore += task.score;
          p.scoredTasks++;
        }
      }

      if (task.status === 'REJECTED') p.rejected++;
      if (task.status === 'PENDING') p.pending++;
    });

    const result = Object.values(performanceMap).map((p: any) => {
      const avgScore =
        p.scoredTasks === 0
          ? 0
          : Number((p.totalScore / p.scoredTasks).toFixed(1));

      const completion =
        p.totalTasks === 0
          ? 0
          : Math.round((p.approved / p.totalTasks) * 100);

      let grade = 'Poor';
      if (avgScore >= 8) grade = 'Excellent';
      else if (avgScore >= 6) grade = 'Good';

      return {
        ...p,
        averageScore: avgScore,
        completion,
        grade,
      };
    });

    return {
      success: true,
      interns: result,
    };
  }

  async getTransactionReportForExport(query: {
  commission?: string;
  startDate?: string;
  endDate?: string;
  companyId?: string;
}) {
  const { commission, startDate, endDate, companyId } = query;

  const where: any = {
    paymentStatus: 'SUCCESS',
  };

  // 🔐 Admin restriction
  if (companyId) {
    where.companyId = companyId;
  }

  if (commission) {
    where.commissionPercentage = Number(commission);
  }

  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  return this.prisma.payment.findMany({
    where,
    include: {
      intern: { select: { name: true, email: true } },
      program: { select: { title: true, price: true } },
      company: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}
}
