import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Analysis } from '../../analysis/entities/analysis.entity';

@Entity('resumes')
export class Resume {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalName: string;

  @Column()
  pdfPath: string;

  @Column({ nullable: true })
  previewPath: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.resumes, { onDelete: 'CASCADE' })
  user: User;

  @OneToOne(() => Analysis, (analysis) => analysis.resume, { cascade: true })
  analysis: Analysis;
}
