import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JoinRequestService } from './join-request.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { SendJoinrequestDto } from './dto/send-joinrequest.dto';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('join-request')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JoinRequestController {
  constructor(private joinRequestService: JoinRequestService) { }

  @Post('')
  @Roles(Role.PUBLIC_USER)
  sendJoinRequest(@Body() body: SendJoinrequestDto, @GetUser() user: any) {
    return this.joinRequestService.sendJoinRequest(user.userId, body)
  }

  @Get()
  @Roles(Role.ADMIN)
  getJoinRequests(@GetUser() user: any) {
    return this.joinRequestService.getJoinRequests(
      user.companyId
    );
  }
}
