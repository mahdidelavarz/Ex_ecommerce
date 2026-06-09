// src/modules/wishlist/components/WishlistButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/modules/auth/store/auth.store';
import { useAddToWishlist, useRemoveFromWishlist, useWishlist } from '../hooks/useWishlist';
import { MdiHeart, MdiHeartOutline } from '@/components/icons/Icons';

interface WishlistButtonProps {
  variantId: string;
  className?: string;
  size?: number;
}

export default function WishlistButton({ variantId, className = '', size = 24 }: WishlistButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { data: wishlist } = useWishlist();

  useEffect(() => {
    if (wishlist) {
      setIsWishlisted(wishlist.some((item) => item.variant_id === variantId));
    }
  }, [wishlist, variantId]);

  const handleToggle = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isWishlisted) {
      const item = wishlist?.find((i) => i.variant_id === variantId);
      if (item) removeFromWishlist.mutate(item.id);
    } else {
      addToWishlist.mutate(variantId);
    }
    setIsWishlisted(!isWishlisted);
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-button transition-colors ${
        isWishlisted
          ? 'bg-error-light text-error hover:bg-error-light/80'
          : 'hover:bg-surface-raised text-text-secondary'
      } ${className}`}
      title={isWishlisted ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
    >
      {isWishlisted ? <MdiHeart width={size}/> : <MdiHeartOutline width={size}/>}
    </button>
  );
}