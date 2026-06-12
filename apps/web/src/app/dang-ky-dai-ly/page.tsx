'use client';

import Link from 'next/link';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

const CUSTOMER_TYPES = [
  { value: 'DAI_LY', label: 'Đại lý phân phối' },
  { value: 'CUA_HANG', label: 'Cửa hàng trái cây' },
  { value: 'SIEU_THI', label: 'Siêu thị' },
  { value: 'THUONG_LAI', label: 'Thương lái' },
  { value: 'CHO_DAU_MOI', label: 'Chợ đầu mối' },
  { value: 'NHA_HANG', label: 'Nhà hàng' },
  { value: 'XUAT_KHAU', label: 'Công ty xuất khẩu' },
];

export default function DealerRegisterPage() {
  const [form, setForm] = useState({
    fullName: '',
    companyName: '',
    customerType: 'DAI_LY',
    taxCode: '',
    phone: '',
    email: '',
    province: '',
    password: '',
  });
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, taxCode: form.taxCode || undefined }),
        signal: AbortSignal.timeout(5000),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
      } else {
        setMessage({ type: 'error', text: Array.isArray(data.message) ? data.message[0] : data.message });
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'Không kết nối được máy chủ. Hãy khởi động API (pnpm dev:api) rồi thử lại.',
      });
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-green-600 focus:outline-none';

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-center text-3xl font-bold text-stone-900">Đăng ký tài khoản đại lý</h1>
      <p className="mt-2 text-center text-sm text-stone-600">
        Tài khoản được nhà vườn xác minh (gọi điện/MST) và kích hoạt trong 24h làm việc — sau đó
        bạn xem được giá sỉ theo bậc và đặt hàng trực tuyến.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-3 rounded-xl border border-stone-200 bg-white p-6">
        <input required placeholder="Họ và tên người liên hệ *" value={form.fullName} onChange={set('fullName')} className={inputCls} />
        <input required placeholder="Tên công ty / hộ kinh doanh *" value={form.companyName} onChange={set('companyName')} className={inputCls} />
        <select value={form.customerType} onChange={set('customerType')} className={inputCls} aria-label="Loại hình kinh doanh">
          {CUSTOMER_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Mã số thuế" value={form.taxCode} onChange={set('taxCode')} className={inputCls} />
          <input placeholder="Tỉnh/TP" value={form.province} onChange={set('province')} className={inputCls} />
        </div>
        <input required placeholder="Số điện thoại *" value={form.phone} onChange={set('phone')} className={inputCls} />
        <input required type="email" placeholder="Email *" value={form.email} onChange={set('email')} className={inputCls} />
        <input
          required
          type="password"
          placeholder="Mật khẩu (≥8 ký tự, có chữ và số) *"
          value={form.password}
          onChange={set('password')}
          className={inputCls}
        />

        {message && (
          <p
            className={`rounded-lg px-3 py-2 text-sm ${
              message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}
          >
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-60"
        >
          {loading ? 'Đang gửi…' : 'Đăng ký'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-stone-600">
        Đã có tài khoản?{' '}
        <Link href="/dang-nhap" className="font-semibold text-green-700 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
