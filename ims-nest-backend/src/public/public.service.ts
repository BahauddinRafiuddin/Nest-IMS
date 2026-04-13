import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) { }

  async getAllCompaniesWithPrograms(
    page: number,
    limit: number,
    search?: string
  ) {
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      ...(search && {
        name: {
          contains: search,
        },
      }),
    };

    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        include: {
          programs: {
            where: {
              isActive: true,
              status: 'ACTIVE',
            },
            select: {
              id: true,
              title: true,
              domain: true,
              type: true,
              price: true,
              durationInWeeks: true,
            },
          },
        },
        skip,
        take: limit,
      }),

      this.prisma.company.count({
        where,
      }),
    ]);

    return {
      companies,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }
}
