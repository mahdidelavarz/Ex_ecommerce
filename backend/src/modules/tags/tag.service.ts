// src/modules/tags/tag.service.ts
import { TagRepository } from './tag.repository';
import { CreateTagDto, UpdateTagDto, TagResponse } from './tag.types';

export class TagService {
  private repo = new TagRepository();

  async list(options: { search?: string; page?: number; limit?: number }) {
    const page = options.page || 1;
    const limit = options.limit || 50;
    const { data, total } = await this.repo.findAll({ ...options, page, limit });
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getAllMinimal() {
    return this.repo.findAllMinimal();
  }

  async getById(id: string): Promise<TagResponse> {
    return this.repo.findById(id) as unknown as TagResponse;
  }

  async create(dto: CreateTagDto) {
    return this.repo.create(dto);
  }

  async update(id: string, dto: UpdateTagDto) {
    return this.repo.update(id, dto);
  }

  async delete(id: string) {
    return this.repo.delete(id);
  }
}