"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartOptionSelection = {
  groupId: number;
  groupName: string;
  valueId: number;
  valueLabel: string;
  price: number; // لأغراض العرض فقط، السعر الحقيقي يُحسب من الخادم عند إتمام الطلب
};

export type CartItem = {
  clientId: string;
  productId: number;
  productSlug: string;
  productName: string;
  productImage: string | null;
  unitPriceEstimate: number;
  quantity: number;
  selectedOptions: CartOptionSelection[];
  cakeMessage?: string | null;
  note?: string | null;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "clientId">) => void;
  removeItem: (clientId: string) => void;
  updateQuantity: (clientId: string, quantity: number) => void;
  clearCart: () => void;
  subtotalEstimate: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "melty-cake-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // تجاهل أي خطأ قراءة، تبدأ السلة فارغة
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // تجاهل أخطاء التخزين
    }
  }, [items, hydrated]);

  const addItem: CartContextValue["addItem"] = (item) => {
    setItems((prev) => [...prev, { ...item, clientId: crypto.randomUUID() }]);
  };

  const removeItem: CartContextValue["removeItem"] = (clientId) => {
    setItems((prev) => prev.filter((i) => i.clientId !== clientId));
  };

  const updateQuantity: CartContextValue["updateQuantity"] = (clientId, quantity) => {
    setItems((prev) =>
      prev.map((i) => (i.clientId === clientId ? { ...i, quantity: Math.max(1, quantity) } : i))
    );
  };

  const clearCart = () => setItems([]);

  const subtotalEstimate = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPriceEstimate * i.quantity, 0),
    [items]
  );
  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotalEstimate, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
