import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from '../common/decorators/get-user.decorator';
import { CreateReviewDto } from './dto/create-review.dto';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('review')
@UseGuards(JwtAuthGuard,RolesGuard)

export class ReviewController {
  constructor(private reviewService: ReviewService) { }
  @Post()
  @Roles(Role.INTERN)
  createReview(
    @GetUser() user: any,
    @Body() dto: CreateReviewDto
  ) {
    return this.reviewService.createReview(user.userId, dto);
  }

  @Get('my')
  @Roles(Role.INTERN)
  getMyReview(@GetUser() user: any) {
    return this.reviewService.getMyReview(user.userId);
  }

  @Get('company')
  @Roles(Role.ADMIN)
  getCompanyReviews(
    @GetUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('minRating') minRating ?: string
  ) {
    return this.reviewService.getCompanyReviews(
      user.companyId,
      Number(page) || 1,
      Number(limit) || 5,
      minRating  ? Number(minRating ) : undefined
    );
  }

  @Get('pending')
  @Roles(Role.SUPER_ADMIN)
  getPendingReviews(
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.reviewService.getPendingReviews(
      Number(page) || 1,
      Number(limit) || 10
    );
  }

  @Patch(':id/approve')
  @Roles(Role.SUPER_ADMIN)
  approveReview(@Param('id') id: string) {
    return this.reviewService.updateReviewStatus(id, 'ACCEPTED');
  }

  @Patch(':id/reject')
  @Roles(Role.SUPER_ADMIN)
  rejectReview(@Param('id') id: string) {
    return this.reviewService.updateReviewStatus(id, 'REJECTED');
  }
}
