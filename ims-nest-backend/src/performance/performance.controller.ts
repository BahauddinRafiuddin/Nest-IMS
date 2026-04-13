import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('performance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PerformanceController {
  constructor(private performanceService: PerformanceService) { }

  @Get('/my/:id')
  @Roles("INTERN")
  getInternPerformance(@Param("id") id: string, @GetUser() user: any) {
    return this.performanceService.getPerformance(id, user.userId)
  }
}
