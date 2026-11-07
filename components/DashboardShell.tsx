"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import {
  ArrowUpRight,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { cn, shopHost } from "@/lib/utils";
import {
  AppLoader,
  LangToggle,
  Logo,
  ShopAvatar,
} from "@/components/ui";

const NAV = [
  { href: "/dashboard", key: "nav.overview", icon: LayoutDashboard },
  { href: "/dashboard/orders", key: "nav.orders", icon: ShoppingBag },
  { href: "/dashboard/products", key: "nav.products", icon: Package },
  { href: "/dashboard/payments", key: "nav.payments", icon: Wallet },
  { href: "/dashboard/settings", key: "nav.settings", icon: Settings },
  { href: "/dashboard/admin", key: "nav.admin", icon: ShieldCheck },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const { shop, orders, t, lang, hydrated, hasShop } = useStore();
  const { profile, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const pendingCount = orders.filter(
    (order) =>
      order.orderStatus === "pending" && order.paymentStatus === "pending",
  ).length;

  useEffect(() => {
    if (hydrated && !hasShop) router.replace("/onboarding");
  }, [hydrated, hasShop, router]);

  if (!hydrated || !hasShop) {
    return (
      <div className="min-h-screen bg-[#faf7ff]">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <AppLoader label={t("common.loading")} />
        </div>
      </div>
    );
  }

  const ownerName = shop.ownerName || profile?.fullName || "Shop owner";
  const initials =
    ownerName
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("") || "DD";

  return (
    <div className={cn("min-h-screen bg-[#faf7ff]", lang === "ur" && "font-urdu")}>
      <aside className="fixed inset-y-0 start-0 z-40 hidden w-72 flex-col border-e border-royal-100 bg-white px-5 py-6 lg:flex">
        <Link href="/" className="px-1">
          <Logo />
        </Link>

        <div className="mt-7 rounded-2xl border border-royal-100 bg-royal-50/60 p-3.5">
          <div className="flex items-center gap-3">
            <ShopAvatar
              emoji={shop.logoEmoji}
              theme={shop.logoColor}
              imageUrl={shop.logoUrl}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-ink">
                {shop.name}
              </p>
              <p className="truncate text-xs text-ink-muted">
                {shopHost(shop.slug)}
              </p>
            </div>
          </div>
          <Link
            href={`/shop/${shop.slug}`}
            className="mt-3 flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs font-bold text-royal-800 shadow-sm transition hover:bg-royal-100"
          >
            <span className="flex items-center gap-2">
              <Store className="h-3.5 w-3.5" />
              {t("nav.storefront")}
            </span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold transition",
                  active
                    ? "bg-royal-700 text-white shadow-glow"
                    : "text-ink-soft hover:bg-royal-50 hover:text-royal-800",
                )}
              >
                <Icon
                  className={cn(
                    "h-[18px] w-[18px]",
                    active
                      ? "text-gold-300"
                      : "text-ink-muted group-hover:text-royal-700",
                  )}
                />
                <span className="flex-1">{t(item.key)}</span>
                {item.href === "/dashboard/payments" && pendingCount > 0 && (
                  <span
                    className={cn(
                      "grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] font-extrabold",
                      active
                        ? "bg-gold-300 text-royal-950"
                        : "bg-gold-100 text-gold-800",
                    )}
                  >
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 overflow-hidden rounded-2xl bg-royal-radial p-4 text-white shadow-glow">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-gold-200">
            <Sparkles className="h-3.5 w-3.5" />
            Growth plan
          </div>
          <p className="mt-2 text-sm font-semibold leading-snug text-white/90">
            Unlimited products, QR codes and payment reminders.
          </p>
          <button
            type="button"
            className="mt-3 w-full rounded-full bg-gold-300 px-3 py-2 text-xs font-extrabold text-royal-950 transition hover:bg-gold-200"
          >
            Coming soon · Rs 499/mo
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-royal-100 pt-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-royal-100 text-xs font-extrabold text-royal-800">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-ink">
                {ownerName}
              </p>
              <p className="text-[11px] text-ink-muted">Owner</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            title="Log out"
            className="grid h-9 w-9 place-items-center rounded-full text-ink-muted transition hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-royal-100 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Logo compact />
          <span className="text-sm font-extrabold text-ink">{shop.name}</span>
        </Link>
        <div className="flex items-center gap-2">
          <LangToggle compact />
          <ShopAvatar
            emoji={shop.logoEmoji}
            theme={shop.logoColor}
            imageUrl={shop.logoUrl}
            size="sm"
          />
        </div>
      </header>

      <main className="pb-24 lg:pb-10 lg:ps-72">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
          {children}
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-royal-100 bg-white/95 px-2 pb-2 pt-1.5 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-between">
          {NAV.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-bold transition",
                  active ? "text-royal-800" : "text-ink-muted",
                )}
              >
                <span
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-xl transition",
                    active ? "bg-royal-700 text-gold-300" : "text-ink-muted",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="max-w-[64px] truncate">{t(item.key)}</span>
                {item.href === "/dashboard/payments" && pendingCount > 0 && (
                  <span className="absolute right-1/4 top-1 h-1.5 w-1.5 rounded-full bg-gold-500" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

