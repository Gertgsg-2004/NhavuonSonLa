import Link from 'next/link';

export function SectionHeading({
  title,
  subtitle,
  moreHref,
  moreLabel = 'Xem tất cả →',
}: {
  title: string;
  subtitle?: string;
  moreHref?: string;
  moreLabel?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-stone-900">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-stone-600">{subtitle}</p>}
      </div>
      {moreHref && (
        <Link href={moreHref} className="shrink-0 text-sm font-semibold text-green-700 hover:text-green-800">
          {moreLabel}
        </Link>
      )}
    </div>
  );
}
