import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { ResumeService } from './resume.service';

@Controller('resumes')
@UseGuards(JwtGuard)
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/pdfs',
        filename: (_req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowedMimes = ['application/pdf', 'application/x-pdf'];
        const isPdfExt = extname(file.originalname).toLowerCase() === '.pdf';
        if (!allowedMimes.includes(file.mimetype) && !isPdfExt) {
          return cb(
            new BadRequestException('Only PDF files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('PDF file is required');
    }
    return this.resumeService.create(file, req.user.id);
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.resumeService.findAllByUser(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.resumeService.findOneByUser(id, req.user.id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    await this.resumeService.delete(id, req.user.id);
    return { message: 'Resume deleted successfully' };
  }

  @Patch(':id/preview')
  async updatePreview(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('previewPath') previewPath: string,
    @Req() req: any,
  ) {
    await this.resumeService.findOneByUser(id, req.user.id);
    return this.resumeService.updatePreviewPath(id, previewPath);
  }
}
