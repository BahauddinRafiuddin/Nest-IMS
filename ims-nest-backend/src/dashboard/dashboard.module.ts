import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { ExportModule } from '../export/export.module';

@Module({
  imports:[ExportModule],
  controllers: [DashboardController],
  providers: [DashboardService]
})
export class DashboardModule {}
