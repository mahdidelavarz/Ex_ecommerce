// src/modules/attributes/attribute.service.ts
import { AttributeRepository } from './attribute.repository';
import {
  CreateAttributeDto,
  UpdateAttributeDto,
  CreateValueDto,
  UpdateValueDto,
  AttributeResponse,
  AttributeMinimal,
} from './attribute.types';

export class AttributeService {
  private repo = new AttributeRepository();

  async list(options: { search?: string; page?: number; limit?: number }) {
    const page = options.page || 1;
    const limit = options.limit || 50;

    const { data, total } = await this.repo.findAll({ ...options, page, limit });

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string): Promise<AttributeResponse> {
    return this.repo.findById(id) as unknown as AttributeResponse;
  }

  async getAllMinimal(): Promise<AttributeMinimal[]> {
    return this.repo.findAllMinimal() as unknown as AttributeMinimal[];
  }

  async create(dto: CreateAttributeDto): Promise<AttributeResponse> {
    return this.repo.create(dto) as unknown as AttributeResponse;
  }

  async update(id: string, dto: UpdateAttributeDto) {
    return this.repo.update(id, dto);
  }

  async delete(id: string) {
    return this.repo.delete(id);
  }

  async addValue(attributeId: string, dto: CreateValueDto) {
    return this.repo.addValue(attributeId, dto);
  }

  async updateValue(valueId: string, dto: UpdateValueDto) {
    return this.repo.updateValue(valueId, dto);
  }

  async deleteValue(valueId: string) {
    return this.repo.deleteValue(valueId);
  }
}