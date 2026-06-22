import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { AnalysisService } from './analysis.service';
import { CreateAnalysisDto } from './dto/create-analysis.dto';

@Controller('analysis')
@UseGuards(JwtGuard)
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post(':resumeId')
  async create(
    @Param('resumeId', ParseUUIDPipe) resumeId: string,
    @Body() dto: CreateAnalysisDto,
    @Req() req: any,
  ) {
    return this.analysisService.create(resumeId, dto.jobDescription, req.user.id);
  }

  @Get(':resumeId')
  async findOne(
    @Param('resumeId', ParseUUIDPipe) resumeId: string,
    @Req() req: any,
  ) {
    return this.analysisService.findByResumeId(resumeId, req.user.id);
  }
}
