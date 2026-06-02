// src/modules/wishlist/wishlist.service.ts
import { WishlistRepository } from './wishlist.repository';
import { AddToWishlistDto } from './wishlist.types';

export class WishlistService {
  private repo = new WishlistRepository();
  async list(userId: string) { return this.repo.findByUser(userId); }
  async add(userId: string, dto: AddToWishlistDto) { return this.repo.add(userId, dto); }
  async remove(userId: string, id: string) { return this.repo.remove(userId, id); }
  async check(userId: string, variantId: string) { return this.repo.isWishlisted(userId, variantId); }
}