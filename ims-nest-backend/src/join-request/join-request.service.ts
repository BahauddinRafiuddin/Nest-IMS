import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendJoinrequestDto } from './dto/send-joinrequest.dto';

@Injectable()
export class JoinRequestService {
  constructor(private prisma: PrismaService) { }

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
  async getJoinRequests(companyId: string) {
    // Step 1: users already accepted
    const acceptedUsers = await this.prisma.joinRequest.findMany({
      where: {
        status: 'ACCEPTED',
      },
      select: {
        userId: true,
      },
    });

    const acceptedUserIds = acceptedUsers.map(u => u.userId);

    // Step 2: fetch requests
    const requests = await this.prisma.joinRequest.findMany({
      where: {
        companyId,
        userId: {
          notIn: acceptedUserIds,
        },
      },
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
        createdAt: 'desc',
      },
    });

    return {
      requests,
    };
  }

  // Public user join requests
  async getPublicUserJoinRequests(user:any){
    const requests=await this.prisma.joinRequest.findMany({
      where:{userId:user.userId},
      include:{
        company:{
          select:{
            id:true,
            name:true,
            email:true
          }
        },
        program:{
          select:{
            id:true,
            title:true
          }
        }
      },
      orderBy:{
        createdAt:'desc'
      }
    })

    return {requests}
  }

}
