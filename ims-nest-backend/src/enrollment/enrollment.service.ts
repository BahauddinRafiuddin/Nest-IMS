import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { EnrollmentStatus } from '@prisma/client';
import { PerformanceService } from '../performance/performance.service';

@Injectable()
export class EnrollmentService {
  constructor(private prisma: PrismaService, private performanceService: PerformanceService) { }

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

  async getInternEnrollments(user: any) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        internId: user.userId
      },
      include: {
        program: {
          select: {
            id:true,
            title: true,
            domain: true,
            description: true,
            type: true,
            price: true,
            durationInWeeks: true,
            startDate: true,
            endDate: true,
          }
        },
        mentor: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    })

    const validEnrollments = enrollments.filter(
      (e) => e.program !== null
    )

    return {
      success: true,
      enrollment: validEnrollments
    };
  }

  async getMentorEnrollments(user: any, page=1, limit=1) {
    const skip = (page - 1) * limit
    const programs = await this.prisma.internshipProgram.findMany({
      where: {
        mentorId: user.userId,
        companyId: user.companyId
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    })

    const total = await this.prisma.internshipProgram.count({
      where: {
        mentorId: user.userId,
        companyId: user.companyId
      }
    })

    const programsWithInterns = await Promise.all(
      programs.map(async (program) => {
        const enrollments = await this.prisma.enrollment.findMany({
          where: {
            programId: program.id,
            mentorId: user.userId,
            status: "IN_PROGRESS"
          },
          include: {
            intern: {
              select: {
                id:true,
                name: true,
                email: true
              }
            }
          }
        })

        return {
          ...program,
          interns: enrollments
        }
      })
    )

    return {
      success: true,
      message: "Mentor Programs Found Successfully",
      programs: programsWithInterns,
      totalPages: Math.ceil(total / limit),
      total
    }
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

  async completeInternship(enrollmentId: string, user: any) {

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        program: true,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    //  Mentor ownership check
    if (enrollment.mentorId !== user.userId) {
      throw new ForbiddenException('Not assigned mentor');
    }

    //  Status check
    if (enrollment.status !== EnrollmentStatus.IN_PROGRESS) {
      throw new BadRequestException('Internship not in progress');
    }
    if (
      enrollment.status !== EnrollmentStatus.IN_PROGRESS &&
      enrollment.status !== EnrollmentStatus.COMPLETED
    ) {
      throw new BadRequestException('Invalid status');
    }

    //  Get performance (REUSE)
    const performance = await this.performanceService.getPerformance(
      enrollmentId,
      enrollment.internId
    );

    //  Minimum tasks rule
    if (
      performance.performance.approvedTasks <
      enrollment.program.minimumTasksRequired
    ) {
      throw new BadRequestException(
        `Minimum ${enrollment.program.minimumTasksRequired} approved tasks required`
      );
    }

    //  Completion rule
    if (performance.performance.completionPercentage < 45) {
      throw new BadRequestException(
        'Minimum 45% completion required'
      );
    }

    // Grade rule
    if (performance.performance.grade === 'Fail') {
      throw new BadRequestException(
        'Intern has failed. Cannot complete internship'
      );
    }

    //  Update enrollment
    await this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return {
      message: 'Internship marked as completed',
    };
  }

  async getMentorInterns(mentorId: any, page=1, limit=1) {
    const skip = (page - 1) * limit
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        mentorId,
        status: {
          in: ["APPROVED", "IN_PROGRESS"]
        }
      },
      include: {
        intern: {
          select: {
            id:true,
            name: true,
            email: true
          }
        },
        program: {
          select: {
            id:true,
            title: true,
            domain: true,
            durationInWeeks: true,
            startDate: true,
            endDate: true,
            status: true,
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      }
    })

    const total = await this.prisma.enrollment.count({
      where: {
        mentorId,
        status: {
          in: ["APPROVED", "IN_PROGRESS"]
        }
      }
    })

    return {
      success: true,
      interns: enrollments,
      total,
      totalPages: Math.ceil(total / limit),
    }
  }
}
