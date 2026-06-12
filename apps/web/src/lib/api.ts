/**
 * Tầng dữ liệu: ưu tiên gọi API NestJS; nếu API chưa chạy thì fallback
 * về dữ liệu mẫu (lib/mock-data.ts) để website vẫn xem demo được đầy đủ.
 */
import { MOCK_CATEGORIES, MOCK_POSTS, MOCK_PRODUCTS, MOCK_REVIEWS } from './mock-data';
import type { Category, Post, Product, Review } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function tryFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export interface ProductFilters {
  category?: string;
  region?: string;
  season?: string;
  certification?: string;
  export?: string;
  search?: string;
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  // TODO(GĐ1): map response API → Product khi backend chạy cùng frontend
  // const params = new URLSearchParams(filters as Record<string, string>);
  // const fromApi = await tryFetch<{ data: unknown[] }>(`/products?${params}`);
  let products = [...MOCK_PRODUCTS];

  if (filters.category) products = products.filter((p) => p.categorySlug === filters.category);
  if (filters.region) {
    products = products.filter((p) =>
      p.growingRegion.toLowerCase().includes(filters.region!.toLowerCase()),
    );
  }
  if (filters.certification) {
    products = products.filter((p) =>
      p.certifications.some((c) => c.toLowerCase() === filters.certification!.toLowerCase()),
    );
  }
  if (filters.export === 'true') products = products.filter((p) => p.isExportQuality);
  if (filters.season) {
    const month =
      filters.season === 'now' ? new Date().getMonth() + 1 : Number.parseInt(filters.season, 10);
    if (month >= 1 && month <= 12) {
      products = products.filter((p) =>
        p.season.startMonth <= p.season.endMonth
          ? month >= p.season.startMonth && month <= p.season.endMonth
          : month >= p.season.startMonth || month <= p.season.endMonth,
      );
    }
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    products = products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.shortDescription.toLowerCase().includes(q),
    );
  }
  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return MOCK_PRODUCTS.find((p) => p.slug === slug);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return MOCK_PRODUCTS.filter((p) => p.isFeatured);
}

export async function getCategories(): Promise<Category[]> {
  return MOCK_CATEGORIES;
}

export async function getPosts(): Promise<Post[]> {
  return MOCK_POSTS;
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  return MOCK_POSTS.find((p) => p.slug === slug);
}

export async function getReviews(): Promise<Review[]> {
  return MOCK_REVIEWS;
}

/** Gửi yêu cầu báo giá — POST thật tới API; trả {demo:true} nếu API chưa chạy */
export async function submitQuoteRequest(payload: {
  fullName: string;
  companyName?: string;
  phone: string;
  email?: string;
  note?: string;
  items: { productId: string; quantity: number; unit?: string; note?: string }[];
}): Promise<{ code: string; demo: boolean }> {
  try {
    const res = await fetch(`${API_URL}/quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const quote = (await res.json()) as { code: string };
      return { code: quote.code, demo: false };
    }
  } catch {
    // API chưa chạy → chế độ demo
  }
  return { code: `BG-${new Date().getFullYear()}-DEMO`, demo: true };
}

export { tryFetch };
