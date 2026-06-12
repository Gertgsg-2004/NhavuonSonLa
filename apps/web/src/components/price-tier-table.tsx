'use client';

import { useMemo, useState } from 'react';
import { formatQuantity, formatVnd, resolveTierPrice } from '@/lib/format';
import type { Product } from '@/lib/types';
import { AddToQuoteButton } from './add-to-quote-button';

/**
 * Bảng giá bậc thang + chọn khối lượng + tạm tính.
 * Sản phẩm ẩn giá (priceOnRequest) → CTA báo giá thay vì bảng giá.
 */
export function PriceTierPanel({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(product.minOrderQuantity);

  const unitPrice = useMemo(
    () => resolveTierPrice(product.priceTiers, quantity),
    [product.priceTiers, quantity],
  );

  if (product.priceOnRequest) {
    return (
      <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
        <p className="font-semibold text-orange-700">Giá theo thỏa thuận</p>
        <p className="mt-1 text-sm text-stone-600">
          Sản phẩm này báo giá theo thời điểm và khối lượng. Gửi yêu cầu để nhận báo giá trong 2
          giờ làm việc, hoặc{' '}
          <a href="/dang-nhap" className="font-medium text-green-700 underline">
            đăng nhập tài khoản đại lý
          </a>{' '}
          để xem giá sỉ.
        </p>
        <div className="mt-4">
          <AddToQuoteButton product={product} />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5">
      <h2 className="font-semibold text-stone-900">Bảng giá theo số lượng</h2>
      <table className="mt-3 w-full text-sm">
        <thead>
          <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-500">
            <th className="py-2">Khối lượng</th>
            <th className="py-2 text-right">Đơn giá/{product.unit}</th>
          </tr>
        </thead>
        <tbody>
          {product.priceTiers.map((tier) => {
            const active = unitPrice !== null && tier.price === unitPrice;
            return (
              <tr
                key={tier.minQuantity}
                className={`border-b border-stone-100 last:border-0 ${
                  active ? 'bg-green-50 font-semibold text-green-800' : 'text-stone-700'
                }`}
              >
                <td className="py-2">
                  {tier.label}
                  {active && <span className="ml-2 text-xs">← áp dụng</span>}
                </td>
                <td className="py-2 text-right">{formatVnd(tier.price)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-stone-500">
        Đăng nhập tài khoản đại lý để được áp thêm chiết khấu riêng theo hợp đồng.
      </p>

      <div className="mt-4 flex items-center gap-3">
        <label htmlFor="quantity" className="text-sm font-medium text-stone-700">
          Khối lượng ({product.unit}):
        </label>
        <input
          id="quantity"
          type="number"
          min={product.minOrderQuantity}
          step={10}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
          className="w-28 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
        />
      </div>
      {quantity < product.minOrderQuantity && (
        <p className="mt-2 text-xs text-red-600">
          Khối lượng đặt tối thiểu: {formatQuantity(product.minOrderQuantity)}
        </p>
      )}
      {unitPrice !== null && quantity >= product.minOrderQuantity && (
        <p className="mt-3 text-sm text-stone-700">
          Tạm tính:{' '}
          <span className="text-lg font-bold text-green-700">{formatVnd(unitPrice * quantity)}</span>{' '}
          <span className="text-xs text-stone-500">
            ({formatQuantity(quantity)} × {formatVnd(unitPrice)})
          </span>
        </p>
      )}

      <div className="mt-4">
        <AddToQuoteButton product={product} quantity={quantity} />
      </div>
      <p className="mt-2 text-center text-xs text-stone-500">
        Gửi yêu cầu → nhân viên xác nhận tồn kho &amp; lịch giao → chốt đơn. Không cần thanh toán
        trước.
      </p>
    </div>
  );
}
