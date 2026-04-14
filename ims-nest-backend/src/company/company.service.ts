import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { generateTempPassword } from '../common/utils/createTemp-pass';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) { }

  async createCompany(data: CreateCompanyDto) {
    const { name, email, commissionPercentage, phone, address, adminName } = data

    const result = await this.prisma.$transaction(async (prisma) => {
      const existing = await this.prisma.company.findFirst({
        where: { name }
      })

      if (existing) {
        throw new BadRequestException('Company already exists');
      }
      const company = await this.prisma.company.create({
        data: {
          name,
          email,
          phone: phone || null,
          address: address || null,
          commissionPercentage,
        },
      });

      const tempPassword = generateTempPassword()
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      const base = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 5);
      const unique = Date.now().toString().slice(-4);
      const adminEmail = `${base}${unique}@tmsadmin.com`;

      const admin = await this.prisma.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: "ADMIN",
          companyId: company.id
        }
      })

      // Email Send ...

      return {
        message: "Company Created Successfully",
        company,
        adminCredentials: {
          email: adminEmail,
          password: tempPassword
        }
      }
    })
  }

  async getCompanyReviews(companyId: string, page: number, limit: number, rating: number) {
    const skip = (page - 1) * limit
    let where: any = {
      companyId,
      status: "ACCEPTED"
    }

    if (rating) {
      where.rating = { gt: Number(rating) };
    }

    const total = await this.prisma.review.count({ where })
    const reviews = await this.prisma.review.findMany({
      where,
      include: {
        program: {
          select: {
            id: true,
            title: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    return {
      success: true,
      reviews,
      totalPages: Math.ceil(total / limit),
      total
    }
  }
}
