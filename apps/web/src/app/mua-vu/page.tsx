import type { Metadata } from 'next';
import Link from 'next/link';
import { getProducts } from '@/lib/api';
import { isInSeason } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Lịch mùa vụ trái cây Sơn La',
  description:
    'Lịch thu hoạch 12 tháng: xoài Yên Châu, nhãn Sông Mã, mận hậu Mộc Châu, dâu tây, chanh leo, na... Đặt trước mùa vụ để giữ nguồn hàng số lượng lớn.',
};

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export default async function SeasonCalendarPage() {
  const products = await getProducts({});
  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-900">Lịch mùa vụ trái cây Sơn La</h1>
      <p className="mt-2 max-w-2xl text-stone-600">
        Khách sỉ có thể <strong>đặt cọc trước mùa vụ</strong> để giữ sản lượng — đặc biệt với đơn
        container xuất khẩu. Ô xanh đậm là tháng thu hoạch rộ.
      </p>

      <div className="mt-8 overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-left">
              <th className="sticky left-0 bg-stone-50 px-4 py-3 font-semibold text-stone-700">Sản phẩm</th>
              {MONTHS.map((m) => (
                <th
                  key={m}
                  className={`px-1 py-3 text-center font-medium ${
                    m === currentMonth ? 'text-green-700' : 'text-stone-500'
                  }`}
                >
                  T{m}
                  {m === currentMonth && <div className="text-[10px]">nay</div>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                <td className="sticky left-0 bg-white px-4 py-3">
                  <Link href={`/san-pham/${p.slug}`} className="flex items-center gap-2 font-medium text-stone-900 hover:text-green-700">
                    <span>{p.emoji}</span>
                    <span>
                      {p.name}
                      <span className="block text-xs font-normal text-stone-500">{p.growingRegion}</span>
                    </span>
                  </Link>
                </td>
                {MONTHS.map((m) => {
                  const active = isInSeason(p.season, m);
                  const peak = p.season.peakMonth === m;
                  return (
                    <td key={m} className="px-1 py-3 text-center">
                      <span
                        className={`mx-auto block h-5 w-full max-w-9 rounded ${
                          peak ? 'bg-green-600' : active ? 'bg-green-300' : 'bg-stone-100'
                        }`}
                        title={active ? `${p.name} — tháng ${m}${peak ? ' (rộ vụ)' : ''}` : ''}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-stone-600">
        <span className="flex items-center gap-2"><span className="h-4 w-7 rounded bg-green-600" /> Rộ vụ</span>
        <span className="flex items-center gap-2"><span className="h-4 w-7 rounded bg-green-300" /> Đang thu hoạch</span>
        <span className="flex items-center gap-2"><span className="h-4 w-7 rounded bg-stone-100" /> Hết mùa</span>
      </div>

      <div className="mt-10 rounded-2xl bg-green-50 p-6 md:p-8">
        <h2 className="text-xl font-bold text-stone-900">Đặt trước mùa vụ — giữ nguồn hàng lớn</h2>
        <ol className="mt-4 grid gap-4 text-sm text-stone-700 md:grid-cols-3">
          <li className="rounded-xl bg-white p-4">
            <strong className="text-green-700">1. Đăng ký sản lượng</strong>
            <p className="mt-1">Gửi yêu cầu trước vụ 1–3 tháng với khối lượng dự kiến (tối thiểu 1 tấn/vụ).</p>
          </li>
          <li className="rounded-xl bg-white p-4">
            <strong className="text-green-700">2. Đặt cọc giữ hàng</strong>
            <p className="mt-1">Cọc 20–30% theo giá trần thỏa thuận; giá chốt theo thời điểm thu hoạch.</p>
          </li>
          <li className="rounded-xl bg-white p-4">
            <strong className="text-green-700">3. Nhận hàng ưu tiên</strong>
            <p className="mt-1">Được ưu tiên lô đẹp nhất khi vào vụ, lịch xe cố định theo kế hoạch.</p>
          </li>
        </ol>
        <Link
          href="/bao-gia"
          className="mt-5 inline-block rounded-lg bg-orange-600 px-5 py-2.5 font-semibold text-white hover:bg-orange-700"
        >
          Đăng ký đặt trước vụ →
        </Link>
      </div>
    </div>
  );
}
