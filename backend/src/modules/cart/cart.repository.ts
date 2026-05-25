// src/modules/cart/cart.repository.ts
import { AppDataSource } from '../../config/database';
import { Cart } from '../../database/entities/cart.entity';
import { CartItem } from '../../database/entities/cart-item.entity';
import { ProductVariant } from '../../database/entities/product-variant.entity';
import { Product } from '../../database/entities/product.entity';
import { VariantAttributeValue } from '../../database/entities/variant-attribute-value.entity';
import { VariantImage } from '../../database/entities/variant-image.entity';
import { NotFoundError, BadRequestError } from '../../shared/utils/errors';
import { AddToCartDto, UpdateCartItemDto } from './cart.types';

export class CartRepository {
  private cartRepo = AppDataSource.getRepository(Cart);
  private cartItemRepo = AppDataSource.getRepository(CartItem);
  private variantRepo = AppDataSource.getRepository(ProductVariant);

  async getOrCreateCart(userId: string, sessionId?: string | null): Promise<Cart> {
    let cart: Cart | null = null;

    if (userId) {
      cart = await this.cartRepo.findOne({
        where: { user_id: userId },
        relations: ['items', 'items.variant'],
      });
    } else if (sessionId) {
      cart = await this.cartRepo.findOne({
        where: { session_id: sessionId },
        relations: ['items', 'items.variant'],
      });
    }

    if (!cart) {
      cart = this.cartRepo.create({
        user_id: userId || null,
        session_id: sessionId || null,
      });
      cart = await this.cartRepo.save(cart);
      cart.items = [];
    }

    return cart;
  }

  async getCartWithDetails(cartId: string): Promise<any> {
    const cart = await this.cartRepo.findOne({
      where: { id: cartId },
      relations: ['items', 'items.variant', 'items.variant.product'],
    });

    if (!cart) throw new NotFoundError('سبد خرید یافت نشد');

    // Get variant details for each item
    const itemsWithDetails = await Promise.all(
      (cart.items || []).map(async (item) => {
        const variant = await this.variantRepo.findOne({
          where: { id: item.variant_id },
          relations: [
            'product',
            'variant_attribute_values',
            'variant_attribute_values.attribute_value',
            'variant_attribute_values.attribute_value.attribute',
            'images',
          ],
        });

        if (!variant) return null;

        const thumbnail = variant.images?.find((img) => img.sort_order === 0) || variant.images?.[0];

        return {
          id: item.id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          variant: {
            id: variant.id,
            sku: variant.sku,
            price: variant.price,
            compare_at_price: variant.compare_at_price,
            stock_quantity: variant.stock_quantity,
            is_active: variant.is_active,
            attributes: variant.variant_attribute_values?.map((vav) => ({
              name: vav.attribute_value?.attribute?.name || '',
              value: vav.attribute_value?.value || '',
              color_code: vav.attribute_value?.color_code || null,
            })) || [],
            image: thumbnail?.image_url || null,
            product: variant.product
              ? {
                  id: variant.product.id,
                  title: variant.product.title,
                  slug: variant.product.slug,
                  is_active: variant.product.is_active,
                }
              : null,
          },
        };
      })
    );

    const validItems = itemsWithDetails.filter(Boolean);
    const totalQuantity = validItems.reduce((sum, item) => sum + item!.quantity, 0);
    const subtotal = validItems.reduce(
      (sum, item) => sum + item!.variant.price * item!.quantity,
      0
    );

    return {
      id: cart.id,
      items: validItems,
      total_items: validItems.length,
      total_quantity: totalQuantity,
      subtotal,
      created_at: cart.created_at,
      updated_at: cart.updated_at,
    };
  }

  async addItem(cartId: string, dto: AddToCartDto) {
    // Validate variant
    const variant = await this.variantRepo.findOne({
      where: { id: dto.variant_id },
      relations: ['product'],
    });

    if (!variant) throw new NotFoundError('واریانت یافت نشد');
    if (!variant.is_active) throw new BadRequestError('این واریانت غیرفعال است');
    if (!variant.product?.is_active) throw new BadRequestError('این محصول غیرفعال است');

    // Check stock
    const existingItem = await this.cartItemRepo.findOne({
      where: { cart_id: cartId, variant_id: dto.variant_id },
    });

    const currentQty = existingItem ? existingItem.quantity : 0;
    const newQty = currentQty + dto.quantity;

    if (newQty > variant.stock_quantity) {
      throw new BadRequestError(
        `موجودی کافی نیست. حداکثر ${variant.stock_quantity} عدد قابل سفارش است`
      );
    }

    if (existingItem) {
      existingItem.quantity = newQty;
      return this.cartItemRepo.save(existingItem);
    }

    const item = this.cartItemRepo.create({
      cart_id: cartId,
      variant_id: dto.variant_id,
      quantity: dto.quantity,
    });

    return this.cartItemRepo.save(item);
  }

  async updateItem(itemId: string, dto: UpdateCartItemDto) {
    const item = await this.cartItemRepo.findOne({
      where: { id: itemId },
      relations: ['variant'],
    });

    if (!item) throw new NotFoundError('آیتم یافت نشد');

    if (dto.quantity > item.variant.stock_quantity) {
      throw new BadRequestError(
        `حداکثر ${item.variant.stock_quantity} عدد قابل سفارش است`
      );
    }

    item.quantity = dto.quantity;
    return this.cartItemRepo.save(item);
  }

  async removeItem(itemId: string) {
    const item = await this.cartItemRepo.findOne({ where: { id: itemId } });
    if (!item) throw new NotFoundError('آیتم یافت نشد');
    await this.cartItemRepo.remove(item);
  }

  async clearCart(cartId: string) {
    await this.cartItemRepo.delete({ cart_id: cartId });
  }

  async mergeGuestCart(userId: string, sessionId: string) {
    const guestCart = await this.cartRepo.findOne({
      where: { session_id: sessionId },
      relations: ['items'],
    });

    if (!guestCart || !guestCart.items?.length) return;

    const userCart = await this.getOrCreateCart(userId);

    for (const guestItem of guestCart.items) {
      const existing = await this.cartItemRepo.findOne({
        where: { cart_id: userCart.id, variant_id: guestItem.variant_id },
      });

      if (existing) {
        existing.quantity += guestItem.quantity;
        await this.cartItemRepo.save(existing);
      } else {
        await this.cartItemRepo.save({
          cart_id: userCart.id,
          variant_id: guestItem.variant_id,
          quantity: guestItem.quantity,
        });
      }
    }

    // Delete guest cart
    await this.cartRepo.remove(guestCart);
  }
}