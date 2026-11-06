"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  MapPin,
  MessageCircle,
  Minus,
  Package,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  Trash2,
  Truck,
  User,
  Wallet,
} from "lucide-react";
import { getProducts, getShopBySlug, placeOrder } from "@/lib/data";
import { makeT } from "@/lib/i18n";
import type { Lang, Order, PaymentMethod, Product, Shop } from "@/lib/types";
import {
  PAYMENT_LABELS,
  cn,
  formatMoney,
  themeTile,
  waLink,
} from "@/lib/utils";
import {
  AppLoader,
  Drawer,
  Logo,
  Modal,
  ShopAvatar,
} from "@/components/ui";

interface CartLine {
  productId: string;
  qty: number;
}

export default function StorefrontPage() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">(
    "loading",
  );
  const [loadError, setLoadError] = useState("");
  const [lang, setLang] = useState<Lang>("en");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [query, setQuery] = useState("");
  const [addedId, setAddedId] = useState<string | null>(null);
  const [success, setSuccess] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });
  const [method, setMethod] = useState<PaymentMethod>("cod");

  const t = useMemo(() => makeT(lang), [lang]);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!slug) {
        setStatus("missing");
        return;
      }
      setStatus("loading");
      setLoadError("");
      try {
        const nextShop = await getShopBySlug(slug);
        if (!active) return;
        if (!nextShop) {
          setStatus("missing");
          return;
        }
        const nextProducts = await getProducts(nextShop.id);
        if (!active) return;
        setShop(nextShop);
        setProducts(nextProducts);
        setLang(nextShop.language === "ur" ? "ur" : "en");
        setMethod(nextShop.paymentMethods[0] ?? "cod");
        setStatus("ready");
      } catch (cause) {
        if (!active) return;
        setLoadError(
          cause instanceof Error ? cause.message : "Could not load this shop.",
        );
        setStatus("error");
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!shop) return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
  }, [lang, shop]);

  const cartLines = useMemo(
    () =>
      cart
        .map((line) => {
          const product = products.find((item) => item.id === line.productId);
          return product ? { product, qty: line.qty } : null;
        })
        .filter((line): line is NonNullable<typeof line> => Boolean(line)),
    [cart, products],
  );

  const cartCount = cartLines.reduce((sum, line) => sum + line.qty, 0);
  const subtotal = cartLines.reduce(
    (sum, line) => sum + line.product.price * line.qty,
    0,
  );

  const filtered = products.filter((product) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      product.name.toLowerCase().includes(q) ||
      product.description.toLowerCase().includes(q)
    );
  });

  function add(productId: string) {
    if (!shop?.isOpen) return;
    const product = products.find((item) => item.id === productId);
    if (!product || !product.inStock) return;
    setCart((prev) => {
      const existing = prev.find((line) => line.productId === productId);
      if (existing) {
        return prev.map((line) =>
          line.productId === productId
            ? { ...line, qty: Math.min(product.stock, line.qty + 1) }
            : line,
        );
      }
      return [...prev, { productId, qty: 1 }];
    });
    setAddedId(productId);
    window.setTimeout(() => setAddedId(null), 1200);
  }

  function setQty(productId: string, qty: number) {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    if (qty <= 0) {
      setCart((prev) => prev.filter((line) => line.productId !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((line) =>
        line.productId === productId
          ? { ...line, qty: Math.min(product.stock, qty) }
          : line,
      ),
    );
  }

  function openCart() {
    if (!shop?.isOpen) return;
    setCheckout(false);
    setError("");
    setCartOpen(true);
  }

  async function submitOrder() {
    if (!shop) return;
    const digits = form.phone.replace(/\D/g, "");
    if (!form.name.trim() || digits.length < 10 || !form.address.trim()) {
      setError(t("store.required"));
      return;
    }
    if (cartLines.length === 0) {
      setError(t("store.cartEmpty"));
      return;
    }
    setPlacing(true);
    setError("");
    try {
      const order = await placeOrder(
        shop.id,
        {
          customerName: form.name.trim(),
          customerPhone: form.phone.trim(),
          address: form.address.trim(),
          note: form.note.trim(),
          paymentMethod: method,
        },
        cartLines.map((line) => ({
          product_id: line.product.id,
          qty: line.qty,
        })),
      );
      setSuccess(order);
      setCart([]);
      setCartOpen(false);
      setCheckout(false);
      setForm({ name: "", phone: "", address: "", note: "" });
      void getProducts(shop.id).then(setProducts);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "";
      if (message.includes("SHOP_CLOSED")) {
        setError("This shop has paused new orders. Please try again later.");
      } else if (message.includes("OUT_OF_STOCK")) {
        setError(
          `Sorry, ${message.split(":")[1] ?? "an item"} just went out of stock. Please adjust your cart.`,
        );
        void getProducts(shop.id).then(setProducts);
      } else if (message.includes("PAYMENT_METHOD_NOT_AVAILABLE")) {
        setError("That payment method is not available right now.");
      } else {
        setError("Could not place the order. Please check your details and try again.");
      }
    } finally {
      setPlacing(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#faf7ff]">
        <AppLoader />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="grid min-h-screen place-items-center bg-[#faf7ff] px-4">
        <div className="card w-full max-w-md p-8 text-center">
          <Logo className="justify-center" />
          <h1 className="mt-6 text-xl font-extrabold text-ink">
            Could not load this shop
          </h1>
          <p className="mt-1 text-sm text-ink-muted">{loadError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-primary mt-5 w-full px-4 py-3"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (
    status === "missing" ||
    !shop ||
    !slug
  ) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#faf7ff] px-4">
        <div className="card w-full max-w-md p-8 text-center">
          <Logo className="justify-center" />
          <h1 className="mt-6 text-xl font-extrabold text-ink">
            Shop not found
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            This link does not match any shop. Check the link or browse all
            shops on DukaanDost.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <Link href="/shops" className="btn-primary px-4 py-3">
              Browse all shops
            </Link>
            <Link href="/" className="btn-ghost px-4 py-3">
              Back to DukaanDost
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const closed = !shop.isOpen;

  return (
    <div
      className={cn(
        "min-h-screen bg-[#faf7ff] pb-24 sm:pb-0",
        lang === "ur" && "font-urdu",
      )}
    >
      <header className="sticky top-0 z-30 border-b border-royal-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <ShopAvatar
              emoji={shop.logoEmoji}
              theme={shop.logoColor}
              imageUrl={shop.logoUrl}
              size="sm"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-ink">
                {shop.name}
              </p>
              <p className="truncate text-[11px] text-ink-muted">
                {shop.tagline}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setLang((prev) => (prev === "ur" ? "en" : "ur"))}
              className="chip border border-royal-200 bg-white text-royal-800"
            >
              {lang === "ur" ? "English" : "اردو"}
            </button>
            <button
              type="button"
              onClick={openCart}
              disabled={closed}
              className="btn-primary relative px-3.5 py-2.5 disabled:opacity-50"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">{t("store.cart")}</span>
              {cartCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-gold-300 px-1 text-[10px] font-extrabold text-royal-950">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-royal-radial">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-gold-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-[0.07]" />
        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:py-12">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <ShopAvatar
              emoji={shop.logoEmoji}
              theme={shop.logoColor}
              imageUrl={shop.logoUrl}
              size="lg"
            />
            <div className="min-w-0 flex-1">
              <span
                className={cn(
                  "chip border",
                  closed
                    ? "border-rose-300/30 bg-rose-400/15 text-rose-100"
                    : "border-emerald-300/30 bg-emerald-400/15 text-emerald-200",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    closed ? "bg-rose-300" : "bg-emerald-300",
                  )}
                />
                {closed ? "Closed for orders" : t("store.open")}
              </span>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {shop.name}
              </h1>
              <p className="mt-1 font-semibold text-gold-200">
                {shop.tagline}
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">
                {shop.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {shop.whatsappNumber && (
                  <a
                    href={waLink(
                      shop.whatsappNumber,
                      `Assalam-o-Alaikum! I would like to order from ${shop.name}.`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-gold px-4 py-2.5"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {t("store.contact")}
                  </a>
                )}
                <span className="chip border border-white/15 bg-white/10 text-white/85">
                  <Package className="h-3.5 w-3.5 text-gold-300" />
                  {products.length} {t("store.products")}
                </span>
                {shop.deliveryNote && (
                  <span className="chip border border-white/15 bg-white/10 text-white/85">
                    <Truck className="h-3.5 w-3.5 text-gold-300" />
                    {shop.deliveryNote}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {closed && (
        <div className="mx-auto mt-4 max-w-6xl px-4">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
            This shop has paused new orders. You can still browse the products
            and contact the owner on WhatsApp.
          </div>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-ink">
              <Sparkles className="h-5 w-5 text-gold-500" />
              {t("store.products")}
            </h2>
            <p className="text-xs text-ink-muted">
              {filtered.length} {t("store.items")}
            </p>
          </div>
          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted rtl:left-auto rtl:right-3.5" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("store.searchProducts")}
              className="input pl-10 rtl:pl-4 rtl:pr-10"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-royal-200 bg-white px-6 py-16 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-royal-300" />
            <p className="mt-3 text-sm font-bold text-ink">
              {t("store.noProducts")}
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => {
              const line = cart.find((item) => item.productId === product.id);
              const qty = line?.qty ?? 0;
              const justAdded = addedId === product.id;
              return (
                <article
                  key={product.id}
                  className="card group overflow-hidden transition hover:-translate-y-0.5 hover:border-royal-200 hover:shadow-glow/20"
                >
                  <div
                    className={cn(
                      "relative grid h-44 place-items-center overflow-hidden",
                      themeTile(product.theme),
                    )}
                  >
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-6xl drop-shadow-md transition duration-300 group-hover:scale-110">
                        {product.emoji}
                      </span>
                    )}
                    {!product.inStock && (
                      <div className="absolute inset-0 grid place-items-center bg-ink/55 backdrop-blur-[2px]">
                        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-rose-700">
                          {t("store.outOfStock")}
                        </span>
                      </div>
                    )}
                    {qty > 0 && (
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold text-royal-800 shadow-sm">
                        {qty} {t("store.items")}
                      </span>
                    )}
                    {product.stock <= 3 && product.inStock && (
                      <span className="absolute right-3 top-3 rounded-full bg-ink/50 px-2.5 py-1 text-[10px] font-bold text-white">
                        {product.stock} left
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-extrabold text-ink">
                        {product.name}
                      </h3>
                      <p className="shrink-0 text-sm font-extrabold text-royal-800">
                        <span dir="ltr">{formatMoney(product.price)}</span>
                      </p>
                    </div>
                    <p className="mt-0.5 line-clamp-2 min-h-[2rem] text-xs text-ink-muted">
                      {product.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span
                        className={cn(
                          "flex items-center gap-1 text-[11px] font-bold",
                          product.inStock
                            ? "text-emerald-600"
                            : "text-rose-600",
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            product.inStock
                              ? "bg-emerald-500"
                              : "bg-rose-500",
                          )}
                        />
                        {product.inStock
                          ? t("products.inStock")
                          : t("store.outOfStock")}
                      </span>
                      {!product.inStock || closed ? (
                        <span className="rounded-full bg-royal-50 px-3 py-1.5 text-[11px] font-extrabold text-ink-muted">
                          {closed
                            ? "Closed"
                            : t("store.outOfStock")}
                        </span>
                      ) : qty > 0 ? (
                        <div className="flex items-center gap-1 rounded-full border border-royal-100 bg-white p-1">
                          <button
                            type="button"
                            onClick={() => setQty(product.id, qty - 1)}
                            className="grid h-7 w-7 place-items-center rounded-full bg-royal-50 text-royal-800 transition hover:bg-royal-100"
                            aria-label="Decrease"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-6 text-center text-xs font-extrabold text-ink">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(product.id, qty + 1)}
                            disabled={qty >= product.stock}
                            className="grid h-7 w-7 place-items-center rounded-full bg-royal-700 text-white transition hover:bg-royal-800 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Increase"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => add(product.id)}
                          className={cn(
                            "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-extrabold transition",
                            justAdded
                              ? "bg-emerald-600 text-white"
                              : "bg-royal-700 text-white hover:bg-royal-800",
                          )}
                        >
                          {justAdded ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Plus className="h-3.5 w-3.5" />
                          )}
                          {justAdded ? t("store.added") : t("store.addToCart")}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: MessageCircle,
              title: "WhatsApp confirmation",
              body: "The shop confirms every order personally on WhatsApp.",
            },
            {
              icon: Truck,
              title: "Cash on delivery",
              body: "Pay when your order arrives, or use the shop's online payment methods.",
            },
            {
              icon: Sparkles,
              title: "Made with DukaanDost",
              body: "A simple storefront built for small Pakistani businesses.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-royal-100 bg-white/70 p-4"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold-50 text-gold-700">
                <item.icon className="h-4 w-4" />
              </span>
              <p className="mt-2 text-xs font-extrabold text-ink">
                {item.title}
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-ink-muted">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-royal-100 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:flex-row">
          <div className="flex items-center gap-2 text-xs text-ink-muted">
            <Logo compact />
            <span>
              {t("store.poweredBy")}{" "}
              <Link href="/" className="link">
                DukaanDost
              </Link>
            </span>
          </div>
          <Link
            href="/login?mode=signup"
            className="flex items-center gap-1 text-xs font-extrabold text-royal-700 hover:underline"
          >
            Create your own shop
            <ChevronRight className="h-3.5 w-3.5 flip-rtl" />
          </Link>
        </div>
      </footer>

      {cartCount > 0 && !cartOpen && !closed && (
        <div className="fixed inset-x-3 bottom-3 z-40 sm:hidden">
          <button
            type="button"
            onClick={openCart}
            className="flex w-full items-center justify-between rounded-2xl bg-royal-800 px-4 py-3 text-white shadow-glow"
          >
            <span className="flex items-center gap-2 text-sm font-extrabold">
              <ShoppingCart className="h-4 w-4 text-gold-300" />
              {cartCount} {t("store.items")}
            </span>
            <span className="flex items-center gap-1.5 text-sm font-extrabold">
              <span dir="ltr">{formatMoney(subtotal)}</span>
              <ArrowRight className="h-4 w-4 flip-rtl" />
            </span>
          </button>
        </div>
      )}

      <Drawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        title={checkout ? t("store.checkoutTitle") : t("store.cart")}
        subtitle={
          checkout
            ? t("store.deliveryDetails")
            : `${cartCount} ${t("store.items")}`
        }
        footer={
          cartLines.length === 0 ? undefined : checkout ? (
            <div className="space-y-2">
              {error && (
                <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
                  {error}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-ink-soft">
                  {t("common.total")}
                </span>
                <span className="text-lg font-extrabold text-royal-800">
                  <span dir="ltr">{formatMoney(subtotal)}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => void submitOrder()}
                disabled={placing}
                className="btn-primary w-full py-3 disabled:opacity-60"
              >
                <Check className="h-4 w-4" />
                {placing ? "Placing order…" : t("store.placeOrder")}
              </button>
              <button
                type="button"
                onClick={() => setCheckout(false)}
                className="btn-ghost w-full py-2.5"
              >
                <ArrowLeft className="h-4 w-4 flip-rtl" />
                {t("store.cart")}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between text-ink-soft">
                  <span>{t("store.subtotal")}</span>
                  <span dir="ltr">{formatMoney(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-ink-soft">
                  <span>{t("store.delivery")}</span>
                  <span className="font-bold text-emerald-600">
                    {t("store.free")}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-royal-100 pt-2 font-extrabold text-ink">
                  <span>{t("common.total")}</span>
                  <span dir="ltr">{formatMoney(subtotal)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCheckout(true)}
                className="btn-primary w-full py-3"
              >
                {t("store.checkout")}
                <ArrowRight className="h-4 w-4 flip-rtl" />
              </button>
            </div>
          )
        }
      >
        {cartLines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-royal-50 text-royal-700">
              <ShoppingBag className="h-6 w-6" />
            </span>
            <p className="mt-3 text-sm font-extrabold text-ink">
              {t("store.cartEmpty")}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              {t("store.emptyCartHint")}
            </p>
            <button
              type="button"
              onClick={() => setCartOpen(false)}
              className="btn-soft mt-4 px-4 py-2.5"
            >
              {t("store.continue")}
            </button>
          </div>
        ) : checkout ? (
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="label" htmlFor="checkout-name">
                  {t("store.yourName")}
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted rtl:left-auto rtl:right-3.5" />
                  <input
                    id="checkout-name"
                    value={form.name}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="Sara Khan"
                    className="input pl-10 rtl:pl-4 rtl:pr-10"
                  />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="checkout-phone">
                  {t("store.phone")}
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted rtl:left-auto rtl:right-3.5" />
                  <input
                    id="checkout-phone"
                    value={form.phone}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        phone: event.target.value,
                      }))
                    }
                    placeholder={t("store.phoneHint")}
                    className="input pl-10 rtl:pl-4 rtl:pr-10"
                    dir="ltr"
                    inputMode="tel"
                  />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="checkout-address">
                  {t("store.address")}
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-ink-muted rtl:left-auto rtl:right-3.5" />
                  <textarea
                    id="checkout-address"
                    value={form.address}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        address: event.target.value,
                      }))
                    }
                    placeholder={t("store.addressHint")}
                    rows={2}
                    className="input resize-none pl-10 rtl:pl-4 rtl:pr-10"
                  />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="checkout-note">
                  {t("store.orderNote")}
                </label>
                <textarea
                  id="checkout-note"
                  value={form.note}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, note: event.target.value }))
                  }
                  rows={2}
                  className="input resize-none"
                />
              </div>
            </div>

            <div>
              <p className="label">{t("store.paymentMethod")}</p>
              <div className="grid gap-2">
                {shop.paymentMethods.map((option) => {
                  const active = method === option;
                  const Icon =
                    option === "cod"
                      ? Truck
                      : option === "bank"
                        ? Wallet
                        : Phone;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setMethod(option)}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition rtl:text-right",
                        active
                          ? "border-royal-400 bg-royal-50"
                          : "border-royal-100 hover:bg-royal-50/50",
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-8 w-8 place-items-center rounded-xl",
                          active
                            ? "bg-royal-700 text-white"
                            : "bg-royal-50 text-royal-700",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1 text-xs font-extrabold text-ink">
                        {lang === "ur"
                          ? PAYMENT_LABELS[option].ur
                          : PAYMENT_LABELS[option].en}
                      </span>
                      <span
                        className={cn(
                          "grid h-5 w-5 place-items-center rounded-full border",
                          active
                            ? "border-royal-700 bg-royal-700 text-white"
                            : "border-royal-200",
                        )}
                      >
                        {active && <Check className="h-3 w-3" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-gold-200 bg-gold-50/60 p-4">
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-gold-800">
                {t("store.paymentInstructions")}
              </p>
              {method === "cod" ? (
                <p className="mt-1 text-xs font-semibold text-ink">
                  Pay cash when your order is delivered. The shop will confirm
                  the total on WhatsApp.
                </p>
              ) : (
                <div className="mt-1 space-y-1 text-xs font-semibold text-ink">
                  <p className="text-ink-muted">{t("store.paymentNote")}</p>
                  <p className="text-sm font-extrabold text-royal-900" dir="ltr">
                    {method === "easypaisa" &&
                      `Easypaisa · ${shop.paymentAccounts.easypaisa || "Ask on WhatsApp"}`}
                    {method === "jazzcash" &&
                      `JazzCash · ${shop.paymentAccounts.jazzcash || "Ask on WhatsApp"}`}
                    {method === "bank" &&
                      (shop.paymentAccounts.bank || "Ask on WhatsApp")}
                  </p>
                </div>
              )}
            </div>

            <div>
              <p className="label">{t("store.orderSummary")}</p>
              <ul className="space-y-2">
                {cartLines.map((line) => (
                  <li
                    key={line.product.id}
                    className="flex items-center gap-2.5 rounded-xl border border-royal-100 p-2.5"
                  >
                    <span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-lg bg-royal-50 text-base">
                      {line.product.imageUrl ? (
                        <img
                          src={line.product.imageUrl}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        line.product.emoji
                      )}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs font-bold text-ink">
                      {line.product.name}
                    </span>
                    <span className="text-[11px] font-bold text-ink-muted">
                      ×{line.qty}
                    </span>
                    <span className="text-xs font-extrabold text-ink" dir="ltr">
                      {formatMoney(line.product.price * line.qty)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {cartLines.map((line) => (
              <div
                key={line.product.id}
                className="flex gap-3 rounded-2xl border border-royal-100 p-3"
              >
                <span
                  className={cn(
                    "relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl text-2xl",
                    themeTile(line.product.theme),
                  )}
                >
                  {line.product.imageUrl ? (
                    <img
                      src={line.product.imageUrl}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    line.product.emoji
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-xs font-extrabold text-ink">
                      {line.product.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => setQty(line.product.id, 0)}
                      className="text-ink-muted transition hover:text-rose-600"
                      title={t("store.remove")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="mt-0.5 text-xs font-extrabold text-royal-800">
                    <span dir="ltr">{formatMoney(line.product.price)}</span>
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-full border border-royal-100 bg-white p-0.5">
                      <button
                        type="button"
                        onClick={() => setQty(line.product.id, line.qty - 1)}
                        className="grid h-7 w-7 place-items-center rounded-full bg-royal-50 text-royal-800 transition hover:bg-royal-100"
                        aria-label="Decrease"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-6 text-center text-xs font-extrabold text-ink">
                        {line.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(line.product.id, line.qty + 1)}
                        disabled={line.qty >= line.product.stock}
                        className="grid h-7 w-7 place-items-center rounded-full bg-royal-700 text-white transition hover:bg-royal-800 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Increase"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-xs font-extrabold text-ink">
                      <span dir="ltr">
                        {formatMoney(line.product.price * line.qty)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div className="rounded-2xl bg-royal-50/60 p-3 text-center">
              <p className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-ink-muted">
                <Store className="h-3.5 w-3.5 text-royal-600" />
                {t("store.poweredBy")} DukaanDost
              </p>
            </div>
          </div>
        )}
      </Drawer>

      <Modal open={Boolean(success)} onClose={() => setSuccess(null)} size="sm">
        {success && (
          <div className="pb-1 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
              <Check className="h-8 w-8" strokeWidth={3} />
            </span>
            <h2 className="mt-4 text-xl font-extrabold text-ink">
              {t("store.orderPlaced")}
            </h2>
            <p className="mx-auto mt-1 max-w-xs text-sm text-ink-muted">
              {t("store.orderPlacedHint")}
            </p>
            <div className="mt-4 rounded-2xl border border-royal-100 bg-royal-50/60 p-4 text-left rtl:text-right">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wide text-ink-muted">
                  {t("store.orderNumber")}
                </span>
                <span className="text-sm font-extrabold text-royal-800">
                  #{success.orderNumber}
                </span>
              </div>
              <ul className="mt-2 space-y-1">
                {success.items.map((item) => (
                  <li
                    key={`${item.productId}-${item.name}`}
                    className="flex items-center justify-between text-xs text-ink-soft"
                  >
                    <span>
                      {item.qty} × {item.name}
                    </span>
                    <span dir="ltr">{formatMoney(item.price * item.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex items-center justify-between border-t border-royal-200/60 pt-2">
                <span className="text-xs font-extrabold text-ink">
                  {t("common.total")}
                </span>
                <span className="text-sm font-extrabold text-royal-800">
                  <span dir="ltr">{formatMoney(success.total)}</span>
                </span>
              </div>
            </div>
            {shop.whatsappNumber && (
              <a
                href={waLink(
                  shop.whatsappNumber,
                  `Assalam-o-Alaikum! I just placed order #${success.orderNumber} on ${shop.name}. Please confirm it.`,
                )}
                target="_blank"
                rel="noreferrer"
                className="btn-primary mt-4 w-full py-3"
              >
                <MessageCircle className="h-4 w-4" />
                {t("store.whatsappConfirm")}
              </a>
            )}
            <button
              type="button"
              onClick={() => setSuccess(null)}
              className="btn-ghost mt-2 w-full py-2.5"
            >
              {t("store.continue")}
            </button>
            <p className="mt-3 text-[11px] font-semibold text-ink-muted">
              {t("store.visitAgain")}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
