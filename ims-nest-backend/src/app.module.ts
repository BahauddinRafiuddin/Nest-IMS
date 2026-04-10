import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
import { UserModule } from './user/user.module';
import { ProgramModule } from './program/program.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { TaskModule } from './task/task.module';


@Module({
  imports: [PrismaModule, AuthModule, CompanyModule, UserModule, ProgramModule,EnrollmentModule,TaskModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),
    CompanyModule,
    UserModule,
    ProgramModule,
    EnrollmentModule,
    TaskModule,
  ],
})
export class AppModule { }
