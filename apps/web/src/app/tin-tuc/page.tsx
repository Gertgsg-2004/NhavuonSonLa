import type { Metadata } from 'next';
import Link from 'next/link';
import { getPosts } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Tin tức — Kỹ thuật trồng, mùa vụ, xuất khẩu, giá thị trường',
  description:
    'Cập nhật kỹ thuật canh tác, lịch mùa vụ, quy trình xuất khẩu và nhận định giá nông sản Sơn La cho đại lý và thương lái.',
};

export default async function NewsPage() {
  const posts = await getPosts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-900">Tin tức &amp; giá thị trường</h1>
      <p className="mt-2 text-stone-600">
        Bốn chuyên mục: kỹ thuật trồng · mùa vụ · xuất khẩu · giá thị trường.
      </p>

      <div className="mt-8 space-y-5">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/tin-tuc/${post.slug}`}
            className="group block rounded-xl border border-stone-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-3 text-xs">
              <span className="rounded bg-green-50 px-2 py-0.5 font-medium text-green-700">
                {post.categoryLabel}
              </span>
              <time className="text-stone-400">{post.publishedAt}</time>
            </div>
            <h2 className="mt-2 text-xl font-semibold text-stone-900 group-hover:text-green-700">
              {post.title}
            </h2>
            <p className="mt-2 text-sm text-stone-600">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
