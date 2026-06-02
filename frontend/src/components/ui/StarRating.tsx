// src/components/ui/StarRating.tsx
import { Icon } from '@iconify/react';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({ rating, max = 5, size = 20, interactive = false, onChange }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(i + 1)}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
        >
          <Icon
            icon={i < rating ? 'mdi:star' : 'mdi:star-outline'}
            className={i < rating ? 'text-warning' : 'text-text-muted'}
            width={size}
          />
        </button>
      ))}
    </div>
  );
}