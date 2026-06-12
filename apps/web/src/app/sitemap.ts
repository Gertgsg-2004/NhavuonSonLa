import type { MetadataRoute } from 'next';
import { getPosts, getProducts } from '@/lib/api';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.all([getProducts({}), getPosts()]);

  const staticPages: MetadataRoute.Sitemap = [
    '',
    '/san-pham',
    '/mua-vu',
    '/tin-tuc',
    '/gioi-thieu',
    '/lien-he',
    '/bao-gia',
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));

  return [
    ...staticPages,
    ...products.map((p) => ({
      url: `${siteUrl}/san-pham/${p.slug}`,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    })),
    ...posts.map((p) => ({
      url: `${siteUrl}/tin-tuc/${p.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
