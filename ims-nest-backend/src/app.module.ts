import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
import { UserModule } from './user/user.module';
import { ProgramModule } from './program/program.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { TaskModule } from './task/task.module';
import { PerformanceModule } from './performance/performance.module';
import { CertificateModule } from './certificate/certificate.module';
import { PublicModule } from './public/public.module';
import { JoinRequestModule } from './join-request/join-request.module';
import { PaymentModule } from './payment/payment.module';
import { ReviewModule } from './review/review.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ChatbotModule } from './chatbot/chatbot.module';


@Module({
  imports: [PrismaModule, AuthModule, CompanyModule, UserModule, ProgramModule, EnrollmentModule, TaskModule, PerformanceModule, PublicModule, JoinRequestModule, PaymentModule,ReviewModule,DashboardModule,ChatbotModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),
    CompanyModule,
    UserModule,
    ProgramModule,
    EnrollmentModule,
    TaskModule,
    PerformanceModule,
    CertificateModule,
    PublicModule,
    JoinRequestModule,
    PaymentModule,
    ReviewModule,
    DashboardModule,
    ChatbotModule,
  ],
})
export class AppModule { }
