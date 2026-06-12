/** Kiểu dữ liệu hiển thị — khớp với serialization của API (mức khách vãng lai/đại lý) */

export interface PriceTier {
  minQuantity: number;
  price: number;
  label: string;
}

export interface SeasonInfo {
  startMonth: number;
  endMonth: number;
  peakMonth?: number;
  label: string; // "Tháng 5 – 8"
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  categoryName: string;
  unit: string;
  minOrderQuantity: number;
  shortDescription: string;
  description: string;
  origin: string;
  growingRegion: string;
  harvestPeriod: string;
  season: SeasonInfo;
  certifications: string[];
  isExportQuality: boolean;
  isFeatured: boolean;
  /** null khi ẩn giá với khách lẻ */
  retailPrice: number | null;
  priceOnRequest: boolean;
  priceTiers: PriceTier[];
  /** Placeholder hiển thị khi chưa có ảnh thật */
  emoji: string;
  gradient: string;
}

export interface Category {
  name: string;
  slug: string;
  productCount: number;
}

export interface Post {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  categoryLabel: string;
  publishedAt: string;
}

export interface Review {
  authorName: string;
  companyName: string;
  content: string;
  rating: number;
}

export interface QuoteCartItem {
  productId: string;
  slug: string;
  name: string;
  unit: string;
  quantity: number;
  minOrderQuantity: number;
  note?: string;
  emoji: string;
  gradient: string;
}
