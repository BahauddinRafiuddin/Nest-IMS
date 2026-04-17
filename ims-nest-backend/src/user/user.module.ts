import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CommonModule } from '../common/common.module';
import { ExportModule } from '../export/export.module';

@Module({
  imports:[CommonModule,ExportModule],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
