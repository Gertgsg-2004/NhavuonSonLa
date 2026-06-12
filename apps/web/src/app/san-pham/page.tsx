import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { getCategories, getProducts, type ProductFilters } from '@/lib/api';
import { MOCK_REGIONS } from '@/lib/mock-data';

export const metadata: Metadata = {
  title: 'Sản phẩm — Trái cây sỉ theo mùa vụ',
  description:
    'Danh mục trái cây sỉ Sơn La: xoài, nhãn, mận hậu, dâu tây, chanh leo, na... Lọc theo mùa, vùng trồng, tiêu chuẩn VietGAP/GlobalGAP và hàng xuất khẩu.',
};

const CERTIFICATIONS = ['VietGAP', 'GlobalGAP', 'Organic'];

function buildHref(current: Record<string, string | undefined>, patch: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...current, ...patch })) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/san-pham?${qs}` : '/san-pham';
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const filters: ProductFilters = {
    category: sp.category,
    region: sp.region,
    season: sp.season,
    certification: sp.cert,
    export: sp.export,
    search: sp.search,
  };
  const [products, categories] = await Promise.all([getProducts(filters), getCategories()]);

  const FilterLink = ({
    active,
    href,
    children,
  }: {
    active: boolean;
    href: string;
    children: React.ReactNode;
  }) => (
    <Link
      href={href}
      className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${
        active ? 'bg-green-600 font-semibold text-white' : 'text-stone-700 hover:bg-stone-100'
      }`}
    >
      {children}
    </Link>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav className="text-sm text-stone-500">
        <Link href="/" className="hover:text-green-700">Trang chủ</Link>
        <span className="mx-1">/</span>
        <span className="text-stone-900">Sản phẩm</span>
      </nav>
      <h1 className="mt-2 text-3xl font-bold text-stone-900">Sản phẩm sỉ theo mùa vụ</h1>
      <p className="mt-2 max-w-2xl text-stone-600">
        Giá hiển thị là giá sỉ tham khảo theo bậc số lượng. Đại lý đăng nhập để xem chiết khấu
        riêng; sản phẩm cao cấp báo giá theo thời điểm.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Bộ lọc */}
        <aside className="space-y-6">
          <div>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-stone-500">Mùa vụ</h2>
            <FilterLink active={sp.season === 'now'} href={buildHref(sp, { season: sp.season === 'now' ? undefined : 'now' })}>
              🌿 Đang vào mùa
            </FilterLink>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-stone-500">Danh mục</h2>
            <FilterLink active={!sp.category} href={buildHref(sp, { category: undefined })}>
              Tất cả
            </FilterLink>
            {categories.map((c) => (
              <FilterLink
                key={c.slug}
                active={sp.category === c.slug}
                href={buildHref(sp, { category: c.slug })}
              >
                {c.name} <span className="text-xs text-stone-400">({c.productCount})</span>
              </FilterLink>
            ))}
          </div>

          <div>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-stone-500">Vùng trồng</h2>
            {MOCK_REGIONS.map((r) => (
              <FilterLink
                key={r}
                active={sp.region === r}
                href={buildHref(sp, { region: sp.region === r ? undefined : r })}
              >
                {r}
              </FilterLink>
            ))}
          </div>

          <div>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-stone-500">Tiêu chuẩn</h2>
            {CERTIFICATIONS.map((c) => (
              <FilterLink
                key={c}
                active={sp.cert === c}
                href={buildHref(sp, { cert: sp.cert === c ? undefined : c })}
              >
                ✓ {c}
              </FilterLink>
            ))}
            <FilterLink
              active={sp.export === 'true'}
              href={buildHref(sp, { export: sp.export === 'true' ? undefined : 'true' })}
            >
              🚢 Đạt chuẩn xuất khẩu
            </FilterLink>
          </div>
        </aside>

        {/* Danh sách */}
        <div>
          <p className="mb-4 text-sm text-stone-500">{products.length} sản phẩm</p>
          {products.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-stone-300 p-10 text-center text-stone-500">
              Không có sản phẩm khớp bộ lọc.{' '}
              <Link href="/san-pham" className="font-medium text-green-700 underline">
                Xóa bộ lọc
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
