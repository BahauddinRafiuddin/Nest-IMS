import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports:[CommonModule],
  controllers: [CompanyController],
  providers: [CompanyService]
})
export class CompanyModule {}
