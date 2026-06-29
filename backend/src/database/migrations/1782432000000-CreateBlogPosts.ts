import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates the blog_posts table (public blog + admin management module).
 * Mirrors src/database/entities/blog-post.entity.ts.
 */
export class CreateBlogPosts1782432000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "blog_posts" (
        "id"              uuid        NOT NULL DEFAULT gen_random_uuid(),
        "title"           text        NOT NULL,
        "slug"            text        NOT NULL,
        "excerpt"         text,
        "content"         text        NOT NULL,
        "cover_image"     text,
        "tags"            text[]      NOT NULL DEFAULT '{}',
        "is_published"    boolean     NOT NULL DEFAULT false,
        "published_at"    timestamptz,
        "view_count"      integer     NOT NULL DEFAULT 0,
        "seo_title"       text,
        "seo_description" text,
        "seo_keywords"    text,
        "author_id"       uuid,
        "deleted_at"      timestamptz,
        "created_at"      timestamptz NOT NULL DEFAULT now(),
        "updated_at"      timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_blog_posts_id"   PRIMARY KEY ("id"),
        CONSTRAINT "UQ_blog_posts_slug" UNIQUE ("slug"),
        CONSTRAINT "FK_blog_posts_author_id" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_blog_posts_slug"         ON "blog_posts" ("slug")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_blog_posts_is_published" ON "blog_posts" ("is_published")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_blog_posts_author_id"    ON "blog_posts" ("author_id")`,
    );
    // GIN index supports the tag-overlap (&&) / ANY() filters used for
    // listing-by-tag and related-posts queries.
    await queryRunner.query(
      `CREATE INDEX "IDX_blog_posts_tags"         ON "blog_posts" USING GIN ("tags")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "blog_posts"`);
  }
}
