import { Module } from '@nestjs/common';
import { ProgramController } from './program.controller';
import { ProgramService } from './program.service';
import { ExportModule } from '../export/export.module';

@Module({
  imports:[ExportModule],
  controllers: [ProgramController],
  providers: [ProgramService]
})
export class ProgramModule {}

 




