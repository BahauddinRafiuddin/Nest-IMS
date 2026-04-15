import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { generateTempPassword } from '../common/utils/createTemp-pass';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../common/service/email.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private emailService: EmailService) { }

  // Admin Create Interns and mentor
  async createUser(data: CreateUserDto, user: any, role: "INTERN" | "MENTOR") {
    const { name, email } = data;

    const existing = await this.prisma.user.findFirst({
      where: { email },
    });

    if (existing) {
      throw new BadRequestException("User With This Email Already Exists !!");
    }

    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        companyId: user.companyId,
        isActive: true,
      },
    });

    try {
      await this.emailService.sendEmail(
        email,
        `${role} Account Created`,
        `
        <h2>Welcome to IMS Platform</h2>
        <p>Your ${role.toLowerCase()} account has been created.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${tempPassword}</p>
        <p>Please change your password after first login.</p>
      `
      );
    } catch (error) {
      console.error("Email failed:", error);
    }

    return {
      message: `${role} Created Successfully`,
      credentials: {
        email,
        password: tempPassword,
      },
    };
  }

  // User Profile
  async getMyProfile(userId: string) {
    const profile = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: {
          select: {
            name: true,
            email: true,
            address: true,
            phone: true
          }
        }
      }
    })

    return {
      message: "Profile Fetch successfully",
      profile
    }
  }

  // Get Available Mentor for program creation
  async getAvailableMentor(companyId: string) {
    const mentors = await this.prisma.user.findMany({
      where: {
        role: "MENTOR",
        companyId
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    return {
      mentors
    }
  }

  // Get Available Interns For Enrollments
  async getAvailableInterns(companyId: string) {

    // 1. Get all interns of company
    const interns = await this.prisma.user.findMany({
      where: {
        role: "INTERN",
        companyId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // 2. Get enrollments of active/upcoming programs
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        status: {
          in: ["APPROVED", "IN_PROGRESS", "COMPLETED"],
        },
        program: {
          companyId,
          status: {
            in: ["UPCOMING", "ACTIVE"],
          },
        },
      },
      select: {
        internId: true,
      },
    });

    // 3. Extract enrolled intern IDs
    const enrolledInternIds = new Set(
      enrollments.map((e) => e.internId)
    );

    // 4. Filter available interns
    const availableInterns = interns.filter(
      (intern) => !enrolledInternIds.has(intern.id)
    );

    return {
      interns: availableInterns,
    };
  }

  // Get All Interns
  async getAllInterns(
    companyId: string,
    page: number,
    limit: number,
    search?: string
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      companyId,
      role: "INTERN",
      ...(search && {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
        ],
      }),
    };

    //  total count
    const total = await this.prisma.user.count({ where });

    //  fetch interns
    const interns = await this.prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
    });

    const internIds = interns.map((i) => i.id);

    // fetch enrollments with mentor
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        internId: { in: internIds },
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    //  create map (important optimization)
    const enrollmentMap = new Map();

    enrollments.forEach((e) => {
      enrollmentMap.set(e.internId, {
        mentor: e.mentor || null,
        status: e.status,
      });
    });

    //  final response mapping
    const finalInterns = interns.map((i) => ({
      ...i,
      mentor: enrollmentMap.get(i.id)?.mentor || null,
      enrollmentStatus: enrollmentMap.get(i.id)?.status || null,
    }));

    return {
      success: true,
      interns: finalInterns,
      totalPages: Math.ceil(total / limit),
      total,
      currentPage: page,
    };
  }

  // Get All Mentors
  async getAllMentors(
    companyId: string,
    page: number,
    limit: number,
    search?: string
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      companyId,
      role: "MENTOR",
      ...(search && {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
        ],
      }),
    };

    //  total count
    const total = await this.prisma.user.count({ where });

    //  get mentors
    const mentors = await this.prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
    });

    const mentorIds = mentors.map((m) => m.id);

    //  fetch enrollments for these mentors
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        mentorId: { in: mentorIds },
      },
      select: {
        mentorId: true,
        status: true,
      },
    });

    //  stats calculation
    const mentorStats = new Map();

    enrollments.forEach((e) => {
      if (!mentorStats.has(e.mentorId)) {
        mentorStats.set(e.mentorId, {
          total: 0,
          active: 0,
          completed: 0,
        });
      }

      const stats = mentorStats.get(e.mentorId);

      stats.total += 1;

      if (["IN_PROGRESS", "APPROVED"].includes(e.status)) {
        stats.active += 1;
      }

      if (e.status === "COMPLETED") {
        stats.completed += 1;
      }
    });

    //  final response
    const finalMentors = mentors.map((m) => ({
      ...m,
      internCount: mentorStats.get(m.id)?.total || 0,
      activeInternships: mentorStats.get(m.id)?.active || 0,
      completedInternships: mentorStats.get(m.id)?.completed || 0,
    }));

    return {
      success: true,
      mentors: finalMentors,
      totalPages: Math.ceil(total / limit),
      total,
      currentPage: page,
    };
  }

  async updateInternStatus(
  internId: string,
  isActive: boolean,
  companyId: string
) {

  // find intern
  const intern = await this.prisma.user.findUnique({
    where: { id: internId },
  });

  if (!intern || intern.role !== 'INTERN') {
    throw new NotFoundException('Intern Not Found');
  }

  // check company ownership
  if (intern.companyId !== companyId) {
    throw new ForbiddenException('Unauthorized');
  }

  // update status
  await this.prisma.user.update({
    where: { id: internId },
    data: {
      isActive,
    },
  });

  return {
    success: true,
    message: `${intern.name} ${isActive ? 'Activated' : 'Deactivated'}`,
  };
}
}
