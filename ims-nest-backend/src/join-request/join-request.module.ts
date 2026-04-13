import { Module } from '@nestjs/common';
import { JoinRequestController } from './join-request.controller';
import { JoinRequestService } from './join-request.service';

@Module({
  controllers: [JoinRequestController],
  providers: [JoinRequestService]
})
export class JoinRequestModule {}
