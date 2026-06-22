import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Analysis } from './entities/analysis.entity';
import { ResumeService } from '../resume/resume.service';
import Groq from 'groq-sdk';
import * as fs from 'fs';
import * as path from 'path';
const pdfParse = require('pdf-parse');

@Injectable()
export class AnalysisService {
  private readonly groq: Groq;
  private readonly uploadsPath: string;

  constructor(
    @InjectRepository(Analysis)
    private readonly analysisRepository: Repository<Analysis>,
    private readonly resumeService: ResumeService,
    private readonly configService: ConfigService,
  ) {
    this.groq = new Groq({
      apiKey: this.configService.get<string>('GROQ_API_KEY') || 'missing_api_key',
    });
    this.uploadsPath = this.configService.get<string>(
      'UPLOADS_PATH',
      './uploads',
    );
  }

  async create(
    resumeId: string,
    jobDescription: string,
    userId: string,
  ): Promise<Analysis> {
    // Verify ownership
    const resume = await this.resumeService.findOneByUser(resumeId, userId);

    // Check if analysis already exists
    const existing = await this.analysisRepository.findOne({
      where: { resume: { id: resumeId } },
    });
    if (existing) {
      // Update existing analysis
      await this.analysisRepository.remove(existing);
    }

    // Read PDF from disk
    const pdfFilePath = path.join(this.uploadsPath, 'pdfs', resume.pdfPath);
    if (!fs.existsSync(pdfFilePath)) {
      throw new NotFoundException('PDF file not found on disk');
    }
    const pdfBuffer = fs.readFileSync(pdfFilePath);
    
    // Extract text from PDF
    let resumeText = '';
    try {
      const data = await pdfParse(pdfBuffer);
      resumeText = data.text;
    } catch (err) {
      throw new InternalServerErrorException('Failed to extract text from PDF');
    }

    // Build prompt
    const prompt = `You are an expert resume analyst and ATS optimization specialist.
Analyze the provided resume against the job description below.

CRITICAL SCORING INSTRUCTIONS:
- Be extremely strict and accurate. Do NOT default to a generic score like 85.
- The atsScore MUST reflect the exact percentage of required skills and keywords from the job description that are present in the resume.
- If the resume is completely unrelated to the job, the score MUST be below 30.
- If the resume is a perfect match, it can be 90+. 

Job Description:
${jobDescription}

Resume Content:
${resumeText}

Return ONLY a valid JSON object with exactly this structure, no markdown, no explanation:
{
  "atsScore": number (0-100),
  "overallScore": number (0-100),
  "tone": {
    "score": number (0-100),
    "summary": string,
    "suggestions": string[]
  },
  "content": {
    "score": number (0-100),
    "summary": string,
    "suggestions": string[]
  },
  "structure": {
    "score": number (0-100),
    "summary": string,
    "suggestions": string[]
  },
  "skills": {
    "matched": string[],
    "missing": string[],
    "suggestions": string[]
  },
  "ats": {
    "score": number (0-100),
    "issues": string[],
    "suggestions": string[]
  }
}`;

    // Call Groq
    const completion = await this.groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || '';

    // Parse JSON safely — strip markdown fences if present
    let feedbackJson: Record<string, any>;
    try {
      let cleanedResponse = responseText.trim();
      // Strip markdown code fences
      if (cleanedResponse.startsWith('\`\`\`')) {
        cleanedResponse = cleanedResponse
          .replace(/^\`\`\`(?:json)?\s*\n?/, '')
          .replace(/\n?\s*\`\`\`$/, '');
      }
      feedbackJson = JSON.parse(cleanedResponse);
    } catch {
      throw new InternalServerErrorException(
        'Failed to parse AI response as JSON',
      );
    }

    const atsScore =
      typeof feedbackJson.atsScore === 'number' ? feedbackJson.atsScore : 0;

    // Save analysis
    const analysis = this.analysisRepository.create({
      jobDescription,
      feedbackJson,
      atsScore,
      resume: { id: resumeId },
    });

    return this.analysisRepository.save(analysis);
  }

  async findByResumeId(resumeId: string, userId: string): Promise<Analysis> {
    // Verify ownership
    await this.resumeService.findOneByUser(resumeId, userId);

    const analysis = await this.analysisRepository.findOne({
      where: { resume: { id: resumeId } },
      relations: { resume: true },
    });

    if (!analysis) {
      throw new NotFoundException('Analysis not found for this resume');
    }

    return analysis;
  }
}
