import { Entity, Column, Unique, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('review_helpful_votes')
@Unique(['review_id', 'user_id'])
export class ReviewHelpfulVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  review_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
