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
      grade:performance.performance.grade,
      completionPercentage:performance.performance.completionPercentage,
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
    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Certificate-${enrollment.intern.name.replace(/\s+/g, '_')}.pdf`);
    doc.pipe(res);

    const width = doc.page.width;
    const height = doc.page.height;

    // ================= SETTINGS =================
    const primaryColor = "#1A237E";
    const secondaryColor = "#C5A059";
    const textColor = "#2C3E50";

    // NOTE: Convert your logo.svg to logo.png. PDFKit does not support SVG out of the box.
    // const logoPath = path.join(__dirname, '../../../client/public/logo.png');

    // ================= BACKGROUND & BORDERS =================
    doc.rect(0, 0, width, height).fill("#FFFFFF");

    // Thick Primary Border
    doc.lineWidth(20).strokeColor(primaryColor).rect(10, 10, width - 20, height - 20).stroke();
    // Thin Gold Accent Border
    doc.lineWidth(1.5).strokeColor(secondaryColor).rect(30, 30, width - 60, height - 60).stroke();

    // ================= LOGO SECTION =================
    try {
      // PDFKit needs PNG/JPG. If using SVG, you'd need the 'svg-to-pdfkit' library.
      // doc.image(logoPath, width / 2 - 50, 50, { width: 80 });
    } catch (e) {
      doc.fillColor(primaryColor).font("Helvetica-Bold").fontSize(22).text("IMS ACADEMY", 0, 70, { align: "center" });
    }

    // ================= MAIN CONTENT =================
    // Title
    doc.font("Helvetica-Bold").fontSize(42).fillColor(primaryColor)
      .text("CERTIFICATE OF COMPLETION", 0, 170, { align: "center", characterSpacing: 1 });

    // Sub-text
    doc.font("Helvetica").fontSize(16).fillColor(textColor)
      .text("THIS IS TO CERTIFY THAT", 0, 230, { align: "center" });

    // Intern Name
    doc.font("Times-BoldItalic").fontSize(52).fillColor(secondaryColor)
      .text(enrollment.intern.name, 0, 265, { align: "center" });

    // Description
    doc.font("Helvetica").fontSize(16).fillColor(textColor)
      .text("has successfully completed the intensive internship program in", 0, 340, { align: "center" });

    // Program Title
    doc.font("Helvetica-Bold").fontSize(24).fillColor(primaryColor)
      .text(`${enrollment.program.title}`, 0, 375, { align: "center" });

    // Grade
    doc.font("Helvetica-Oblique").fontSize(15).fillColor(textColor)
      .text(`Achieving an exceptional overall grade of ${eligibility.grade}`, 0, 415, { align: "center" });

    // ================= FOOTER / SIGNATURES =================
    const footerY = height - 120;

    // Left Side: Date
    doc.font("Helvetica-Bold").fontSize(12).fillColor(textColor).text("DATE", 100, footerY - 15);
    doc.font("Helvetica").text(new Date().toLocaleDateString('en-GB'), 100, footerY + 5);

    // Right Side: Signature Line
    doc.lineWidth(1).strokeColor(textColor);
    doc.moveTo(width - 280, footerY).lineTo(width - 100, footerY).stroke();
    doc.font("Helvetica-Bold").fontSize(12).text("PROGRAM DIRECTOR", width - 280, footerY + 10, { width: 180, align: 'center' });

    // Center: Verification ID
    const certId = `IMS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    doc.fontSize(10).fillColor("#7F8C8D").text(`Verification ID: ${certId}`, 0, height - 50, { align: "center" });

    doc.end();
  }
}
