import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resume } from './entities/resume.entity';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ResumeService {
  private readonly uploadsPath: string;

  constructor(
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
    private readonly configService: ConfigService,
  ) {
    this.uploadsPath = this.configService.get<string>(
      'UPLOADS_PATH',
      './uploads',
    );
  }

  async create(
    file: Express.Multer.File,
    userId: string,
  ): Promise<Resume> {
    const resume = this.resumeRepository.create({
      originalName: file.originalname,
      pdfPath: file.filename,
      user: { id: userId },
    });
    return this.resumeRepository.save(resume);
  }

  async findAllByUser(userId: string): Promise<Resume[]> {
    return this.resumeRepository.find({
      where: { user: { id: userId } },
      relations: { analysis: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneByUser(id: string, userId: string): Promise<Resume> {
    const resume = await this.resumeRepository.findOne({
      where: { id },
      relations: { user: true, analysis: true },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    if (resume.user.id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return resume;
  }

  async delete(id: string, userId: string): Promise<void> {
    const resume = await this.findOneByUser(id, userId);

    // Delete physical PDF file
    const pdfFilePath = path.join(this.uploadsPath, 'pdfs', resume.pdfPath);
    if (fs.existsSync(pdfFilePath)) {
      fs.unlinkSync(pdfFilePath);
    }

    // Delete preview image if exists
    if (resume.previewPath) {
      const previewFilePath = path.join(
        this.uploadsPath,
        'previews',
        resume.previewPath,
      );
      if (fs.existsSync(previewFilePath)) {
        fs.unlinkSync(previewFilePath);
      }
    }

    await this.resumeRepository.remove(resume);
  }

  async updatePreviewPath(id: string, previewPath: string): Promise<Resume> {
    const resume = await this.resumeRepository.findOne({ where: { id } });
    if (!resume) {
      throw new NotFoundException('Resume not found');
    }
    resume.previewPath = previewPath;
    return this.resumeRepository.save(resume);
  }
}
