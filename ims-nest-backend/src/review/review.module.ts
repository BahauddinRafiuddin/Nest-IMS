import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { PerspectiveService } from '../common/service/perspective.service';

@Module({
  controllers: [ReviewController],
  providers: [ReviewService, PerspectiveService]
})
export class ReviewModule { }
