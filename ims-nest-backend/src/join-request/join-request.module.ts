import { Module } from '@nestjs/common';
import { JoinRequestController } from './join-request.controller';
import { JoinRequestService } from './join-request.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports:[CommonModule],
  controllers: [JoinRequestController],
  providers: [JoinRequestService]
})
export class JoinRequestModule {}
