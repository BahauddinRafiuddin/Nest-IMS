import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProgramDto } from './dto/create-program.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProgramDto } from './dto/update-program.dto';
import { ChangeProgramStatusDto } from './dto/change-status.dto';
import { EnrollmentStatus, ProgramStatus } from '@prisma/client';

@Injectable()
export class ProgramService {
  constructor(private prisma: PrismaService) { }

  async createProgram(data: CreateProgramDto, user: any) {
    const { mentorId, startDate, endDate } = data
    const mentor = await this.prisma.user.findFirst({
      where: {
        id: mentorId,
        role: "MENTOR",
        companyId: user.companyId
      }
    })

    if (!mentor) throw new BadRequestException("Invalid mentor for this company")

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      throw new BadRequestException("End date must be after start date");
    }

    const diffInMs = end.getTime() - start.getTime();
    const durationInWeeks = Math.ceil(diffInMs / (1000 * 60 * 60 * 24 * 7));

    const internshipProgram = await this.prisma.internshipProgram.create({
      data: {
        ...data,
        startDate: start,
        endDate: end,
        durationInWeeks,
        companyId: user.companyId
      }
    })

    return {
      message: "Program Created Successfully",
      internshipProgram,
    };
  }

  async getPrograms(
    companyId: string,
    page: number,
    limit: number,
    search?: string
  ) {
    const skip = (page - 1) * limit;

    //  Search filter
    const where: any = {
      companyId,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { domain: { contains: search, mode: 'insensitive' } },
          { status: { equals: search.toUpperCase() as any } }, // enum
        ],
      }),
    };

    //  Total count
    const total = await this.prisma.internshipProgram.count({
      where,
    });

    //  Data
    const programs = await this.prisma.internshipProgram.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    //  Transform response (important)
    const formatted = programs.map((p) => ({
      id: p.id,
      title: p.title,
      domain: p.domain,
      status: p.status,
      createdAt: p.createdAt,
      mentor: p.mentor,
      totalTasks: p._count.tasks,
    }));

    return {
      programs: formatted,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async updateProgram(
    programId: string,
    user: any,
    dto: UpdateProgramDto
  ) {
    const program = await this.prisma.internshipProgram.findUnique({
      where: { id: programId },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    //  Company ownership check
    if (program.companyId !== user.companyId) {
      throw new ForbiddenException('Unauthorized');
    }

    //  Completed program restriction
    if (program.status === 'COMPLETED') {
      throw new BadRequestException(
        'Completed program cannot be updated'
      );
    }

    //  Date logic
    const finalStart = dto.startDate
      ? new Date(dto.startDate)
      : program.startDate;

    const finalEnd = dto.endDate
      ? new Date(dto.endDate)
      : program.endDate;

    if (finalStart && finalEnd && finalEnd <= finalStart) {
      throw new BadRequestException(
        'End date must be after start date'
      );
    }

    //  Duration calculation
    let durationInWeeks = program.durationInWeeks;

    if (finalStart && finalEnd) {
      const diffTime = finalEnd.getTime() - finalStart.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      durationInWeeks = Math.ceil(diffDays / 7);
    }

    //  Update object (only changed fields)
    const updatedProgram = await this.prisma.internshipProgram.update({
      where: { id: programId },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.domain && { domain: dto.domain }),
        ...(dto.description && { description: dto.description }),
        ...(dto.rules && { rules: dto.rules }),
        ...(finalStart && { startDate: finalStart }),
        ...(finalEnd && { endDate: finalEnd }),
        durationInWeeks,
      },
    });

    return {
      message: 'Internship program updated successfully',
      program: updatedProgram,
    };
  }

  async changeProgramStatus(
    programId: string,
    user: any,
    dto: ChangeProgramStatusDto
  ) {
    const { changedStatus } = dto;

    const program = await this.prisma.internshipProgram.findUnique({
      where: { id: programId },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    //  Company ownership
    if (program.companyId !== user.companyId) {
      throw new ForbiddenException('Unauthorized');
    }

    const currentStatus = program.status;

    //  Completed cannot change
    if (currentStatus === ProgramStatus.COMPLETED) {
      throw new BadRequestException(
        'Completed program cannot be modified'
      );
    }

    // Prevent backward transitions
    if (
      currentStatus === ProgramStatus.ACTIVE &&
      changedStatus === ProgramStatus.UPCOMING
    ) {
      throw new BadRequestException(
        `Invalid transition from ${currentStatus} to ${changedStatus}`
      );
    }

    //  Count enrollments
    const activeEnrollments =
      await this.prisma.enrollment.count({
        where: {
          programId,
          status: {
            in: [
              EnrollmentStatus.APPROVED,
              EnrollmentStatus.IN_PROGRESS,
            ],
          },
        },
      });

    //  UPCOMING → ACTIVE
    if (
      currentStatus === ProgramStatus.UPCOMING &&
      changedStatus === ProgramStatus.ACTIVE
    ) {
      if (!program.mentorId) {
        throw new BadRequestException(
          'Mentor must be assigned before activation'
        );
      }

      if (activeEnrollments === 0) {
        throw new BadRequestException(
          'At least one enrollment required'
        );
      }

      await this.prisma.internshipProgram.update({
        where: { id: programId },
        data: { status: ProgramStatus.ACTIVE },
      });

      return {
        message: 'Internship program is now ACTIVE',
      };
    }

    //  ACTIVE → COMPLETED
    if (
      currentStatus === ProgramStatus.ACTIVE &&
      changedStatus === ProgramStatus.COMPLETED
    ) {
      await this.prisma.internshipProgram.update({
        where: { id: programId },
        data: { status: ProgramStatus.COMPLETED },
      });

      return {
        message: 'Internship program marked as COMPLETED',
      };
    }

    throw new BadRequestException(
      `Invalid transition from ${currentStatus} to ${changedStatus}`
    );
  }
}
