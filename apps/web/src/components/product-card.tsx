import Link from 'next/link';
import { formatVnd, SEASON_BADGE, seasonState } from '@/lib/format';
import type { Product } from '@/lib/types';
import { AddToQuoteButton } from './add-to-quote-button';

export function ProductCard({ product }: { product: Product }) {
  const badge = SEASON_BADGE[seasonState(product.season)];

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/san-pham/${product.slug}`} className="relative block">
        <div
          className={`flex h-44 items-center justify-center bg-gradient-to-br text-6xl ${product.gradient}`}
        >
          <span className="transition-transform group-hover:scale-110">{product.emoji}</span>
        </div>
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}
        >
          {badge.label}
        </span>
        {product.isExportQuality && (
          <span className="absolute right-3 top-3 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
            Xuất khẩu
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium text-stone-500">
          {product.growingRegion} · {product.harvestPeriod}
        </p>
        <Link
          href={`/san-pham/${product.slug}`}
          className="mt-1 font-semibold text-stone-900 hover:text-green-700"
        >
          {product.name}
        </Link>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {product.certifications.map((c) => (
            <span key={c} className="rounded bg-green-50 px-1.5 py-0.5 text-[11px] font-medium text-green-700">
              ✓ {c}
            </span>
          ))}
        </div>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            {product.priceOnRequest ? (
              <p className="text-sm font-semibold text-orange-600">Liên hệ báo giá</p>
            ) : (
              <>
                <p className="text-lg font-bold text-green-700">
                  {product.priceTiers.length > 0
                    ? `từ ${formatVnd(product.priceTiers[product.priceTiers.length - 1].price)}`
                    : formatVnd(product.retailPrice ?? 0)}
                  <span className="text-xs font-medium text-stone-500">/{product.unit}</span>
                </p>
                <p className="text-[11px] text-stone-500">Giá sỉ theo số lượng</p>
              </>
            )}
          </div>
        </div>

        <div className="mt-3">
          <AddToQuoteButton product={product} compact />
        </div>
      </div>
    </div>
  );
}
