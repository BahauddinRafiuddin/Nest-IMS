import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendJoinrequestDto } from './dto/send-joinrequest.dto';
import { ReviewJoinrequestDto } from './dto/review-joinrequest.dto';
import { EmailService } from '../common/service/email.service';

@Injectable()
export class JoinRequestService {
  constructor(private prisma: PrismaService, private emailService: EmailService) { }

  // Public user can send join request
  async sendJoinRequest(userId: string, dto: SendJoinrequestDto) {
    const { companyId, programId, message } = dto;

    //  Check duplicate request
    const existing = await this.prisma.joinRequest.findFirst({
      where: {
        userId,
        companyId,
        status: {
          in: ['PENDING', 'ACCEPTED'],
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Request already exists for this company'
      );
    }

    //  Create request
    const request = await this.prisma.joinRequest.create({
      data: {
        userId,
        companyId,
        programId: programId || null,
        message,
        status: 'PENDING',
      },
    });

    return {
      message: 'Join request sent successfully',
      request,
    };
  }

  // Comapany admin can see incomming requests
  async getJoinRequests(
    companyId: string,
    page: number,
    limit: number
  ) {
    const skip = (page - 1) * limit;

    //  Step 1: users already accepted
    const acceptedUsers = await this.prisma.joinRequest.findMany({
      where: {
        status: "ACCEPTED",
      },
      select: {
        userId: true,
      },
    });

    const acceptedUserIds = acceptedUsers.map((u) => u.userId);

    //  Step 2: WHERE condition (reuse for count + data)
    const where = {
      companyId,
      userId: {
        notIn: acceptedUserIds,
      },
    };

    //  Step 3: total count
    const total = await this.prisma.joinRequest.count({
      where,
    });

    //  Step 4: fetch paginated data
    const requests = await this.prisma.joinRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        program: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    //  Final response
    return {
      success: true,
      requests,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  // Public user join requests
  async getPublicUserJoinRequests(user: any) {
    const requests = await this.prisma.joinRequest.findMany({
      where: { userId: user.userId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        program: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return { requests }
  }

  // Admin can Accpet or reject join request

  async reviewJoinRequest(
    id: string,
    user: any,
    body: ReviewJoinrequestDto
  ) {
    const { action } = body;

    //  1. Find request
    const request = await this.prisma.joinRequest.findFirst({
      where: {
        id,
        companyId: user.companyId,
      },
    });

    if (!request) {
      throw new NotFoundException("Request not found");
    }

    if (request.status !== "PENDING") {
      throw new BadRequestException("Already reviewed");
    }

    //  2. Check if already accepted in another company
    const alreadyJoinInOtherCompany =
      await this.prisma.joinRequest.findFirst({
        where: {
          userId: request.userId,
          status: "ACCEPTED",
          companyId: { not: user.companyId },
        },
      });

    if (alreadyJoinInOtherCompany) {
      throw new BadRequestException(
        "User already accepted in another company"
      );
    }

    //  3. Update request
    await this.prisma.joinRequest.update({
      where: { id },
      data: {
        status: action,
        reviewedById: user.userId,
        reviewedAt: new Date(),
      },
    });

    //  4. If ACCEPTED → promote user + enrollment + email
    if (action === "ACCEPTED") {
      //  Update user
      await this.prisma.user.update({
        where: { id: request.userId },
        data: {
          role: "INTERN",
          companyId: request.companyId,
          isActive: true,
        },
      });

      let programMsg = "";

      //  If program exists → enroll
      if (request.programId) {
        const program = await this.prisma.internshipProgram.findFirst({
          where: {
            id: request.programId,
            companyId: user.companyId,
          },
        });

        if (!program) {
          throw new BadRequestException(
            "Program not found in your company"
          );
        }

        await this.prisma.enrollment.create({
          data: {
            internId: request.userId,
            programId: program.id,
            mentorId: program.mentorId,
            paymentStatus:
              program.type === "FREE" ? "NOT_REQUIRED" : "PENDING",
          },
        });

        programMsg = `You have been enrolled in ${program.title}`;
      }

      //  Send email
      const userData = await this.prisma.user.findUnique({
        where: { id: request.userId },
        select: { email: true, name: true },
      });

      try {
        await this.emailService.sendEmail(
          userData!.email,
          "You've been accepted!",
          `
        <h2>Welcome, ${userData!.name}!</h2>
        <p>Your request has been accepted.</p>
        <p>You can now access your intern dashboard.</p>
        <b>${programMsg}</b>
        `
        );
      } catch (err) {
        console.error("Email failed:", err);
      }
    }

    return {
      success: true,
      status: action,
    };
  }
}
