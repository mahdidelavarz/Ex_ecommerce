// src/modules/variants/variant.service.ts
import { VariantRepository } from './variant.repository';
import { CreateVariantDto, UpdateVariantDto, BulkStockDto, VariantResponse } from './variant.types';

export class VariantService {
  private repo = new VariantRepository();

  async listByProduct(productId: string): Promise<VariantResponse[]> {
    const variants = await this.repo.findByProduct(productId);
    return variants.map(this.formatVariant) as unknown as VariantResponse[];
  }

  async getById(id: string): Promise<VariantResponse> {
    const variant = await this.repo.findById(id);
    return this.formatVariant(variant) as unknown as VariantResponse;
  }

  async create(productId: string, dto: CreateVariantDto): Promise<VariantResponse> {
    const variant = await this.repo.create(productId, dto);
    return this.formatVariant(variant) as unknown as VariantResponse;
  }

  async update(id: string, dto: UpdateVariantDto): Promise<VariantResponse> {
    const variant = await this.repo.update(id, dto);
    return this.formatVariant(variant) as unknown as VariantResponse;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async bulkStock(dto: BulkStockDto): Promise<void> {
    await this.repo.bulkStock(dto.items);
  }

  async addImage(variantId: string, dto: { image_url: string; sort_order?: number }) {
    return this.repo.addImage(variantId, dto);
  }

  async deleteImage(imageId: string) {
    return this.repo.deleteImage(imageId);
  }

  private formatVariant(variant: any) {
    return {
      id: variant.id,
      sku: variant.sku,
      barcode: variant.barcode,
      price: variant.price,
      compare_at_price: variant.compare_at_price,
      cost: variant.cost,
      weight: variant.weight,
      stock_quantity: variant.stock_quantity,
      low_stock_threshold: variant.low_stock_threshold,
      is_active: variant.is_active,
      attributes: variant.variant_attribute_values?.map((vav: any) => ({
        id: vav.attribute_value?.id,
        name: vav.attribute_value?.attribute?.name || '',
        value: vav.attribute_value?.value || '',
        color_code: vav.attribute_value?.color_code || null,
      })) || [],
      images: variant.images?.map((img: any) => ({
        id: img.id,
        image_url: img.image_url,
        sort_order: img.sort_order,
      })) || [],
      created_at: variant.created_at,
      updated_at: variant.updated_at,
    };
  }
}