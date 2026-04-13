import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PerformanceService {
 
  constructor(private prisma: PrismaService) { }

  async getPerformance(enrollmentId: string, userId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        program: true
      }
    })

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    // Owernership Check
    if (enrollment.internId !== userId) throw new ForbiddenException("Access Denied!")

    // Status Check
    if (
      enrollment.status !== 'IN_PROGRESS' &&
      enrollment.status !== 'COMPLETED'
    ) {
      throw new BadRequestException(
        'Performance not available for this enrollment status'
      );
    }

    // Finding Task For this enrollment
    const tasks = await this.prisma.task.findMany({
      where: { enrollmentId },
      select: {
        score: true,
        status: true,
        reviewStatus: true,
        isLate: true
      }
    })

    const totalTasks = tasks.length
    const approvedTasks = tasks.filter(t => t.status === "APPROVED").length
    const rejectedTasks = tasks.filter(t => t.status === "REJECTED").length
    const submittedTasks = tasks.filter(t => t.status === "SUBMITTED").length
    const pendingTasks = tasks.filter(t => t.status === "PENDING").length
    const lateSubmissions = tasks.filter(t => t.isLate).length
    const reviewedTasks = tasks.filter(t => t.reviewStatus === "REVIEWED")

    const totalScore = reviewedTasks.reduce(
      (sum, t) => sum + (t.score ?? 0), 0
    )

    const averageScore = reviewedTasks.length > 0
      ? (totalScore / reviewedTasks.length).toFixed(2)
      : 0

    const completionPercentage =
      totalTasks > 0
        ? Number(((approvedTasks / totalTasks) * 100).toFixed(2))
        : 0

    let grade = "Fail"

    if (completionPercentage >= 85) grade = "A+"
    else if (completionPercentage >= 70) grade = "A"
    else if (completionPercentage >= 55) grade = "B";
    else if (completionPercentage >= 40) grade = "C";

    return {
      performance: {
        totalTasks, submittedTasks, approvedTasks, pendingTasks, rejectedTasks, lateSubmissions, averageScore, completionPercentage, grade
      },
      program: {
        id: enrollment.program.id,
        title: enrollment.program.title,
        domain: enrollment.program.domain
      }
    }
  }

}
