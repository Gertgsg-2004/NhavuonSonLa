import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import { Footer } from '@/components/footer';
import { FloatingContact } from '@/components/floating-contact';
import { Header } from '@/components/header';
import { QuoteCartProvider } from '@/components/quote-cart-context';
import { SITE } from '@/lib/mock-data';
import './globals.css';

const font = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE.name} — Trái cây sỉ tại vườn cho đại lý, siêu thị, xuất khẩu`,
    template: `%s | ${SITE.name}`,
  },
  description:
    'Nhà vườn Sơn La cung cấp sỉ xoài Yên Châu, nhãn Sông Mã, mận hậu Mộc Châu... đạt chuẩn VietGAP/GlobalGAP. Giá theo bậc số lượng, giao xe tải & container toàn quốc, hỗ trợ xuất khẩu.',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: SITE.name,
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE.name,
  url: siteUrl,
  telephone: SITE.hotline,
  email: SITE.email,
  address: { '@type': 'PostalAddress', addressRegion: 'Sơn La', addressCountry: 'VN' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={font.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <QuoteCartProvider>
          <Header />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
          <FloatingContact />
        </QuoteCartProvider>
      </body>
    </html>
  );
}
