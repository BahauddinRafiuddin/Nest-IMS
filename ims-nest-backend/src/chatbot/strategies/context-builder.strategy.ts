import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProgramType } from '@prisma/client';

@Injectable()
export class ContextBuilderStrategy {
  constructor(private prisma: PrismaService) { }

  async build(intent: string, user: any) {
    const { userId, role, companyId } = user;

    switch (intent) {

      // 👤 PROFILE
      case 'profile_details':
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          include: {
            company: {
              select: {
                name: true,
              }
            }
          }
        });
        return {
          name: user?.name,
          CompanyName: user?.company?.name,
          email: user?.email
        }

      // 📋 TASKS
      case 'tasks':
        return this.getTasks(userId, role);

      // 🎓 PROGRAMS
      case 'programs':
        return this.getPrograms(role, userId, companyId);

      // PERFORMANCE (INTERN)
      case 'performance':
        return this.getPerformance(userId);

      // CERTIFICATE
      case 'certificate':
        return this.prisma.enrollment.findMany({
          where: {
            internId: userId,
            status: 'COMPLETED',
          },
          select: {
            programId: true,
            completedAt: true,
          },
        });

      // INTERNS
      case 'interns':
        return this.prisma.user.findMany({
          where: {
            role: 'INTERN',
            companyId,
          },
          select: {
            id: true,
            name: true,
            email: true,
          },
          take: 10,
        });

      // MENTORS
      case 'mentors':
        return this.prisma.user.findMany({
          where: {
            role: 'MENTOR',
            companyId,
          },
          select: {
            id: true,
            name: true,
            email: true,
          },
          take: 10,
        });

      // COMPANIES (PUBLIC + ADMIN)
      case 'companies':
        return this.prisma.company.findMany({
          select: {
            id: true,
            name: true,
            email: true,
          },
          take: 10,
        });

      // JOIN REQUESTS (PUBLIC USER)
      case 'join_requests':
        return this.prisma.joinRequest.findMany({
          where: { userId },
          select: {
            companyId: true,
            status: true,
            createdAt: true,
          },
        });

      // FINANCE (ADMIN / SUPER ADMIN)
      case 'finance':
        return this.getFinanceDetails(role, userId, companyId)

      // COMMISSION (SUPER ADMIN)
      case 'commission':
        return this.prisma.payment.aggregate({
          _sum: {
            superAdminCommission: true,
          },
        });

      // DEFAULT
      default:
        return null;
    }
  }

  // 🔹 TASK LOGIC
  private async getTasks(userId: string, role: string) {
    const normalizedRole = role.toUpperCase();

    if (normalizedRole === 'INTERN') {
      return this.prisma.task.findMany({
        where: { assignedInternId: userId },
        select: {
          title: true,
          status: true,
          deadline: true,
        },
      });
    }

    if (normalizedRole === 'MENTOR') {
      return this.prisma.task.findMany({
        where: { mentorId: userId },
        select: {
          title: true,
          status: true,
          assignedInternId: true,
        },
      });
    }

    return [];
  }

  // 🔹 PROGRAM LOGIC
  private async getPrograms(role: string, userId: string, companyId: string) {
    const normalizedRole = role.toUpperCase();

    // INTERN → enrolled programs
    if (normalizedRole === 'INTERN') {
      return this.prisma.enrollment.findMany({
        where: { internId: userId },
        include: {
          program: true,
          mentor: {
            select: {
              name: true,
              email: true
            }
          }
        },

      });
    }

    // MENTOR → assigned programs
    if (normalizedRole === 'MENTOR') {
      return this.prisma.internshipProgram.findMany({
        where: { mentorId: userId },
      });
    }

    // ADMIN → company programs
    if (normalizedRole === 'ADMIN') {
      return this.prisma.internshipProgram.findMany({
        where: { companyId },
      });
    }

    if(normalizedRole === "PUBLIC_USER"){
      const programs=await this.prisma.internshipProgram.findMany({
        include:{
          company:true
        },
      })

      const data=programs.map((p)=>{
        return {
          programTitle:p.title,
          programDesc:p.description,
          programPrice:p.price,
          rogramType:p.type,
          comanyName:p.company.name,
        }
      })

      return data
    }
  }

  // 🔹 PERFORMANCE LOGIC
  private async getPerformance(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { internId: userId },
      include: {
        tasks: true,
      },
    });

    return enrollments.map((e) => ({
      totalTasks: e.tasks.length,
      completedTasks: e.tasks.filter(
        (t) => t.status === 'APPROVED'
      ).length,
    }));
  }

  // Finance logic
  private async getFinanceDetails(role: string, userId: string, companyId: string) {
    const normalizedRole = role.toUpperCase();
    if (normalizedRole === "ADMIN") {
      return await this.prisma.companyWallet.findUnique({
        where: {
          companyId
        },
        select: {
          totalEarning: true,
          totalWithdrawn: true,
          availableBalance: true,
        },
      })
    }
    if (normalizedRole === "SUPER_ADMIN") {
      const financeDetails = await this.prisma.payment.findMany({
        where: { paymentStatus: "SUCCESS" },
        include: {
          intern: {
            select: {
              name: true,
              email: true
            }
          },
          program: {
            select: {
              title: true,
              price: true
            }
          }
        }, orderBy: {
          createdAt: "desc"
        }
      })

      const totalTransactions = financeDetails.length
      const totalRevenue = financeDetails.reduce((sum, p) => sum + p.totalAmount, 0);
      const totalCommissionEarned = financeDetails.reduce((sum, p) => sum + p.superAdminCommission, 0);
      const totalCompanyEarning = financeDetails.reduce((sum, p) => sum + p.companyEarning, 0);

      return {
        summary: {
          totalRevenue,
          totalCommissionEarned,
          totalCompanyEarning,
          totalTransactions,
        },
      }
    }
  }
}