// src/modules/variants/variant.repository.ts
import { AppDataSource } from "../../config/database";
import { ProductVariant } from "../../database/entities/product-variant.entity";
import { Product } from "../../database/entities/product.entity";
import { VariantAttributeValue } from "../../database/entities/variant-attribute-value.entity";
import { VariantImage } from "../../database/entities/variant-image.entity";
import { AttributeValue } from "../../database/entities/attribute-value.entity";
import { OrderItem } from "../../database/entities/order-item.entity";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "../../shared/utils/errors";
import { CreateVariantDto, UpdateVariantDto } from "./variant.types";
import { In } from "typeorm";

export class VariantRepository {
  private repo = AppDataSource.getRepository(ProductVariant);
  private productRepo = AppDataSource.getRepository(Product);
  private variantAttributeRepo = AppDataSource.getRepository(
    VariantAttributeValue,
  );
  private variantImageRepo = AppDataSource.getRepository(VariantImage);
  private attributeValueRepo = AppDataSource.getRepository(AttributeValue);
  private orderItemRepo = AppDataSource.getRepository(OrderItem);

  async findByProduct(productId: string) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundError("محصول یافت نشد");

    return this.repo.find({
      where: { product_id: productId },
      relations: [
        "variant_attribute_values",
        "variant_attribute_values.attribute_value",
        "variant_attribute_values.attribute_value.attribute",
        "images",
      ],
      order: { created_at: "ASC" },
    });
  }

  async findById(id: string) {
    const variant = await this.repo.findOne({
      where: { id },
      relations: [
        "variant_attribute_values",
        "variant_attribute_values.attribute_value",
        "variant_attribute_values.attribute_value.attribute",
        "images",
      ],
    });

    if (!variant) throw new NotFoundError("واریانت یافت نشد");
    return variant;
  }

  async create(productId: string, dto: CreateVariantDto) {
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        productId,
      )
    ) {
      throw new BadRequestError("شناسه محصول نامعتبر است");
    }
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundError("محصول یافت نشد");

    // Check duplicate SKU
    if (dto.sku) {
      const existing = await this.repo.findOne({ where: { sku: dto.sku } });
      if (existing) throw new ConflictError("کد محصول تکراری است");
    }

    // Validate attribute values
    if (dto.attribute_value_ids?.length) {
      await this.validateAttributes(productId, dto.attribute_value_ids);
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const variant = this.repo.create({
        product_id: productId,
        sku: dto.sku,
        barcode: dto.barcode || null,
        price: dto.price,
        compare_at_price: dto.compare_at_price || null,
        cost: dto.cost || 0,
        weight: dto.weight || null,
        stock_quantity: dto.stock_quantity || 0,
        low_stock_threshold: dto.low_stock_threshold || null,
        is_active: dto.is_active ?? true,
      });

      const saved = await queryRunner.manager.save(variant);

      // Save attribute values
      if (dto.attribute_value_ids?.length) {
        const values = dto.attribute_value_ids.map((avid) =>
          this.variantAttributeRepo.create({
            variant_id: saved.id,
            attribute_value_id: avid,
          }),
        );
        await queryRunner.manager.save(values);
      }

      // Save images
      if (dto.images?.length) {
        const images = dto.images.map((img, idx) =>
          this.variantImageRepo.create({
            variant_id: saved.id,
            image_url: img.image_url,
            sort_order: img.sort_order ?? idx,
          }),
        );
        await queryRunner.manager.save(images);
      }

      await queryRunner.commitTransaction();
      return this.findById(saved.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, dto: UpdateVariantDto) {
    const variant = await this.repo.findOne({ where: { id } });
    if (!variant) throw new NotFoundError("واریانت یافت نشد");

    if (dto.sku && dto.sku !== variant.sku) {
      const existing = await this.repo.findOne({ where: { sku: dto.sku } });
      if (existing) throw new ConflictError("کد محصول تکراری است");
    }

    // Update attribute values if provided
    if (dto.attribute_value_ids) {
      await this.variantAttributeRepo.delete({ variant_id: id });
      if (dto.attribute_value_ids.length > 0) {
        await this.validateAttributes(
          variant.product_id,
          dto.attribute_value_ids,
        );
        const values = dto.attribute_value_ids.map((avid) =>
          this.variantAttributeRepo.create({
            variant_id: id,
            attribute_value_id: avid,
          }),
        );
        await this.variantAttributeRepo.save(values);
      }
    }

    const { attribute_value_ids, ...updateData } = dto;
    Object.assign(variant, updateData);
    return this.repo.save(variant);
  }

  async delete(id: string) {
    const variant = await this.repo.findOne({ where: { id } });
    if (!variant) throw new NotFoundError("واریانت یافت نشد");
    await this.repo.softDelete(id);
  }

  async bulkStock(dtos: { id: string; stock_quantity: number }[]) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of dtos) {
        await queryRunner.manager.update(ProductVariant, item.id, {
          stock_quantity: item.stock_quantity,
        });
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async addImage(
    variantId: string,
    dto: { image_url: string; sort_order?: number },
  ) {
    const variant = await this.repo.findOne({ where: { id: variantId } });
    if (!variant) throw new NotFoundError("واریانت یافت نشد");

    const image = this.variantImageRepo.create({
      variant_id: variantId,
      image_url: dto.image_url,
      sort_order: dto.sort_order || 0,
    });

    return this.variantImageRepo.save(image);
  }

  async deleteImage(imageId: string) {
    const image = await this.variantImageRepo.findOne({
      where: { id: imageId },
    });
    if (!image) throw new NotFoundError("تصویر یافت نشد");
    await this.variantImageRepo.remove(image);
  }

  private async validateAttributes(
    productId: string,
    attributeValueIds: string[],
  ) {
    // Check all values exist
    const values = await this.attributeValueRepo.find({
      where: { id: In(attributeValueIds) },
      relations: ["attribute"],
    });

    if (values.length !== attributeValueIds.length) {
      throw new NotFoundError("برخی مقادیر ویژگی یافت نشدند");
    }

    // Check no duplicate attributes (e.g., two colors for same variant)
    const attributeIds = values.map((v) => v.attribute_id);
    const uniqueIds = new Set(attributeIds);
    if (uniqueIds.size !== attributeIds.length) {
      throw new BadRequestError("نمی‌توان از یک ویژگی چند مقدار انتخاب کرد");
    }
  }
}
