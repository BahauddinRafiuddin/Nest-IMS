import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnrollmentStatus } from '@prisma/client';
import { PerformanceService } from '../performance/performance.service';
import PDFDocument from 'pdfkit';
import { Response } from 'express';

@Injectable()
export class CertificateService {
  constructor(private prisma: PrismaService, private performanceService: PerformanceService) { }

  async checkEligibility(enrollmentId: string, userId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include:{
        program:true
      }
    })

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    //  Only intern can check
    if (enrollment.internId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    //  Must be completed
    if (enrollment.status !== EnrollmentStatus.COMPLETED) {
      return {
        eligible: false,
        reason: 'Internship not completed yet',
      }
    }

    //  Get performance
    const performance = await this.performanceService.getPerformance(
      enrollmentId,
      userId
    )

    //  At least 1 submitted task
    if (
      performance.performance.approvedTasks <
      enrollment.program.minimumTasksRequired
    ) {
      return {
        eligible: false,
        reason: `Minimum ${enrollment.program.minimumTasksRequired} approved tasks required`,
      };
    }
    //  Completion %
    if (performance.performance.completionPercentage < 45) {
      return {
        eligible: false,
        reason: 'Minimum 45% completion required',
      }
    }

    //  Grade
    if (performance.performance.grade === 'Fail') {
      return {
        eligible: false,
        reason: 'Grade is Fail',
      }
    }

    return {
      eligible: true,
      message: 'Eligible for certificate',
    }
  }

  async downloadCertificate(
    enrollmentId: string,
    userId: string,
    res: Response
  ) {
    const eligibility = await this.checkEligibility(
      enrollmentId,
      userId
    );

    if (!eligibility.eligible) {
      throw new BadRequestException(eligibility.reason);
    }

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        program: {
          include: {
            company: true
          }
        },
        intern: true,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    // 📄 Create PDF
    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=certificate.pdf`
    );

    doc.pipe(res);

    // 🎓 Content
    doc.fontSize(25).text('Internship Certificate', {
      align: 'center',
    });

    doc.moveDown();

    doc.fontSize(16).text(
      `This is to certify that ${enrollment.intern.name}`
    );

    doc.moveDown();

    doc.text(
      `has successfully completed the internship in ${enrollment.program.title}`
    );

    doc.moveDown();

    doc.text(
      `at ${enrollment.program.company.name || 'Company'}`
    );

    doc.moveDown();

    doc.text(`Completion Date: ${new Date().toDateString()}`);

    doc.end();
  }
}
