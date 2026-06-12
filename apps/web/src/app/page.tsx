import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { SectionHeading } from '@/components/section-heading';
import { getFeaturedProducts, getPosts, getProducts, getReviews } from '@/lib/api';
import { SITE } from '@/lib/mock-data';

const USPS = [
  { icon: '🌱', title: 'Vùng trồng đạt chuẩn', desc: 'VietGAP · GlobalGAP · Organic, có mã số vùng trồng xuất khẩu' },
  { icon: '💰', title: 'Giá sỉ tận vườn', desc: 'Giá bậc thang theo số lượng 10kg → 1 tấn, chiết khấu đại lý' },
  { icon: '🚛', title: 'Giao xe tải & container', desc: 'Đội xe riêng giao toàn quốc, đóng hàng chuẩn kiểm dịch' },
  { icon: '📋', title: 'Hỗ trợ xuất khẩu', desc: 'Hồ sơ truy xuất nguồn gốc, chứng nhận, đóng container' },
];

const HARVEST_STEPS = [
  { step: '01', title: 'Kiểm tra độ chín', desc: 'Đo độ ngọt từng lô, chỉ hái khi đạt chuẩn' },
  { step: '02', title: 'Thu hái buổi sớm', desc: 'Hái tay nhẹ nhàng lúc 4–8h sáng giữ độ tươi' },
  { step: '03', title: 'Phân loại & đóng gói', desc: 'Tuyển size, đóng thùng/sọt theo yêu cầu khách' },
  { step: '04', title: 'Kiểm định chất lượng', desc: 'Gắn mã lô truy xuất, kèm chứng nhận' },
  { step: '05', title: 'Lên xe trong ngày', desc: 'Xe tải/container lạnh xuất bến đúng hẹn' },
];

