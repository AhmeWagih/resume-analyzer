import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Resume } from '../../resume/entities/resume.entity';

@Entity('analyses')
export class Analysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  jobDescription: string;

  @Column('jsonb')
  feedbackJson: Record<string, any>;

  @Column('int')
  atsScore: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => Resume, (resume) => resume.analysis, { onDelete: 'CASCADE' })
  @JoinColumn()
  resume: Resume;
}
