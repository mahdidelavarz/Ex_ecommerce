// src/modules/attributes/attribute.repository.ts
import { AppDataSource } from '../../config/database';
import { Attribute } from '../../database/entities/attribute.entity';
import { AttributeValue } from '../../database/entities/attribute-value.entity';
import { VariantAttributeValue } from '../../database/entities/variant-attribute-value.entity';
import { NotFoundError, ConflictError, BadRequestError } from '../../shared/utils/errors';
import { CreateAttributeDto, UpdateAttributeDto, CreateValueDto, UpdateValueDto } from './attribute.types';

export class AttributeRepository {
  private repo = AppDataSource.getRepository(Attribute);
  private valueRepo = AppDataSource.getRepository(AttributeValue);
  private variantAttributeRepo = AppDataSource.getRepository(VariantAttributeValue);

  async findAll(options: { search?: string; page: number; limit: number }) {
    const qb = this.repo
      .createQueryBuilder('attribute')
      .leftJoinAndSelect('attribute.values', 'values')
      .loadRelationCountAndMap('attribute.values_count', 'attribute.values')
      .orderBy('attribute.created_at', 'DESC');

    if (options.search) {
      qb.andWhere('attribute.name ILIKE :search', { search: `%${options.search}%` });
    }

    qb.skip((options.page - 1) * options.limit);
    qb.take(options.limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total };
  }

  async findAllMinimal() {
    return this.repo.find({
      relations: ['values'],
      order: { name: 'ASC' },
    });
  }

  async findById(id: string) {
    const attribute = await this.repo.findOne({
      where: { id },
      relations: ['values'],
    });

    if (!attribute) {
      throw new NotFoundError('ویژگی مورد نظر یافت نشد');
    }

    return attribute;
  }

  async create(dto: CreateAttributeDto) {
    // Check duplicate name
    const existing = await this.repo.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictError('ویژگی با این نام قبلاً ثبت شده است');
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const attribute = this.repo.create({ name: dto.name });
      const savedAttribute = await queryRunner.manager.save(attribute);

      if (dto.values?.length) {
        const values = dto.values.map((v) =>
          this.valueRepo.create({
            attribute_id: savedAttribute.id,
            value: v.value,
            color_code: v.color_code || null,
          })
        );
        await queryRunner.manager.save(values);
      }

      await queryRunner.commitTransaction();
      return this.findById(savedAttribute.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, dto: UpdateAttributeDto) {
    const attribute = await this.repo.findOne({ where: { id } });
    if (!attribute) throw new NotFoundError('ویژگی یافت نشد');

    if (dto.name && dto.name !== attribute.name) {
      const existing = await this.repo.findOne({ where: { name: dto.name } });
      if (existing) throw new ConflictError('ویژگی با این نام قبلاً ثبت شده است');
    }

    Object.assign(attribute, dto);
    return this.repo.save(attribute);
  }

  async delete(id: string) {
    const attribute = await this.repo.findOne({
      where: { id },
      relations: ['values'],
    });

    if (!attribute) throw new NotFoundError('ویژگی یافت نشد');

    // Check if any value is used in variants
    if (attribute.values?.length) {
      const valueIds = attribute.values.map((v) => v.id);
      const usedCount = await this.variantAttributeRepo.count({
        where: { attribute_value_id: In(valueIds) },
      });

      if (usedCount > 0) {
        throw new BadRequestError('این ویژگی در محصولات استفاده شده و قابل حذف نیست');
      }

      // Delete values first
      await this.valueRepo.delete({ attribute_id: id });
    }

    await this.repo.remove(attribute);
  }

  // Value methods
  async addValue(attributeId: string, dto: CreateValueDto) {
    const attribute = await this.repo.findOne({ where: { id: attributeId } });
    if (!attribute) throw new NotFoundError('ویژگی یافت نشد');

    const value = this.valueRepo.create({
      attribute_id: attributeId,
      value: dto.value,
      color_code: dto.color_code || null,
    });

    return this.valueRepo.save(value);
  }

  async updateValue(valueId: string, dto: UpdateValueDto) {
    const value = await this.valueRepo.findOne({ where: { id: valueId } });
    if (!value) throw new NotFoundError('مقدار یافت نشد');

    Object.assign(value, dto);
    return this.valueRepo.save(value);
  }

  async deleteValue(valueId: string) {
    const value = await this.valueRepo.findOne({ where: { id: valueId } });
    if (!value) throw new NotFoundError('مقدار یافت نشد');

    const usedCount = await this.variantAttributeRepo.count({
      where: { attribute_value_id: valueId },
    });

    if (usedCount > 0) {
      throw new BadRequestError('این مقدار در محصولات استفاده شده و قابل حذف نیست');
    }

    await this.valueRepo.remove(value);
  }
}

// Need to import In
import { In } from 'typeorm';