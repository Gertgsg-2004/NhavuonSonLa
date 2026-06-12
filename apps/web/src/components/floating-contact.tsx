import { SITE } from '@/lib/mock-data';

/** Nút gọi + Zalo nổi — thương lái/đại lý dùng điện thoại là chính */
export function FloatingContact() {
  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col gap-2">
      <a
        href={SITE.zalo}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat Zalo"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500 text-xs font-bold text-white shadow-lg transition-transform hover:scale-105"
      >
        Zalo
      </a>
      <a
        href={`tel:${SITE.hotline.replace(/\s/g, '')}`}
        aria-label="Gọi hotline"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition-transform hover:scale-105"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.2 2.2Z" />
        </svg>
      </a>
    </div>
  );
}
