import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Giới thiệu nhà vườn',
  description:
    'Nhà Vườn Sơn La: hơn 45ha vùng trồng tại Yên Châu, Mộc Châu, Sông Mã đạt chuẩn VietGAP/GlobalGAP, chuyên cung cấp sỉ và xuất khẩu trái cây cao nguyên.',
};

const STATS = [
  { value: '45+ ha', label: 'Vùng trồng tự chủ' },
  { value: '3', label: 'Khu vực canh tác' },
  { value: '500+ tấn', label: 'Sản lượng mỗi năm' },
  { value: '10+ năm', label: 'Kinh nghiệm bán sỉ' },
];

const FARMS = [
  {
    name: 'Nhà vườn Yên Châu',
    desc: 'Vùng trồng xoài tròn bản địa (chỉ dẫn địa lý) và xoài tượng da xanh dọc quốc lộ 6, đạt VietGAP từ 2019, có mã số vùng trồng xuất khẩu.',
    emoji: '🥭',
  },
  {
    name: 'Nhà vườn Mộc Châu',
    desc: 'Cao nguyên 1.050m khí hậu ôn đới: mận hậu, dâu tây Hana nhà màng hữu cơ, chanh leo GlobalGAP.',
    emoji: '🍓',
  },
  {
    name: 'Nhà vườn Sông Mã',
    desc: 'Thuộc thủ phủ nhãn miền Bắc với hơn 7.500ha; nhãn cùi dày hạt nhỏ phục vụ nội địa và xuất khẩu chính ngạch.',
    emoji: '🟤',
  },
];

const CERTS = ['VietGAP', 'GlobalGAP', 'Organic (dâu tây)', 'Mã số vùng trồng xuất khẩu'];

export default function AboutPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-green-700 to-emerald-600 text-white">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <h1 className="text-4xl font-bold">Về Nhà Vườn Sơn La</h1>
          <p className="mx-auto mt-4 max-w-2xl text-green-50">
            Chúng tôi là nhà vườn trực tiếp canh tác — không qua trung gian. Đối tác nhận hàng từ
            vườn với giá gốc, chứng từ đầy đủ và sản lượng ổn định theo kế hoạch mùa vụ.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-6 rounded-2xl border border-stone-200 bg-white p-8 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-green-700">{s.value}</p>
              <p className="mt-1 text-sm text-stone-600">{s.label}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-14 text-2xl font-bold text-stone-900">Ba khu vùng trồng</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {FARMS.map((f) => (
            <div key={f.name} className="rounded-xl border border-stone-200 bg-white p-6">
              <span className="text-4xl">{f.emoji}</span>
              <h3 className="mt-3 font-bold text-stone-900">{f.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{f.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-14 text-2xl font-bold text-stone-900">Chứng nhận chất lượng</h2>
        <p className="mt-2 text-stone-600">
          Bản scan chứng nhận (PDF) được đính kèm tại từng trang sản phẩm và cung cấp theo lô hàng
          phục vụ hồ sơ siêu thị/xuất khẩu.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {CERTS.map((c) => (
            <span key={c} className="rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
              ✓ {c}
            </span>
          ))}
        </div>

        <h2 className="mt-14 text-2xl font-bold text-stone-900">Hình ảnh &amp; video nhà vườn</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {['🌄', '🌳', '📦', '🚛', '🧑‍🌾', '🏔️', '🍃', '🎬'].map((e, i) => (
            <div key={i} className="flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-emerald-50 text-5xl">
              {e}
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-stone-400">
          Thư viện ảnh/video thật được quản trị viên cập nhật qua trang quản trị (CMS / Thư viện).
        </p>

        <div className="mt-14 rounded-2xl bg-stone-900 p-8 text-center text-white">
          <h2 className="text-2xl font-bold">Trở thành đối tác phân phối</h2>
          <p className="mx-auto mt-2 max-w-xl text-stone-300">
            Đại lý đăng ký tài khoản để xem giá sỉ theo bậc, đặt hàng trực tuyến và theo dõi công
            nợ — hoặc liên hệ trực tiếp đội kinh doanh.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/dang-ky-dai-ly" className="rounded-lg bg-green-600 px-5 py-2.5 font-semibold hover:bg-green-700">
              Đăng ký đại lý
            </Link>
            <Link href="/lien-he" className="rounded-lg bg-white/10 px-5 py-2.5 font-semibold hover:bg-white/20">
              Liên hệ hợp tác
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
