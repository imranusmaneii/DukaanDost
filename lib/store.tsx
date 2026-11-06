"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { makeT } from "./i18n";
import { useAuth } from "./auth";
import {
  createProduct as createProductRecord,
  createShop as createShopRecord,
  deleteProduct as deleteProductRecord,
  getOrders,
  getProducts,
  getShopByOwner,
  updateOrder,
  updateProduct as updateProductRecord,
  updateShop as updateShopRecord,
} from "./data";
import type {
  Lang,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  Shop,
  ShopInput,
} from "./types";

const LANG_KEY = "dukaandost:lang";

export const EMPTY_SHOP: Shop = {
  id: "",
  ownerId: "",
  name: "Your shop",
  slug: "",
  ownerName: "",
  tagline: "",
  description: "",
  whatsappNumber: "",
  logoEmoji: "🏪",
  logoColor: "royal",
  logoUrl: null,
  isOpen: true,
  paymentMethods: ["cod"],
  paymentAccounts: { easypaisa: "", jazzcash: "", bank: "" },
  deliveryNote: "",
  language: "en",
  createdAt: "",
};

interface StoreContextValue {
  shop: Shop;
  products: Product[];
  orders: Order[];
  lang: Lang;
  hydrated: boolean;
  hasShop: boolean;
  error: string;
  t: (key: string) => string;
  setLang: (lang: Lang) => void;
  createShop: (input: ShopInput) => Promise<Shop>;
  updateShop: (patch: Partial<Shop>) => Promise<void>;
  addProduct: (input: Omit<Product, "id" | "shopId">) => Promise<Product>;
  updateProduct: (id: string, patch: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  setOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  setPaymentStatus: (id: string, status: PaymentStatus) => Promise<void>;
  refresh: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function readLang(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(LANG_KEY);
  return stored === "ur" ? "ur" : "en";
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, refreshProfile } = useAuth();
  const [shop, setShop] = useState<Shop>(EMPTY_SHOP);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [hasShop, setHasShop] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState("");
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    setLangState(readLang());
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
    try {
      window.localStorage.setItem(LANG_KEY, lang);
    } catch {
      // storage may be unavailable
    }
  }, [lang]);

  const load = useCallback(
    async (userId: string | null) => {
      setHydrated(false);
      setError("");
      if (!userId) {
        setShop(EMPTY_SHOP);
        setProducts([]);
        setOrders([]);
        setHasShop(false);
        setHydrated(true);
        return;
      }
      try {
        const nextShop = await getShopByOwner(userId);
        if (!nextShop) {
          setShop(EMPTY_SHOP);
          setProducts([]);
          setOrders([]);
          setHasShop(false);
          return;
        }
        const [nextProducts, nextOrders] = await Promise.all([
          getProducts(nextShop.id),
          getOrders(nextShop.id),
        ]);
        setShop(nextShop);
        setProducts(nextProducts);
        setOrders(nextOrders);
        setHasShop(true);
        const stored = window.localStorage.getItem(LANG_KEY);
        if (!stored) setLangState(nextShop.language);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not load shop");
        setShop(EMPTY_SHOP);
        setProducts([]);
        setOrders([]);
        setHasShop(false);
      } finally {
        setHydrated(true);
      }
    },
    [],
  );

  useEffect(() => {
    if (authLoading) return;
    void load(user?.id ?? null);
  }, [authLoading, user?.id, load]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    setShop((prev) => ({ ...prev, language: next }));
  }, []);

  const createShop = useCallback(
    async (input: ShopInput) => {
      if (!user) throw new Error("Please sign in first.");
      const created = await createShopRecord(user.id, input);
      setShop(created);
      setProducts([]);
      setOrders([]);
      setHasShop(true);
      await refreshProfile();
      return created;
    },
    [user, refreshProfile],
  );

  const updateShop = useCallback(
    async (patch: Partial<Shop>) => {
      setShop((prev) => ({ ...prev, ...patch, language: patch.language ?? lang }));
      if (patch.language) setLangState(patch.language);
      if (!shop.id) return;
      try {
        await updateShopRecord(shop.id, patch);
        if (patch.ownerName) await refreshProfile();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not save shop");
        throw cause;
      }
    },
    [shop.id, lang, refreshProfile],
  );

  const addProduct = useCallback(
    async (input: Omit<Product, "id" | "shopId">) => {
      if (!shop.id) throw new Error("Create your shop first.");
      const created = await createProductRecord(shop.id, input);
      setProducts((prev) => [...prev, created]);
      return created;
    },
    [shop.id],
  );

  const updateProduct = useCallback(
    async (id: string, patch: Partial<Product>) => {
      const previous = products;
      setProducts((prev) =>
        prev.map((product) =>
          product.id === id ? { ...product, ...patch } : product,
        ),
      );
      try {
        await updateProductRecord(id, patch);
      } catch (cause) {
        setProducts(previous);
        setError(
          cause instanceof Error ? cause.message : "Could not save product",
        );
        throw cause;
      }
    },
    [products],
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      const previous = products;
      setProducts((prev) => prev.filter((product) => product.id !== id));
      try {
        await deleteProductRecord(id);
      } catch (cause) {
        setProducts(previous);
        setError(
          cause instanceof Error ? cause.message : "Could not delete product",
        );
        throw cause;
      }
    },
    [products],
  );

  const setPaymentStatus = useCallback(
    async (id: string, status: PaymentStatus) => {
      const previous = orders;
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, paymentStatus: status } : order,
        ),
      );
      try {
        await updateOrder(id, { paymentStatus: status });
      } catch (cause) {
        setOrders(previous);
        setError(
          cause instanceof Error ? cause.message : "Could not update payment",
        );
        throw cause;
      }
    },
    [orders],
  );

  const setOrderStatus = useCallback(
    async (id: string, status: OrderStatus) => {
      const previous = orders;
      const paymentStatus: PaymentStatus | undefined =
        status === "paid" ? "paid" : undefined;
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id
            ? {
                ...order,
                orderStatus: status,
                paymentStatus:
                  status === "paid" ? "paid" : order.paymentStatus,
              }
            : order,
        ),
      );
      try {
        await updateOrder(id, { orderStatus: status, paymentStatus });
      } catch (cause) {
        setOrders(previous);
        setError(
          cause instanceof Error ? cause.message : "Could not update order",
        );
        throw cause;
      }
    },
    [orders],
  );

  const refresh = useCallback(async () => {
    await load(user?.id ?? null);
  }, [load, user?.id]);

  const t = useMemo(() => makeT(lang), [lang]);

  const value = useMemo<StoreContextValue>(
    () => ({
      shop,
      products,
      orders,
      lang,
      hydrated,
      hasShop,
      error,
      t,
      setLang,
      createShop,
      updateShop,
      addProduct,
      updateProduct,
      deleteProduct,
      setOrderStatus,
      setPaymentStatus,
      refresh,
    }),
    [
      shop,
      products,
      orders,
      lang,
      hydrated,
      hasShop,
      error,
      t,
      setLang,
      createShop,
      updateShop,
      addProduct,
      updateProduct,
      deleteProduct,
      setOrderStatus,
      setPaymentStatus,
      refresh,
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
