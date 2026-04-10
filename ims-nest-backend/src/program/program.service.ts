import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProgramDto } from './dto/create-program.dto';
import { PrismaService } from '../prisma/prisma.service';

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

  async getPrograms(user: any) {
    return this.prisma.internshipProgram.findMany({
      where: {
        companyId: user.companyId
      }
    })
  }
}
