"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createSeedState } from "./seed";
import { makeT } from "./i18n";
import type {
  CheckoutDetails,
  Lang,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  Shop,
  ShopState,
} from "./types";
import { uid } from "./utils";

const STORAGE_KEY = "dukaandost:v1";

interface StoreContextValue extends ShopState {
  hydrated: boolean;
  t: (key: string) => string;
  setLang: (lang: Lang) => void;
  addToCart: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  placeOrder: (details: CheckoutDetails) => Order | null;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  setOrderStatus: (id: string, status: OrderStatus) => void;
  setPaymentStatus: (id: string, status: PaymentStatus) => void;
  addProduct: (
    input: Omit<Product, "id"> & { id?: string },
  ) => Product;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateShop: (patch: Partial<Shop>) => void;
  resetDemo: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ShopState>(() => createSeedState());
  const [hydrated, setHydrated] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ShopState;
        if (parsed?.shop && Array.isArray(parsed.products)) {
          setState({
            ...createSeedState(),
            ...parsed,
            cart: Array.isArray(parsed.cart) ? parsed.cart : [],
          });
        }
      }
    } catch {
      // ignore corrupt storage and fall back to demo data
    }
    hydratedRef.current = true;
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage may be unavailable in private mode
    }
  }, [state]);

  const setLang = useCallback((lang: Lang) => {
    setState((prev) => ({
      ...prev,
      lang,
      shop: { ...prev.shop, language: lang },
    }));
  }, []);

  useEffect(() => {
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === "ur" ? "rtl" : "ltr";
  }, [state.lang]);

  const addToCart = useCallback((productId: string, qty = 1) => {
    setState((prev) => {
      const product = prev.products.find((p) => p.id === productId);
      if (!product || !product.inStock) return prev;
      const existing = prev.cart.find((line) => line.productId === productId);
      const nextQty = Math.min((existing?.qty ?? 0) + qty, product.stock);
      return {
        ...prev,
        cart: existing
          ? prev.cart.map((line) =>
              line.productId === productId
                ? { ...line, qty: nextQty }
                : line,
            )
          : [...prev.cart, { productId, qty: nextQty }],
      };
    });
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setState((prev) => {
      const product = prev.products.find((p) => p.id === productId);
      const max = product?.stock ?? 0;
      return {
        ...prev,
        cart:
          qty <= 0
            ? prev.cart.filter((line) => line.productId !== productId)
            : prev.cart.map((line) =>
                line.productId === productId
                  ? { ...line, qty: Math.min(qty, max) }
                  : line,
              ),
      };
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setState((prev) => ({
      ...prev,
      cart: prev.cart.filter((line) => line.productId !== productId),
    }));
  }, []);

  const clearCart = useCallback(() => {
    setState((prev) => ({ ...prev, cart: [] }));
  }, []);

  const cartCount = state.cart.reduce((sum, line) => sum + line.qty, 0);
  const cartSubtotal = state.cart.reduce((sum, line) => {
    const product = state.products.find((p) => p.id === line.productId);
    return sum + (product ? product.price * line.qty : 0);
  }, 0);

  const placeOrder = useCallback(
    (details: CheckoutDetails): Order | null => {
      const items = state.cart
        .map((line) => {
          const product = state.products.find((p) => p.id === line.productId);
          if (!product) return null;
          return {
            productId: product.id,
            name: product.name,
            price: product.price,
            qty: line.qty,
            emoji: product.emoji,
            theme: product.theme,
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item));
      if (items.length === 0) return null;
      const nextNumber =
        state.orders.reduce(
          (max, order) => Math.max(max, order.orderNumber),
          1000,
        ) + 1;
      const order: Order = {
        id: uid("order"),
        orderNumber: nextNumber,
        customerName: details.customerName.trim(),
        customerPhone: details.customerPhone.trim(),
        address: details.address.trim(),
        items,
        total: items.reduce((sum, item) => sum + item.price * item.qty, 0),
        paymentMethod: details.paymentMethod,
        paymentStatus: "pending",
        orderStatus: "pending",
        note: details.note?.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        orders: [order, ...prev.orders],
        products: prev.products.map((product) => {
          const item = items.find((entry) => entry.productId === product.id);
          if (!item) return product;
          const stock = Math.max(0, product.stock - item.qty);
          return { ...product, stock, inStock: stock > 0 };
        }),
        cart: [],
      }));
      return order;
    },
    [state],
  );

  const updateOrder = useCallback((id: string, patch: Partial<Order>) => {
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((order) =>
        order.id === id ? { ...order, ...patch } : order,
      ),
    }));
  }, []);

  const setOrderStatus = useCallback(
    (id: string, status: OrderStatus) => {
      setState((prev) => ({
        ...prev,
        orders: prev.orders.map((order) =>
          order.id === id
            ? {
                ...order,
                orderStatus: status,
                paymentStatus:
                  status === "paid" ? "paid" : order.paymentStatus,
              }
            : order,
        ),
      }));
    },
    [],
  );

  const setPaymentStatus = useCallback(
    (id: string, status: PaymentStatus) => {
      setState((prev) => ({
        ...prev,
        orders: prev.orders.map((order) =>
          order.id === id ? { ...order, paymentStatus: status } : order,
        ),
      }));
    },
    [],
  );

  const addProduct = useCallback(
    (input: Omit<Product, "id"> & { id?: string }) => {
      const product: Product = { ...input, id: input.id ?? uid("p") };
      setState((prev) => ({
        ...prev,
        products: [...prev.products, product],
      }));
      return product;
    },
    [],
  );

  const updateProduct = useCallback((id: string, patch: Partial<Product>) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((product) =>
        product.id === id ? { ...product, ...patch } : product,
      ),
    }));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.filter((product) => product.id !== id),
      cart: prev.cart.filter((line) => line.productId !== id),
    }));
  }, []);

  const updateShop = useCallback((patch: Partial<Shop>) => {
    setState((prev) => ({
      ...prev,
      shop: { ...prev.shop, ...patch },
      lang: patch.language ?? prev.lang,
    }));
  }, []);

  const resetDemo = useCallback(() => {
    const fresh = createSeedState();
    setState((prev) => ({ ...fresh, lang: prev.lang }));
  }, []);

  const t = useMemo(() => makeT(state.lang), [state.lang]);

  const value = useMemo<StoreContextValue>(
    () => ({
      ...state,
      hydrated,
      t,
      setLang,
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      cartCount,
      cartSubtotal,
      placeOrder,
      updateOrder,
      setOrderStatus,
      setPaymentStatus,
      addProduct,
      updateProduct,
      deleteProduct,
      updateShop,
      resetDemo,
    }),
    [
      state,
      hydrated,
      t,
      setLang,
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      cartCount,
      cartSubtotal,
      placeOrder,
      updateOrder,
      setOrderStatus,
      setPaymentStatus,
      addProduct,
      updateProduct,
      deleteProduct,
      updateShop,
      resetDemo,
    ],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
