'use client';

import { useState } from 'react';
import type { Product } from '@/lib/types';
import { useQuoteCart } from './quote-cart-context';

/**
 * Nút "Thêm vào yêu cầu báo giá" — thay thế "Mua ngay" của B2C.
 * compact: dùng trong card; bản đầy đủ (trang chi tiết) cho nhập khối lượng.
 */
export function AddToQuoteButton({
  product,
  compact = false,
  quantity,
}: {
  product: Product;
  compact?: boolean;
  quantity?: number;
}) {
  const { addItem } = useQuoteCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      unit: product.unit,
      quantity: quantity ?? product.minOrderQuantity,
      minOrderQuantity: product.minOrderQuantity,
      emoji: product.emoji,
      gradient: product.gradient,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={handleAdd}
      className={`w-full rounded-lg font-semibold transition-colors ${
        compact ? 'px-3 py-2 text-sm' : 'px-6 py-3 text-base'
      } ${
        added
          ? 'bg-green-600 text-white'
          : 'bg-orange-600 text-white hover:bg-orange-700'
      }`}
    >
      {added ? '✓ Đã thêm vào giỏ báo giá' : '+ Thêm vào yêu cầu báo giá'}
    </button>
  );
}
