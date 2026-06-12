'use client';

/**
 * Giỏ báo giá — khác giỏ hàng B2C: gom sản phẩm + khối lượng để gửi
 * MỘT yêu cầu báo giá, không thanh toán tức thì. Lưu localStorage,
 * không yêu cầu đăng nhập.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { QuoteCartItem } from '@/lib/types';

const STORAGE_KEY = 'nhavuon.quote-cart.v1';

interface QuoteCartContextValue {
  items: QuoteCartItem[];
  count: number;
  addItem: (item: QuoteCartItem) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateNote: (productId: string, note: string) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

const QuoteCartContext = createContext<QuoteCartContextValue | null>(null);

export function QuoteCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<QuoteCartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as QuoteCartItem[]);
    } catch {
      // dữ liệu hỏng → bỏ qua
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((item: QuoteCartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i,
        );
      }
      return [...prev, item];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, quantity) } : i)),
    );
  }, []);

  const updateNote = useCallback((productId: string, note: string) => {
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, note } : i)));
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, count: items.length, addItem, updateQuantity, updateNote, removeItem, clear }),
    [items, addItem, updateQuantity, updateNote, removeItem, clear],
  );

  return <QuoteCartContext.Provider value={value}>{children}</QuoteCartContext.Provider>;
}

export function useQuoteCart(): QuoteCartContextValue {
  const ctx = useContext(QuoteCartContext);
  if (!ctx) throw new Error('useQuoteCart phải dùng bên trong <QuoteCartProvider>');
  return ctx;
}
