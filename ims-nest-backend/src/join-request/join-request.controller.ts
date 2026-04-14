import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JoinRequestService } from './join-request.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { SendJoinrequestDto } from './dto/send-joinrequest.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ReviewJoinrequestDto } from './dto/review-joinrequest.dto';

@Controller('join-request')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JoinRequestController {
  constructor(private joinRequestService: JoinRequestService) { }

  // Public user can send Join requests
  @Post('')
  @Roles(Role.PUBLIC_USER)
  sendJoinRequest(@Body() body: SendJoinrequestDto, @GetUser() user: any) {
    return this.joinRequestService.sendJoinRequest(user.userId, body)
  }

  // Admin Can se Join requests
  @Get()
  @Roles(Role.ADMIN)
  getJoinRequests(@GetUser() user: any, @Query('page') page = 1, @Query('limit') limit = 5) {
    return this.joinRequestService.getJoinRequests(
      user.companyId, Number(page), Number(limit)
    );
  }

  // Public user Can See he's requests
  @Get('my')
  @Roles(Role.PUBLIC_USER)
  getPublicUserJoinRequest(@GetUser() user: any) {
    return this.joinRequestService.getPublicUserJoinRequests(user)
  }

  // Accpet or reject join request
  @Patch('/:id')
  @Roles(Role.ADMIN)
  reviewJoinRequest(@Param('id') id: string, @GetUser() user: any, @Body() body: ReviewJoinrequestDto) {
    return this.joinRequestService.reviewJoinRequest(id, user, body)
  }
}
