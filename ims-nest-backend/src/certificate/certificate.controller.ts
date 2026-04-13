import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import type { Response } from 'express';

@Controller('certificate')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CertificateController {
  constructor(private certificateService: CertificateService) { }

  @Get('/eligibility/:id')
  @Roles("INTERN")
  checkEligibility(
    @Param('id') id: string,
    @GetUser() user: any
  ) {
    return this.certificateService.checkEligibility(
      id,
      user.userId
    );
  }

  @Get('/download/:id')
  @Roles('INTERN')
  downloadCertificate(
    @Param('id') id: string,
    @GetUser() user: any,
    @Res() res: Response
  ) {
    return this.certificateService.downloadCertificate(
      id,
      user.userId,
      res
    );
  }

}
