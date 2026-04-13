import { Module } from '@nestjs/common';
import { CertificateController } from './certificate.controller';
import { CertificateService } from './certificate.service';
import { PerformanceModule } from '../performance/performance.module';

@Module({
  imports:[PerformanceModule],
  controllers: [CertificateController],
  providers: [CertificateService]
})
export class CertificateModule {}
