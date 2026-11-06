"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronRight,
  MapPin,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
} from "lucide-react";
import { getAllShops, type DirectoryShop } from "@/lib/data";
import { cn, formatMoney } from "@/lib/utils";
import { AppLoader, Logo, ShopAvatar } from "@/components/ui";

export default function ShopsDirectoryPage() {
  const [shops, setShops] = useState<DirectoryShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await getAllShops();
        if (active) setShops(data);
      } catch (cause) {
        if (active) {
          setError(
            cause instanceof Error ? cause.message : "Could not load shops.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return shops;
    return shops.filter((shop) => {
      const haystack = `${shop.name} ${shop.tagline} ${shop.description} ${shop.ownerName}`;
      return haystack.toLowerCase().includes(q);
    });
  }, [shops, query]);

  return (
    <div className="min-h-screen bg-[#faf7ff]">
      <header className="sticky top-0 z-30 border-b border-royal-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/">
            <Logo compact />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost px-3 py-2 text-xs">
              Sign in
            </Link>
            <Link
              href="/login?mode=signup"
              className="btn-primary px-3.5 py-2 text-xs"
            >
              Create shop
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-royal-radial">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-gold-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-[0.07]" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <span className="chip border border-gold-300/30 bg-gold-300/15 text-gold-200">
            <Sparkles className="h-3.5 w-3.5" />
            Discover local shops
          </span>
          <h1 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Every dukaan on DukaanDost, in one place.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
            Browse real storefronts built by small business owners. Order
            directly on WhatsApp or check out online in seconds.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Link
              href="/login?mode=signup"
              className="btn-gold justify-center px-5 py-3"
            >
              Open your own shop
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="btn-ghost justify-center border border-white/20 bg-white/5 px-5 py-3 text-white hover:bg-white/10"
            >
              Back to home
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-ink">
              <Store className="h-5 w-5 text-royal-700" />
              All shops
            </h2>
            <p className="mt-1 text-xs text-ink-muted">
              {loading
                ? "Loading shops…"
                : `${filtered.length} ${
                    filtered.length === 1 ? "shop" : "shops"
                  } found`}
            </p>
          </div>
          <div className="relative sm:w-80">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search shops or products…"
              className="input pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-16">
            <AppLoader label="Loading shops…" />
          </div>
        ) : error ? (
          <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-12 text-center">
            <p className="text-sm font-bold text-rose-700">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-primary mt-4 px-4 py-2.5"
            >
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-royal-200 bg-white px-6 py-16 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-royal-300" />
            <p className="mt-3 text-sm font-bold text-ink">
              {shops.length === 0
                ? "No shops yet. Be the first to open one!"
                : "No shops match your search."}
            </p>
            {shops.length === 0 && (
              <Link
                href="/login?mode=signup"
                className="btn-primary mt-4 px-4 py-2.5"
              >
                Create your shop
              </Link>
            )}
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((shop) => {
              const preview = shop.products.slice(0, 3);
              return (
                <Link
                  key={shop.id}
                  href={`/shop/${shop.slug}`}
                  className="card group overflow-hidden transition hover:-translate-y-0.5 hover:border-royal-200 hover:shadow-glow/20"
                >
                  <div className="relative h-24 bg-royal-radial">
                    <div className="pointer-events-none absolute -right-6 -top-10 h-28 w-28 rounded-full bg-gold-300/20 blur-xl" />
                    <div className="absolute -bottom-6 left-4">
                      <ShopAvatar
                        emoji={shop.logoEmoji}
                        theme={shop.logoColor}
                        imageUrl={shop.logoUrl}
                        size="lg"
                      />
                    </div>
                    <span
                      className={cn(
                        "absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-extrabold",
                        shop.isOpen
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700",
                      )}
                    >
                      {shop.isOpen ? "Open" : "Closed"}
                    </span>
                  </div>
                  <div className="p-4 pt-8">
                    <h3 className="truncate text-sm font-extrabold text-ink">
                      {shop.name}
                    </h3>
                    <p className="mt-0.5 line-clamp-2 min-h-[2rem] text-xs text-ink-muted">
                      {shop.tagline || shop.description}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold text-ink-muted">
                      <span className="chip bg-royal-50 text-royal-700">
                        <Package className="h-3 w-3" />
                        {shop.products.length}{" "}
                        {shop.products.length === 1 ? "item" : "items"}
                      </span>
                      {shop.ownerName && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {shop.ownerName}
                        </span>
                      )}
                    </div>
                    {preview.length > 0 && (
                      <div className="mt-3 flex items-center gap-1.5">
                        {preview.map((product) => (
                          <span
                            key={product.id}
                            className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-lg bg-royal-50 text-sm"
                          >
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt=""
                                className="absolute inset-0 h-full w-full object-cover"
                              />
                            ) : (
                              product.emoji
                            )}
                          </span>
                        ))}
                        {shop.products.length > 3 && (
                          <span className="text-[10px] font-extrabold text-ink-muted">
                            +{shop.products.length - 3}
                          </span>
                        )}
                        <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-extrabold text-royal-700">
                          Visit shop
                          <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    )}
                    {shop.products.length > 0 && (
                      <p className="mt-2 text-[10px] font-semibold text-ink-muted">
                        From{" "}
                        <span dir="ltr">
                          {formatMoney(
                            Math.min(...shop.products.map((p) => p.price)),
                          )}
                        </span>
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <footer className="mt-8 border-t border-royal-100 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:flex-row">
          <Logo compact />
          <p className="text-xs text-ink-muted">
            Built for small businesses across Pakistan.
          </p>
        </div>
      </footer>
    </div>
  );
}
