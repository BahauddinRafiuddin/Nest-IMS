import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { CommonModule } from '../common/common.module';
import { ExportModule } from '../export/export.module';

@Module({
  imports:[CommonModule,ExportModule],
  controllers: [CompanyController],
  providers: [CompanyService]
})
export class CompanyModule {}
