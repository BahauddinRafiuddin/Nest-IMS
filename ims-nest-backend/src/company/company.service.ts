import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { generateTempPassword } from '../common/utils/createTemp-pass';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../common/service/email.service';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService, private emailService: EmailService) { }

  async createCompany(data: CreateCompanyDto, userId: string) {
    const { name, email, commissionPercentage, phone, address, adminName } = data;

    const result = await this.prisma.$transaction(async (prisma) => {

      //  1. Check existing company
      const existing = await prisma.company.findFirst({
        where: { name },
      });

      if (existing) {
        throw new BadRequestException('Company already exists');
      }

      //  2. Create Company
      const company = await prisma.company.create({
        data: {
          name,
          email,
          phone: phone || null,
          address: address || null,
          commissionPercentage,
        },
      });

      //  3. Create Commission History 
      await prisma.commissionHistory.create({
        data: {
          companyId: company.id,
          commissionPercentage: company.commissionPercentage,
          startDate: new Date(),
          updatedById: userId, 
        },
      });

      //  4. Generate Admin Credentials
      const tempPassword = generateTempPassword();
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      const base = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 5);

      const unique = Date.now().toString().slice(-4);
      const adminEmail = `${base}${unique}@tmsadmin.com`;

      //  5. Create Admin User
      const admin = await prisma.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          companyId: company.id,
        },
      });

      //  6. Send Email (non-blocking)
      try {
        await this.emailService.sendEmail(
          email,
          'Your IMS Admin Account Created',
          `
        <h2>Welcome to IMS Platform</h2>
        <p>Your admin account has been created successfully.</p>
        <p><strong>Company:</strong> ${name}</p>
        <p><strong>Email:</strong> ${adminEmail}</p>
        <p><strong>Password:</strong> ${tempPassword}</p>
        <p>Please login and change your password immediately.</p>
      `
        );
      } catch (error) {
        console.error('Email failed:', error);
      }

      //  7. Return response
      return {
        success: true,
        message: 'Company Created Successfully',
        company,
        adminCredentials: {
          email: adminEmail,
          password: tempPassword,
        },
      };
    });

    return result;
  }

  async getAllCompanies(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [companies, total] = await this.prisma.$transaction([
      this.prisma.company.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.company.count(),
    ]);

    return {
      success: true,
      message: 'Companies fetched successfully',
      companies,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async toggleCompanyStatus(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const updatedCompany = await this.prisma.company.update({
      where: { id: companyId },
      data: {
        isActive: !company.isActive,
      },
    });

    const status = updatedCompany.isActive ? 'active' : 'inactive';

    return {
      success: true,
      message: `Company status updated to ${status}`,
      company: updatedCompany,
    };
  }

  async getCompanyFinance(companyId: string) {
    const [aggregation, totalTransactions, wallet] = await this.prisma.$transaction([

      this.prisma.payment.aggregate({
        where: {
          companyId,
          paymentStatus: 'SUCCESS',
        },
        _sum: {
          totalAmount: true,
          superAdminCommission: true,
          companyEarning: true,
        },
      }),

      this.prisma.payment.count({
        where: {
          companyId,
          paymentStatus: 'SUCCESS',
        },
      }),

      this.prisma.companyWallet.findUnique({
        where: { companyId },
      }),
    ]);

    return {
      success: true,
      data: {
        totalRevenue: aggregation._sum.totalAmount || 0,
        totalCommission: aggregation._sum.superAdminCommission || 0,
        totalCompanyEarning: aggregation._sum.companyEarning || 0,
        totalTransactions,
        availableBalance: wallet?.availableBalance || 0,
      },
    };
  }

  async getCompanyCommissionHistory(
    companyId: string,
    page = 1,
    limit = 5
  ) {
    const skip = (page - 1) * limit;

    const [history, total] = await this.prisma.$transaction([
      this.prisma.commissionHistory.findMany({
        where: {
          companyId,
        },
        include: {
          company: {
            select: { name: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),

      this.prisma.commissionHistory.count({
        where: { companyId },
      }),
    ]);

    // 🔥 Transform data (same as your logic)
    const data = history.map((item) => {
      const start = new Date(item.startDate);
      const end = item.endDate ? new Date(item.endDate) : new Date();

      const durationDays = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        companyId: item.companyId,
        companyName: item.company?.name,
        commissionPercentage: item.commissionPercentage,
        startDate: item.startDate,
        endDate: item.endDate,
        durationDays,
      };
    });

    return {
      success: true,
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateCompanyCommission(
    companyId: string,
    commissionPercentage: number,
    userId: string
  ) {
    return this.prisma.$transaction(async (tx) => {

      //  1. Check company
      const company = await tx.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      //  2. Close previous active commission
      await tx.commissionHistory.updateMany({
        where: {
          companyId,
          endDate: null,
        },
        data: {
          endDate: new Date(),
        },
      });

      //  3. Create new commission history
      await tx.commissionHistory.create({
        data: {
          companyId,
          commissionPercentage,
          startDate: new Date(),
          updatedById: userId
        },
      });

      //  4. Update company
      await tx.company.update({
        where: { id: companyId },
        data: {
          commissionPercentage,
        },
      });

      return {
        success: true,
        message: 'Commission updated successfully',
      };
    });
  }
}
