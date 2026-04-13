import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@Injectable()
export class EnrollmentService {
  constructor(private prisma: PrismaService) { }

  async enrollIntern(data: CreateEnrollmentDto, user: any) {
    const { internId, programId } = data

    const intern = await this.prisma.user.findFirst({
      where: {
        id: internId,
        role: "INTERN",
        companyId: user.companyId
      }
    })

    if (!intern) throw new BadRequestException("Intern Not Found!!")

    const program = await this.prisma.internshipProgram.findFirst({
      where: {
        id: programId,
        companyId: user.companyId
      }
    })

    if (!program) throw new BadRequestException("Program Not Found")

    const existing = await this.prisma.enrollment.findFirst({
      where: {
        internId,
        programId
      }
    });

    if (existing) throw new BadRequestException("Intern already enrolled in this program");

    const paymentStatus =
      program.type === "FREE" ? "NOT_REQUIRED" : "PENDING";


    const enrollment = await this.prisma.enrollment.create({
      data: {
        internId,
        programId,
        mentorId: program.mentorId,
        paymentStatus,
      }
    })

    return {
      message: "Intern enrolled successfully",
      enrollment,
    };
  }

  async myEnrollments(user: any) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        internId: user.userId,
        program: {
          isActive: true
        }
      },
      include: {
        program: {
          select: {
            id: true,
            title: true,
            domain: true,
            durationInWeeks: true,
            status: true,
            type: true,
            startDate: true,
            endDate: true
          },
        },
        mentor: {
          select: {
            id: true,
            name: true,
            email: true
          },
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
    });

    return {
      enrollments
    };
  }

  async startInternship(enrollmentId: string, user: any) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId }
    })

    if (!enrollment) throw new NotFoundException("Enrollmet Not Found!")

    if (enrollment.internId !== user.userId) throw new ForbiddenException("Not Your Enrollment!")

    if (enrollment.status === 'IN_PROGRESS') throw new BadRequestException("Internship Already Started!")

    if (enrollment.paymentStatus === 'PENDING') throw new BadRequestException("Completed Payment First!")

    const updated = await this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        status: "IN_PROGRESS"
      }
    })

    return {
      message: 'Internship started successfully',
      enrollment: updated
    }
  }
}
