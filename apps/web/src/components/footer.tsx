import Link from 'next/link';
import { SITE } from '@/lib/mock-data';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-stone-200 bg-stone-900 text-stone-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-lg">
              🍃
            </span>
            <span className="text-lg font-bold text-white">{SITE.name}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed">
            Nguồn trái cây sỉ từ cao nguyên Sơn La — vùng trồng đạt chuẩn VietGAP/GlobalGAP, giao
            xe tải &amp; container toàn quốc, hỗ trợ hồ sơ xuất khẩu.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Khám phá</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-white" href="/san-pham">Sản phẩm</Link></li>
            <li><Link className="hover:text-white" href="/mua-vu">Lịch mùa vụ</Link></li>
            <li><Link className="hover:text-white" href="/tin-tuc">Tin tức &amp; giá thị trường</Link></li>
            <li><Link className="hover:text-white" href="/gioi-thieu">Về nhà vườn</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Dành cho đối tác</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-white" href="/bao-gia">Yêu cầu báo giá</Link></li>
            <li><Link className="hover:text-white" href="/dang-ky-dai-ly">Đăng ký đại lý</Link></li>
            <li><Link className="hover:text-white" href="/dang-nhap">Đăng nhập</Link></li>
            <li><Link className="hover:text-white" href="/lien-he">Liên hệ hợp tác</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Liên hệ</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>📍 {SITE.address}</li>
            <li>
              ☎️ Hotline:{' '}
              <a className="font-semibold text-white" href={`tel:${SITE.hotline.replace(/\s/g, '')}`}>
                {SITE.hotline}
              </a>
            </li>
            <li>✉️ <a className="hover:text-white" href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
            <li>
              💬 <a className="hover:text-white" href={SITE.zalo} target="_blank" rel="noopener noreferrer">Zalo</a>
              {' · '}
              <a className="hover:text-white" href={SITE.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-stone-800 py-4 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} {SITE.name}. Chuyên cung cấp sỉ nông sản cho đại lý, siêu thị,
        chợ đầu mối, nhà hàng và xuất khẩu.
      </div>
    </footer>
  );
}
