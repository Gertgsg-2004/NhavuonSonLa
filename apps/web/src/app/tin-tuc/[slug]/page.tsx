import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getPosts } from '@/lib/api';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const others = (await getPosts()).filter((p) => p.slug !== slug);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <nav className="text-sm text-stone-500">
        <Link href="/" className="hover:text-green-700">Trang chủ</Link>
        <span className="mx-1">/</span>
        <Link href="/tin-tuc" className="hover:text-green-700">Tin tức</Link>
      </nav>

      <article className="mt-4">
        <span className="rounded bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
          {post.categoryLabel}
        </span>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-stone-900">{post.title}</h1>
        <time className="mt-2 block text-sm text-stone-400">{post.publishedAt}</time>

        <div className="mt-6 space-y-4 leading-relaxed text-stone-700">
          <p className="font-medium">{post.excerpt}</p>
          <p>
            (Nội dung chi tiết của bài viết được biên tập trong trang quản trị — mục CMS / Tin
            tức. Hệ thống hỗ trợ soạn thảo rich-text, ảnh minh họa, từ khóa SEO và lên lịch đăng.)
          </p>
        </div>
      </article>

      <div className="mt-12 border-t border-stone-200 pt-8">
        <h2 className="font-bold text-stone-900">Bài viết khác</h2>
        <ul className="mt-3 space-y-2">
          {others.map((p) => (
            <li key={p.slug}>
              <Link href={`/tin-tuc/${p.slug}`} className="text-green-700 hover:underline">
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
