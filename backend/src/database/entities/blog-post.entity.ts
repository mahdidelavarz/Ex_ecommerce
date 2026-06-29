// src/database/entities/blog-post.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { User } from './user.entity';

@Entity('blog_posts')
export class BlogPost extends BaseEntity {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  excerpt: string | null;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  cover_image: string | null;

  @Column({ type: 'text', array: true, default: '{}' })
  @Index()
  tags: string[];

  @Column({ type: 'boolean', default: false })
  @Index()
  is_published: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  published_at: Date | null;

  @Column({ type: 'integer', default: 0 })
  view_count: number;

  @Column({ type: 'text', nullable: true })
  seo_title: string | null;

  @Column({ type: 'text', nullable: true })
  seo_description: string | null;

  @Column({ type: 'text', nullable: true })
  seo_keywords: string | null;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  author_id: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  deleted_at: Date | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'author_id' })
  author: User | null;
}
