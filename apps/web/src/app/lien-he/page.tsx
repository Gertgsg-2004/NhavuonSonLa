import type { Metadata } from 'next';
import { SITE } from '@/lib/mock-data';

export const metadata: Metadata = {
  title: 'Liên hệ',
  description:
    'Liên hệ Nhà Vườn Sơn La: hotline, Zalo, email, địa chỉ vùng trồng. Hỗ trợ báo giá sỉ, hợp tác phân phối và xuất khẩu.',
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-900">Liên hệ</h1>
      <p className="mt-2 max-w-2xl text-stone-600">
        Đội kinh doanh trực từ 7h00 – 21h00 hằng ngày (kể cả cuối tuần trong mùa vụ).
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <a href={`tel:${SITE.hotline.replace(/\s/g, '')}`} className="flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-5 hover:border-green-300">
            <span className="text-3xl">☎️</span>
            <div>
              <p className="text-sm text-stone-500">Hotline / Zalo (24/7 mùa vụ)</p>
              <p className="text-lg font-bold text-green-700">{SITE.hotline}</p>
            </div>
          </a>
          <a href={`mailto:${SITE.email}`} className="flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-5 hover:border-green-300">
            <span className="text-3xl">✉️</span>
            <div>
              <p className="text-sm text-stone-500">Email kinh doanh</p>
              <p className="font-semibold text-stone-900">{SITE.email}</p>
            </div>
          </a>
          <div className="flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-5">
            <span className="text-3xl">📍</span>
            <div>
              <p className="text-sm text-stone-500">Địa chỉ nhà vườn</p>
              <p className="font-semibold text-stone-900">{SITE.address}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <a href={SITE.zalo} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-xl bg-sky-500 py-3 text-center font-semibold text-white hover:bg-sky-600">
              💬 Chat Zalo
            </a>
            <a href={SITE.facebook} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-xl bg-blue-600 py-3 text-center font-semibold text-white hover:bg-blue-700">
              📘 Facebook
            </a>
          </div>

          {/* Google Map embed — thay src bằng mã nhúng thật trong production */}
          <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-100 text-stone-500">
            🗺️ Google Map nhúng tại đây (cấu hình trong CMS / Settings)
          </div>
        </div>

        {/* Form liên hệ — POST /contacts khi backend chạy */}
        <form className="h-fit rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="font-bold text-stone-900">Gửi lời nhắn</h2>
          <p className="mt-1 text-sm text-stone-500">
            Cần báo giá nhanh? Dùng <a href="/bao-gia" className="font-medium text-green-700 underline">giỏ báo giá</a> để
            được phản hồi sớm nhất.
          </p>
          <div className="mt-4 space-y-3">
            <input required placeholder="Họ và tên *" className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-green-600 focus:outline-none" />
            <input placeholder="Công ty" className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-green-600 focus:outline-none" />
            <input required placeholder="Số điện thoại *" className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-green-600 focus:outline-none" />
            <input type="email" placeholder="Email" className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-green-600 focus:outline-none" />
            <textarea required rows={5} placeholder="Nội dung *" className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-green-600 focus:outline-none" />
          </div>
          <button type="submit" className="mt-4 w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700">
            Gửi lời nhắn
          </button>
        </form>
      </div>
    </div>
  );
}
