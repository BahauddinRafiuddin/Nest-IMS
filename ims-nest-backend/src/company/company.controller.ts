import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateCompanyDto } from './dto/create-company.dto';
import { JwtAuthGuard } from '../common/guards/jwt.guard';

@Controller('company')
export class CompanyController {
  constructor(private companyService:CompanyService){}


  @Post()
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('SUPER_ADMIN')
  createCompany(@Body() body:CreateCompanyDto){
    return this.companyService.createCompany(body)
  }
}
