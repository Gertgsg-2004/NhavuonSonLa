'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuoteCart } from '@/components/quote-cart-context';
import { submitQuoteRequest } from '@/lib/api';
import { formatQuantity } from '@/lib/format';
import { SITE } from '@/lib/mock-data';

interface FormState {
  fullName: string;
  companyName: string;
  phone: string;
  email: string;
  deliveryDate: string;
  deliveryAddress: string;
  note: string;
}

const EMPTY_FORM: FormState = {
  fullName: '',
  companyName: '',
  phone: '',
  email: '',
  deliveryDate: '',
  deliveryAddress: '',
  note: '',
};

export default function QuoteCartPage() {
  const { items, updateQuantity, updateNote, removeItem, clear } = useQuoteCart();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ code: string; demo: boolean } | null>(null);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (items.length === 0) {
      setError('Giỏ báo giá đang trống — hãy thêm sản phẩm trước.');
      return;
    }
    if (!/^(0|\+84)\d{9,10}$/.test(form.phone.replace(/\s/g, ''))) {
      setError('Số điện thoại không hợp lệ.');
      return;
    }
    setSubmitting(true);
    try {
      const noteParts = [
        form.deliveryDate && `Ngày giao mong muốn: ${form.deliveryDate}`,
        form.deliveryAddress && `Địa điểm giao: ${form.deliveryAddress}`,
        form.note,
      ].filter(Boolean);
      const res = await submitQuoteRequest({
        fullName: form.fullName,
        companyName: form.companyName || undefined,
        phone: form.phone.replace(/\s/g, ''),
        email: form.email || undefined,
        note: noteParts.join('\n') || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unit: i.unit,
          note: i.note,
        })),
      });
      setResult(res);
      clear();
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="text-6xl">✅</div>
        <h1 className="mt-4 text-3xl font-bold text-stone-900">Đã nhận yêu cầu báo giá!</h1>
        <p className="mt-3 text-stone-600">
          Mã yêu cầu của bạn: <strong className="text-green-700">{result.code}</strong>
          <br />
          Nhân viên kinh doanh sẽ liên hệ và gửi báo giá chi tiết trong <strong>2 giờ làm việc</strong>.
        </p>
        {result.demo && (
          <p className="mt-3 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-700">
            (Chế độ demo: API backend chưa chạy nên yêu cầu chưa được lưu — khởi động
            <code className="mx-1">apps/api</code> để nhận yêu cầu thật.)
          </p>
        )}
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/san-pham" className="rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white hover:bg-green-700">
            Tiếp tục xem sản phẩm
          </Link>
          <a href={SITE.zalo} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-sky-500 px-5 py-2.5 font-semibold text-white hover:bg-sky-600">
            Chat Zalo ngay
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-900">Giỏ báo giá</h1>
      <p className="mt-2 max-w-2xl text-stone-600">
        Khác với mua lẻ: bạn gửi danh sách sản phẩm + khối lượng, nhà vườn sẽ <strong>báo giá theo
        mùa vụ và số lượng</strong>, xác nhận tồn kho và lịch giao trước khi chốt đơn. Không cần
        thanh toán trước.
      </p>

      {items.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-stone-300 p-14 text-center">
          <p className="text-4xl">🧺</p>
          <p className="mt-3 text-stone-600">Giỏ báo giá đang trống.</p>
          <Link
            href="/san-pham"
            className="mt-4 inline-block rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white hover:bg-green-700"
          >
            Chọn sản phẩm →
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_400px]">
          {/* Danh sách sản phẩm */}
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-4 rounded-xl border border-stone-200 bg-white p-4">
                <div
                  className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-4xl ${item.gradient}`}
                >
                  {item.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/san-pham/${item.slug}`} className="font-semibold text-stone-900 hover:text-green-700">
                      {item.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="text-sm text-stone-400 hover:text-red-600"
                      aria-label={`Xóa ${item.name}`}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-stone-600">
                      Khối lượng:
                      <input
                        type="number"
                        min={item.minOrderQuantity}
                        step={10}
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                        className="w-24 rounded-lg border border-stone-300 px-2 py-1.5 text-sm focus:border-green-600 focus:outline-none"
                      />
                      {item.unit}
                    </label>
                    <span className="text-xs text-stone-400">
                      = {formatQuantity(item.quantity)} · tối thiểu {item.minOrderQuantity}{item.unit}
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="Ghi chú cho sản phẩm này (size, độ chín, quy cách đóng...)"
                    value={item.note ?? ''}
                    onChange={(e) => updateNote(item.productId, e.target.value)}
                    className="mt-2 w-full rounded-lg border border-stone-200 px-3 py-1.5 text-sm focus:border-green-600 focus:outline-none"
                  />
                </div>
              </div>
            ))}
            <Link href="/san-pham" className="inline-block text-sm font-medium text-green-700 hover:underline">
              + Thêm sản phẩm khác
            </Link>
          </div>

          {/* Form gửi yêu cầu */}
          <form onSubmit={handleSubmit} className="h-fit rounded-xl border border-stone-200 bg-white p-5">
            <h2 className="font-bold text-stone-900">Thông tin nhận báo giá</h2>
            <div className="mt-4 space-y-3">
              <input required placeholder="Họ và tên *" value={form.fullName} onChange={set('fullName')}
                className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-green-600 focus:outline-none" />
              <input placeholder="Công ty / cửa hàng" value={form.companyName} onChange={set('companyName')}
                className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-green-600 focus:outline-none" />
              <input required placeholder="Số điện thoại *" value={form.phone} onChange={set('phone')}
                className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-green-600 focus:outline-none" />
              <input type="email" placeholder="Email" value={form.email} onChange={set('email')}
                className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-green-600 focus:outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" aria-label="Ngày giao mong muốn" value={form.deliveryDate} onChange={set('deliveryDate')}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm text-stone-600 focus:border-green-600 focus:outline-none" />
                <input placeholder="Nơi giao (tỉnh/chợ)" value={form.deliveryAddress} onChange={set('deliveryAddress')}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-green-600 focus:outline-none" />
              </div>
              <textarea rows={3} placeholder="Ghi chú chung (hình thức thanh toán, yêu cầu chứng từ...)" value={form.note} onChange={set('note')}
                className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-green-600 focus:outline-none" />
            </div>

            {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 w-full rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-orange-700 disabled:opacity-60"
            >
              {submitting ? 'Đang gửi…' : `Gửi yêu cầu báo giá (${items.length} sản phẩm)`}
            </button>
            <p className="mt-3 text-center text-xs text-stone-500">
              Phản hồi trong 2 giờ làm việc · Hotline {SITE.hotline}
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
