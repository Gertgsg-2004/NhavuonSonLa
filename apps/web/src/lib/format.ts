import type { SeasonInfo } from './types';

export function formatVnd(amount: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(amount)}đ`;
}

export function formatQuantity(kg: number): string {
  return kg >= 1000 ? `${kg / 1000} tấn` : `${kg}kg`;
}

/** Tháng có thuộc mùa vụ không — hỗ trợ vụ vắt năm (VD dâu tây: 12 → 4) */
export function isInSeason(season: SeasonInfo, month: number = new Date().getMonth() + 1): boolean {
  return season.startMonth <= season.endMonth
    ? month >= season.startMonth && month <= season.endMonth
    : month >= season.startMonth || month <= season.endMonth;
}

export type SeasonState = 'in-season' | 'upcoming' | 'off-season';

export function seasonState(season: SeasonInfo, month: number = new Date().getMonth() + 1): SeasonState {
  if (isInSeason(season, month)) return 'in-season';
  const next = (month % 12) + 1;
  if (isInSeason(season, next)) return 'upcoming';
  return 'off-season';
}

export const SEASON_BADGE: Record<SeasonState, { label: string; className: string }> = {
  'in-season': { label: 'Đang vào mùa', className: 'bg-green-100 text-green-700' },
  upcoming: { label: 'Sắp vào vụ', className: 'bg-amber-100 text-amber-700' },
  'off-season': { label: 'Hết mùa — đặt trước', className: 'bg-stone-200 text-stone-600' },
};

/** Đơn giá theo bậc số lượng (logic trùng với API) */
export function resolveTierPrice(
  tiers: { minQuantity: number; price: number }[],
  quantity: number,
): number | null {
  const tier = [...tiers].sort((a, b) => a.minQuantity - b.minQuantity).reverse()
    .find((t) => t.minQuantity <= quantity);
  return tier?.price ?? null;
}
