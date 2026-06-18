// src/modules/cart/cart.service.ts
import { CartRepository } from './cart.repository';
import { AddToCartDto, UpdateCartItemDto, CartResponse } from './cart.types';

export class CartService {
  private repo = new CartRepository();

  async getCart(userId: string, sessionId?: string): Promise<CartResponse> {
    const cart = await this.repo.getOrCreateCart(userId, sessionId);
    return this.repo.getCartWithDetails(cart.id) as unknown as CartResponse;
  }

  async addItem(userId: string, dto: AddToCartDto, sessionId?: string) {
    const cart = await this.repo.getOrCreateCart(userId, sessionId);
    await this.repo.addItem(cart.id, dto);
    return this.repo.getCartWithDetails(cart.id);
  }

  async updateItem(itemId: string, dto: UpdateCartItemDto) {
    const item = await this.repo.updateItem(itemId, dto);
    return this.repo.getCartWithDetails(item.cart_id);
  }

  async removeItem(itemId: string) {
    return this.repo.removeItem(itemId);
  }

  async clearCart(userId: string, sessionId?: string) {
    const cart = await this.repo.getOrCreateCart(userId, sessionId);
    return this.repo.clearCart(cart.id);
  }

  async mergeCart(userId: string, sessionId: string) {
    return this.repo.mergeGuestCart(userId, sessionId);
  }
}