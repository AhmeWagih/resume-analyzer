import {
  Controller,
  Get,
  Post,
  Param,
  Res,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Controller('files')
export class FilesController {
  private readonly uploadsPath: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadsPath = this.configService.get<string>(
      'UPLOADS_PATH',
      './uploads',
    );
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/previews',
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname);
          const uniqueName = `${uuidv4()}${ext}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return {
      filename: file.filename,
      path: file.filename,
      originalName: file.originalname,
    };
  }

  @Get(':filename')
  async serveFile(@Param('filename') filename: string, @Res() res: Response) {
    // Sanitize filename to prevent directory traversal
    const sanitizedFilename = path.basename(filename);

    // Check in pdfs directory first, then previews
    const possiblePaths = [
      path.join(this.uploadsPath, 'pdfs', sanitizedFilename),
      path.join(this.uploadsPath, 'previews', sanitizedFilename),
    ];

    for (const filePath of possiblePaths) {
      const absolutePath = path.resolve(filePath);
      if (fs.existsSync(absolutePath)) {
        return res.sendFile(absolutePath);
      }
    }

    throw new NotFoundException('File not found');
  }
}
