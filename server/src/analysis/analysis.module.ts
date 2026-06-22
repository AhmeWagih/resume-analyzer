import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Analysis } from './entities/analysis.entity';
import { AnalysisService } from './analysis.service';
import { AnalysisController } from './analysis.controller';
import { ResumeModule } from '../resume/resume.module';

@Module({
  imports: [TypeOrmModule.forFeature([Analysis]), ResumeModule],
  providers: [AnalysisService],
  controllers: [AnalysisController],
  exports: [AnalysisService],
})
export class AnalysisModule {}