export default async function HomePage() {
  const [featured, inSeason, reviews, posts] = await Promise.all([
    getFeaturedProducts(),
    getProducts({ season: 'now' }),
    getReviews(),
    getPosts(),
  ]);
  const currentMonth = new Date().getMonth() + 1;

  return (
    <div>
      {/* 1. Hero banner */}
      <section className="bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="inline-block rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
              Chuyên bán sỉ cho đại lý · siêu thị · chợ đầu mối · xuất khẩu
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
              {SITE.tagline}
            </h1>
            <p className="mt-4 max-w-lg text-green-50">
              Hơn 45ha vùng trồng đạt chuẩn tại Yên Châu, Mộc Châu, Sông Mã. Giá theo mùa vụ và
              khối lượng — gửi yêu cầu báo giá, phản hồi trong 2 giờ làm việc.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/san-pham"
                className="rounded-lg bg-white px-6 py-3 font-semibold text-green-700 shadow transition-colors hover:bg-green-50"
              >
                Xem sản phẩm
              </Link>
              <Link
                href="/bao-gia"
                className="rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white shadow transition-colors hover:bg-orange-700"
              >
                Yêu cầu báo giá ngay
              </Link>
            </div>
          </div>
          <div className="hidden justify-center md:flex">
            <div className="grid grid-cols-3 gap-4 text-7xl">
              <span className="rotate-[-8deg] rounded-2xl bg-white/10 p-6">🥭</span>
              <span className="translate-y-6 rounded-2xl bg-white/10 p-6">🍓</span>
              <span className="rotate-[8deg] rounded-2xl bg-white/10 p-6">🍑</span>
              <span className="translate-y-3 rounded-2xl bg-white/10 p-6">🟣</span>
              <span className="-translate-y-3 rounded-2xl bg-white/10 p-6">🍈</span>
              <span className="rotate-[5deg] rounded-2xl bg-white/10 p-6">🚛</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. USP strip */}
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {USPS.map((usp) => (
            <div key={usp.title} className="flex gap-3">
              <span className="text-3xl">{usp.icon}</span>
              <div>
                <h3 className="font-semibold text-stone-900">{usp.title}</h3>
                <p className="mt-0.5 text-sm text-stone-600">{usp.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Sản phẩm nổi bật */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <SectionHeading
          title="Sản phẩm nổi bật"
          subtitle="Đặc sản chủ lực của nhà vườn, sẵn sàng đơn số lượng lớn"
          moreHref="/san-pham"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* 4. Hoa quả theo mùa */}
      <section className="bg-green-50/60">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <SectionHeading
            title={`Đang vào mùa — Tháng ${currentMonth}`}
            subtitle="Hàng đang thu hoạch rộ, sản lượng tốt nhất để chốt đơn lớn"
            moreHref="/mua-vu"
            moreLabel="Xem lịch mùa vụ →"
          />
          {inSeason.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {inSeason.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <p className="text-stone-600">
              Tháng này đang giáp vụ — xem <Link href="/mua-vu" className="font-medium text-green-700 underline">lịch mùa vụ</Link>{' '}
              để đặt trước vụ tới.
            </p>
          )}
        </div>
      </section>

      {/* 5. Quy trình thu hoạch */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <SectionHeading
          title="Quy trình thu hoạch & giao hàng"
          subtitle="Từ vườn đến xe trong 24 giờ — giữ trọn độ tươi cho đơn sỉ"
        />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {HARVEST_STEPS.map((s) => (
            <li key={s.step} className="rounded-xl border border-stone-200 bg-white p-5">
              <span className="text-sm font-bold text-green-600">{s.step}</span>
              <h3 className="mt-2 font-semibold text-stone-900">{s.title}</h3>
              <p className="mt-1 text-sm text-stone-600">{s.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 6. Video */}
      <section className="bg-stone-900 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">Tham quan vùng trồng qua video</h2>
            <p className="mt-3 text-stone-300">
              Cùng xem quy mô vườn xoài Yên Châu, nhãn Sông Mã và quy trình đóng hàng container
              xuất khẩu của nhà vườn.
            </p>
            <p className="mt-4 text-sm text-stone-400">
              (Video YouTube sẽ được quản trị viên cập nhật trong trang quản trị — mục CMS / Video)
            </p>
          </div>
          <div className="flex aspect-video items-center justify-center rounded-xl bg-stone-800">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-2xl">▶</span>
          </div>
        </div>
      </section>

      {/* 7. Khách hàng & đánh giá */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <SectionHeading
          title="Đối tác nói gì về nhà vườn"
          subtitle="Đại lý, chuỗi cửa hàng, đơn vị xuất khẩu đang hợp tác lâu dài"
        />
        <div className="grid gap-5 md:grid-cols-3">
          {reviews.map((r) => (
            <figure key={r.authorName} className="rounded-xl border border-stone-200 bg-white p-5">
              <div className="text-amber-400">{'★'.repeat(r.rating)}</div>
              <blockquote className="mt-3 text-sm leading-relaxed text-stone-700">
                “{r.content}”
              </blockquote>
              <figcaption className="mt-4 text-sm">
                <span className="font-semibold text-stone-900">{r.authorName}</span>
                <span className="text-stone-500"> — {r.companyName}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* 8. Tin tức */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <SectionHeading
            title="Tin tức & giá thị trường"
            subtitle="Kỹ thuật trồng, mùa vụ, xuất khẩu và nhận định giá"
            moreHref="/tin-tuc"
          />
          <div className="grid gap-5 md:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/tin-tuc/${post.slug}`}
                className="group rounded-xl border border-stone-200 bg-white p-5 transition-shadow hover:shadow-md"
              >
                <span className="rounded bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                  {post.categoryLabel}
                </span>
                <h3 className="mt-3 font-semibold text-stone-900 group-hover:text-green-700">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-stone-600">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 9. CTA cuối trang */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="rounded-2xl bg-gradient-to-r from-green-700 to-emerald-600 px-6 py-12 text-center text-white">
          <h2 className="text-2xl font-bold md:text-3xl">Cần báo giá cho đơn số lượng lớn?</h2>
          <p className="mx-auto mt-3 max-w-xl text-green-50">
            Gửi danh sách sản phẩm và khối lượng — nhân viên kinh doanh phản hồi báo giá chi tiết
            trong 2 giờ làm việc, kèm lịch thu hoạch và phương án vận chuyển.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/bao-gia"
              className="rounded-lg bg-orange-600 px-6 py-3 font-semibold shadow hover:bg-orange-700"
            >
              Gửi yêu cầu báo giá
            </Link>
            <a
              href={`tel:${SITE.hotline.replace(/\s/g, '')}`}
              className="rounded-lg bg-white/15 px-6 py-3 font-semibold hover:bg-white/25"
            >
              ☎ {SITE.hotline}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
