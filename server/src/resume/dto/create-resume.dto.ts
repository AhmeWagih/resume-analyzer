import { IsOptional, IsString } from 'class-validator';

export class CreateResumeDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;
}
