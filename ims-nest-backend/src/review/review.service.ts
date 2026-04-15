import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PerspectiveService } from '../common/service/perspective.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    private prisma: PrismaService,
    private perspectiveService: PerspectiveService
  ) { }

  async createReview(userId: string, dto: CreateReviewDto) {
    const { rating, comment } = dto;

    //  1. Find completed enrollment
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        internId: userId,
        status: 'COMPLETED',
      },
      include: {
        program: true,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Completed enrollment not found');
    }

    //  2. Prevent duplicate review
    const existingReview = await this.prisma.review.findUnique({
      where: {
        enrollmentId: enrollment.id,
      },
    });

    if (existingReview) {
      throw new BadRequestException('Review already submitted');
    }

    //  3. AI moderation
    let reviewStatus: any = 'ACCEPTED'; // match enum

    if (comment) {
      const scores = await this.perspectiveService.analyzeComment(comment);

      if (scores) {
        const toxicity = scores.TOXICITY.summaryScore.value;
        const insult = scores.INSULT.summaryScore.value;
        const profanity = scores.PROFANITY.summaryScore.value;
        const threat = scores.THREAT.summaryScore.value;
        const identityAttack = scores.IDENTITY_ATTACK.summaryScore.value;

        if (
          toxicity > 0.7 ||
          insult > 0.7 ||
          profanity > 0.7 ||
          threat > 0.6 ||
          identityAttack > 0.7
        ) {
          reviewStatus = 'PENDING';
        }
      } else {
        reviewStatus = 'PENDING';
      }
    }

    //  4. Create review
    await this.prisma.review.create({
      data: {
        internId: userId,
        companyId: enrollment.program.companyId,
        programId: enrollment.programId,
        enrollmentId: enrollment.id,
        rating,
        comment,
        status: reviewStatus,
      },
    });

    return {
      success: true,
      message:
        reviewStatus === 'ACCEPTED'
          ? 'Review submitted successfully'
          : 'Your review is under admin review due to language check',
    };
  }

  //  Get My Review
  async getMyReview(userId: string) {
    const review = await this.prisma.review.findFirst({
      where: {
        internId: userId,
      },
      include: {
        intern: {
          select: { name: true },
        },
        program: {
          select: { title: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      review,
    };
  }

  // Company Review
  async getCompanyReviews(
  companyId: string,
  page = 1,
  limit = 5,
  rating?: number
) {
  const skip = (page - 1) * limit;

  const where: any = {
    companyId,
    status: 'ACCEPTED', 
  };

  if (rating !== undefined) {
    where.rating = {
      gte: rating,
    };
  }

  const [reviews, total] = await this.prisma.$transaction([
    this.prisma.review.findMany({
      where,
      include: {
        intern: { select: { name: true } },
        program: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    this.prisma.review.count({ where }),
  ]);

  return {
    success: true,
    reviews,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

  // Super Admin Can see Pening reviews
  async getPendingReviews(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where: {
          status: 'PENDING',
        },
        include: {
          intern: { select: { name: true, email: true } },
          program: { select: { title: true } },
          company: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({
        where: { status: 'PENDING' },
      }),
    ]);

    return {
      success: true,
      reviews,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Super Admin Can approve or reject review
  async updateReviewStatus(
    reviewId: string,
    status: 'ACCEPTED' | 'REJECTED'
  ) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    await this.prisma.review.update({
      where: { id: reviewId },
      data: { status },
    });

    return {
      success: true,
      message: `Review ${status.toLowerCase()} successfully`,
    };
  }
}
