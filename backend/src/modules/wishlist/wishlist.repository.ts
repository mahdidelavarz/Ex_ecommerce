// src/modules/wishlist/wishlist.repository.ts
import { AppDataSource } from '../../config/database';
import { Wishlist } from '../../database/entities/wishlist.entity';
import { ProductVariant } from '../../database/entities/product-variant.entity';
import { NotFoundError, ConflictError } from '../../shared/utils/errors';
import { AddToWishlistDto } from './wishlist.types';

export class WishlistRepository {
  private repo = AppDataSource.getRepository(Wishlist);
  private variantRepo = AppDataSource.getRepository(ProductVariant);

  async findByUser(userId: string, page = 1, limit = 20) {
    const [rows, total] = await this.repo.findAndCount({
      where: { user_id: userId },
      relations: ['variant', 'variant.product', 'variant.variant_attribute_values', 'variant.variant_attribute_values.attribute_value', 'variant.variant_attribute_values.attribute_value.attribute', 'variant.images'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const items = rows.map((item) => ({
      id: item.id,
      variant_id: item.variant_id,
      variant: {
        id: item.variant.id,
        sku: item.variant.sku,
        price: item.variant.price,
        compare_at_price: item.variant.compare_at_price,
        stock_quantity: item.variant.stock_quantity,
        is_active: item.variant.is_active,
        attributes: item.variant.variant_attribute_values?.map((vav: any) => ({
          name: vav.attribute_value?.attribute?.name || '',
          value: vav.attribute_value?.value || '',
          color_code: vav.attribute_value?.color_code || null,
        })) || [],
        image: item.variant.images?.[0]?.image_url || null,
        product: item.variant.product ? {
          id: item.variant.product.id,
          title: item.variant.product.title,
          slug: item.variant.product.slug,
          is_active: item.variant.product.is_active,
        } : null,
      },
      created_at: item.created_at,
    }));

    return { items, total, page, limit };
  }

  async add(userId: string, dto: AddToWishlistDto) {
    const variant = await this.variantRepo.findOne({ where: { id: dto.variant_id } });
    if (!variant) throw new NotFoundError('واریانت یافت نشد');

    const existing = await this.repo.findOne({
      where: { user_id: userId, variant_id: dto.variant_id },
    });
    if (existing) throw new ConflictError('این محصول قبلاً به علاقه‌مندی‌ها اضافه شده است');

    const item = this.repo.create({ user_id: userId, variant_id: dto.variant_id });
    return this.repo.save(item);
  }

  async remove(userId: string, wishlistId: string) {
    const item = await this.repo.findOne({ where: { id: wishlistId, user_id: userId } });
    if (!item) throw new NotFoundError('آیتم یافت نشد');
    await this.repo.remove(item);
  }

  async isWishlisted(userId: string, variantId: string): Promise<boolean> {
    const count = await this.repo.count({ where: { user_id: userId, variant_id: variantId } });
    return count > 0;
  }
}