import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PriceTierPanel } from '@/components/price-tier-table';
import { ProductCard } from '@/components/product-card';
import { SectionHeading } from '@/components/section-heading';
import { getProductBySlug, getProducts } from '@/lib/api';
import { SEASON_BADGE, seasonState } from '@/lib/format';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} — giá sỉ tại vườn`,
    description: product.shortDescription,
    openGraph: { title: product.name, description: product.shortDescription },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = (await getProducts({})).filter((p) => p.slug !== slug).slice(0, 4);
  const badge = SEASON_BADGE[seasonState(product.season)];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription,
    brand: { '@type': 'Brand', name: 'Nhà Vườn Sơn La' },
    ...(product.retailPrice && {
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'VND',
        lowPrice: product.priceTiers.at(-1)?.price ?? product.retailPrice,
        highPrice: product.retailPrice,
      },
    }),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="text-sm text-stone-500">
        <Link href="/" className="hover:text-green-700">Trang chủ</Link>
        <span className="mx-1">/</span>
        <Link href="/san-pham" className="hover:text-green-700">Sản phẩm</Link>
        <span className="mx-1">/</span>
        <Link href={`/san-pham?category=${product.categorySlug}`} className="hover:text-green-700">
          {product.categoryName}
        </Link>
        <span className="mx-1">/</span>
        <span className="text-stone-900">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Gallery placeholder */}
        <div>
          <div
            className={`flex aspect-[4/3] items-center justify-center rounded-2xl bg-gradient-to-br text-9xl ${product.gradient}`}
          >
            {product.emoji}
          </div>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex aspect-square items-center justify-center rounded-lg bg-gradient-to-br text-3xl opacity-${90 - i * 10} ${product.gradient}`}
              >
                {i === 3 ? '🎬' : product.emoji}
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-stone-400">
            Ảnh/video thật của sản phẩm được quản trị viên tải lên qua trang quản trị (Cloudinary).
          </p>
        </div>

        {/* Thông tin + giá */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}>
              {badge.label}
            </span>
            {product.isExportQuality && (
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                🚢 Đạt chuẩn xuất khẩu
              </span>
            )}
            {product.certifications.map((c) => (
              <span key={c} className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                ✓ {c}
              </span>
            ))}
          </div>

          <h1 className="mt-3 text-3xl font-bold text-stone-900">{product.name}</h1>
          <p className="mt-2 text-stone-600">{product.shortDescription}</p>

          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl bg-stone-100 p-4 text-sm">
            <div>
              <dt className="text-stone-500">Vùng trồng</dt>
              <dd className="font-medium text-stone-900">{product.growingRegion}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Thời gian thu hoạch</dt>
              <dd className="font-medium text-stone-900">{product.harvestPeriod}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Nguồn gốc giống</dt>
              <dd className="font-medium text-stone-900">{product.origin}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Đặt tối thiểu</dt>
              <dd className="font-medium text-stone-900">
                {product.minOrderQuantity}{product.unit}
              </dd>
            </div>
          </dl>

          <div className="mt-5">
            <PriceTierPanel product={product} />
          </div>
        </div>
      </div>

      {/* Mô tả chi tiết */}
      <section className="mt-12 max-w-3xl">
        <h2 className="text-xl font-bold text-stone-900">Mô tả sản phẩm</h2>
        <div className="prose-stone mt-3 space-y-3 text-stone-700">
          {product.description.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-stone-700">
          <strong className="text-green-800">Truy xuất nguồn gốc:</strong> mỗi đơn hàng được gắn mã
          lô thu hoạch (ngày hái, vườn, chứng nhận) — quét QR trên thùng hàng để xem thông tin lô.
        </div>
      </section>

      {/* Sản phẩm liên quan */}
      <section className="mt-14">
        <SectionHeading title="Sản phẩm cùng nhà vườn" moreHref="/san-pham" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
