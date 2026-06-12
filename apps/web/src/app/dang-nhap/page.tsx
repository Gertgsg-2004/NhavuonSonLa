'use client';

import Link from 'next/link';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(5000),
      });
      const data = await res.json();
      if (res.ok) {
        window.localStorage.setItem('nhavuon.accessToken', data.accessToken);
        setMessage({
          type: 'success',
          text: `Xin chào ${data.user?.fullName ?? ''}! Đăng nhập thành công — khu vực đại lý (/tai-khoan) sẽ ra mắt ở Giai đoạn 2.`,
        });
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

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-center text-3xl font-bold text-stone-900">Đăng nhập đại lý</h1>
      <p className="mt-2 text-center text-sm text-stone-600">
        Xem giá sỉ theo bậc, chiết khấu riêng, lịch sử đơn hàng và công nợ.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-xl border border-stone-200 bg-white p-6">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-green-600 focus:outline-none"
        />
        <input
          type="password"
          required
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-green-600 focus:outline-none"
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
          {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-stone-600">
        Chưa có tài khoản?{' '}
        <Link href="/dang-ky-dai-ly" className="font-semibold text-green-700 hover:underline">
          Đăng ký đại lý →
        </Link>
      </p>
    </div>
  );
}
