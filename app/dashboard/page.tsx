"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Clock,
  Copy,
  Crown,
  MessageCircle,
  Package,
  QrCode,
  ReceiptText,
  ShoppingBag,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import {
  bestSeller,
  cn,
  formatMoney,
  formatTime,
  isThisWeek,
  orderWhatsAppMessage,
  relativeDay,
  shopHost,
  shopUrl,
  startOfWeek,
  waLink,
  weekBuckets,
} from "@/lib/utils";
import {
  PaymentStatusPill,
  ShopAvatar,
  StatusPill,
} from "@/components/ui";
import { QrModal } from "@/components/QrModal";

export default function DashboardPage() {
  const { shop, products, orders, t, lang, setPaymentStatus, hydrated } =
    useStore();
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const stats = useMemo(() => {
    const weekOrders = orders.filter(
      (order) => isThisWeek(order.createdAt) && order.orderStatus !== "cancelled",
    );
    const paidThisWeek = weekOrders.filter(
      (order) => order.paymentStatus === "paid",
    );
    const earnings = paidThisWeek.reduce((sum, order) => sum + order.total, 0);

    const thisWeekStart = startOfWeek().getTime();
    const prevWeekStart = thisWeekStart - 7 * 86_400_000;
    const prevEarnings = orders
      .filter((order) => {
        const time = new Date(order.createdAt).getTime();
        return (
          time >= prevWeekStart &&
          time < thisWeekStart &&
          order.paymentStatus === "paid" &&
          order.orderStatus !== "cancelled"
        );
      })
      .reduce((sum, order) => sum + order.total, 0);

    const trend =
      prevEarnings > 0
        ? Math.round(((earnings - prevEarnings) / prevEarnings) * 100)
        : 0;

    const pendingOrders = orders.filter(
      (order) =>
        order.paymentStatus === "pending" &&
        order.orderStatus !== "cancelled",
    );
    const pendingTotal = pendingOrders.reduce(
      (sum, order) => sum + order.total,
      0,
    );

    const avg = paidThisWeek.length ? earnings / paidThisWeek.length : 0;
    const best = bestSeller(orders);
    const bestProduct = products.find(
      (product) => product.name === best?.product,
    );

    const today = new Date();
    const ordersToday = orders.filter((order) => {
      const d = new Date(order.createdAt);
      return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      );
    }).length;

    return {
      weekOrders,
      earnings,
      trend,
      avg,
      pendingOrders,
      pendingTotal,
      best,
      bestProduct,
      ordersToday,
      prevEarnings,
    };
  }, [orders, products]);

  const buckets = useMemo(() => weekBuckets(orders), [orders]);
  const maxBucket = Math.max(...buckets.map((bucket) => bucket.total), 1);
  const recentOrders = orders.slice(0, 5);
  const firstName = shop.ownerName.split(" ")[0] || "there";
  const weekRange = `${startOfWeek().toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
  })} – ${new Date().toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
  })}`;

  if (!hydrated) return null;

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-royal-600">
            {t("dashboard.thisWeek")} · {weekRange}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink sm:text-[2rem]">
            {t("dashboard.greeting")}, {firstName}
            <span className="ml-1">👋</span>
          </h1>
          <p className="mt-1.5 text-sm text-ink-muted">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/shop/${shop.slug}`}
            className="btn-ghost px-4 py-2.5"
          >
            <ArrowUpRight className="h-4 w-4" />
            {t("common.viewShop")}
          </Link>
          <Link
            href="/dashboard/products?new=1"
            className="btn-primary px-4 py-2.5"
          >
            <Package className="h-4 w-4" />
            {t("dashboard.addProduct")}
          </Link>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-royal-radial p-6 text-white shadow-glow sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-gold-300/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <ShopAvatar
              emoji={shop.logoEmoji}
              theme={shop.logoColor}
              imageUrl={shop.logoUrl}
              size="lg"
            />
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-gold-200">
                <Sparkles className="h-3.5 w-3.5" />
                {t("dashboard.shopLink")}
              </p>
              <p className="mt-1 break-all text-sm font-bold text-white/95 sm:text-base">
                {shopHost(shop.slug)}
              </p>
              <p className="mt-0.5 text-xs text-white/60">
                {products.length} {t("products.items")} ·{" "}
                {stats.ordersToday} {t("dashboard.ordersToday")}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                const url = shopUrl(shop.slug);
                try {
                  await navigator.clipboard.writeText(url);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1800);
                } catch {
                  /* ignore */
                }
              }}
              className="btn bg-white/10 px-4 py-2.5 text-white ring-1 ring-inset ring-white/25 hover:bg-white/20"
            >
              {copied ? (
                <BadgeCheck className="h-4 w-4 text-gold-300" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? t("common.copied") : t("common.copyLink")}
            </button>
            <button
              type="button"
              onClick={() => setQrOpen(true)}
              className="btn bg-white/10 px-4 py-2.5 text-white ring-1 ring-inset ring-white/25 hover:bg-white/20"
            >
              <QrCode className="h-4 w-4" />
              {t("dashboard.qrTitle")}
            </button>
            <a
              href={waLink(
                shop.whatsappNumber,
                `Assalam-o-Alaikum! Check out my online shop ${shop.name}: ${shopUrl(shop.slug)}`,
              )}
              target="_blank"
              rel="noreferrer"
              className="btn-gold px-4 py-2.5"
            >
              <MessageCircle className="h-4 w-4" />
              Share
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
        <StatCard
          label={t("dashboard.earningsWeek")}
          value={formatMoney(stats.earnings)}
          icon={Wallet}
          tone="royal"
          hint={
            stats.prevEarnings > 0
              ? `${stats.trend >= 0 ? "+" : ""}${stats.trend}% ${t("dashboard.vsLastWeek")}`
              : t("dashboard.thisWeek")
          }
          trend={stats.trend}
        />
        <StatCard
          label={t("dashboard.ordersWeek")}
          value={String(stats.weekOrders.length)}
          icon={ShoppingBag}
          tone="gold"
          hint={`${stats.ordersToday} ${t("dashboard.ordersToday")}`}
        />
        <StatCard
          label={t("dashboard.avgOrder")}
          value={formatMoney(stats.avg)}
          icon={ReceiptText}
          tone="ocean"
          hint={t("dashboard.thisWeek")}
        />
        <StatCard
          label={t("dashboard.pendingCollection")}
          value={formatMoney(stats.pendingTotal)}
          icon={Clock}
          tone="rose"
          hint={`${stats.pendingOrders.length} ${t("payments.ordersPending")}`}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        <div className="card p-5 sm:p-6 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-royal-200 pb-4">
            <div>
              <h2 className="text-[15px] font-extrabold tracking-tight text-ink">
                {t("dashboard.weeklyEarnings")}
              </h2>
              <p className="mt-1 text-xs text-ink-muted">
                {t("dashboard.earned")} · {weekRange}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-gold-50 px-3 py-1.5 text-xs font-extrabold text-gold-800">
              <CalendarDays className="h-3.5 w-3.5" />
              <span dir="ltr">{formatMoney(stats.earnings)}</span>
            </div>
          </div>
          <div
            dir="ltr"
            className="mt-7 flex h-44 items-end justify-between gap-2 sm:gap-3"
          >
            {buckets.map((bucket, index) => {
              const height = Math.max(
                (bucket.total / maxBucket) * 100,
                bucket.total > 0 ? 8 : 3,
              );
              const isToday = index === buckets.length - 1;
              return (
                <div
                  key={bucket.iso}
                  className="group flex h-full flex-1 flex-col items-center justify-end gap-2 border-l border-royal-200 pl-2 first:border-l-0 first:pl-0"
                >
                  <span
                    className={cn(
                      "text-[11px] font-extrabold transition",
                      bucket.total > 0
                        ? "text-royal-800"
                        : "text-ink-muted/50",
                    )}
                  >
                    {bucket.total > 0 ? Math.round(bucket.total / 1000) + "k" : "—"}
                  </span>
                  <div className="flex w-full flex-1 items-end">
                    <div
                      title={`${bucket.label}: ${formatMoney(bucket.total)}`}
                      style={{ height: `${height}%` }}
                      className={cn(
                        "w-full rounded-t-xl transition-all duration-300 group-hover:opacity-90",
                        isToday
                          ? "bg-gold-shine shadow-gold"
                          : "bg-gradient-to-t from-royal-200 to-royal-500",
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-[11px] font-bold",
                      isToday ? "text-royal-900" : "text-ink-muted",
                    )}
                  >
                    {bucket.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-5">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-royal-200 px-5 py-4 sm:px-6">
              <h2 className="text-[15px] font-extrabold tracking-tight text-ink">
                {t("dashboard.bestSeller")}
              </h2>
              <Crown className="h-4 w-4 text-gold-500" />
            </div>
            <div className="p-3 sm:p-4">
              <div className="flex items-center gap-4 rounded-2xl border border-royal-200 bg-royal-50/30 p-4">
                {stats.bestProduct ? (
                  <>
                    <ShopAvatar
                      emoji={stats.bestProduct.emoji}
                      theme={stats.bestProduct.theme}
                      imageUrl={stats.bestProduct.imageUrl}
                      size="lg"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-ink">
                        {stats.bestProduct.name}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        {stats.best?.units} {t("dashboard.unitsSold")}
                      </p>
                      <p className="mt-1 text-sm font-extrabold text-royal-700">
                        <span dir="ltr">
                          {formatMoney(stats.bestProduct.price)}
                        </span>
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-ink-muted">
                    {t("dashboard.noOrders")}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-royal-200 px-5 py-4 sm:px-6">
              <h2 className="text-[15px] font-extrabold tracking-tight text-ink">
                {t("dashboard.pendingPayments")}
              </h2>
              <Link
                href="/dashboard/payments"
                className="text-xs font-bold text-royal-700 hover:underline"
              >
                {t("dashboard.viewAll")}
              </Link>
            </div>
            {stats.pendingOrders.length === 0 ? (
              <div className="px-6 py-9 text-center">
                <BadgeCheck className="mx-auto h-8 w-8 text-emerald-500" />
                <p className="mt-2 text-sm font-bold text-ink">
                  {t("dashboard.allSettled")}
                </p>
                <p className="text-xs text-ink-muted">
                  {t("dashboard.allSettledHint")}
                </p>
              </div>
            ) : (
              <ul className="space-y-2.5 p-3 sm:p-4">
                {stats.pendingOrders.slice(0, 3).map((order) => (
                  <li
                    key={order.id}
                    className="flex items-center gap-3 rounded-2xl border border-royal-200 bg-royal-50/30 px-3.5 py-3"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold-100 text-xs font-extrabold text-gold-800">
                      {order.customerName
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-ink">
                        {order.customerName}
                      </p>
                      <p className="text-[11px] text-ink-muted">
                        #{order.orderNumber} ·{" "}
                        <span dir="ltr">{formatMoney(order.total)}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPaymentStatus(order.id, "paid")}
                        className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        {t("dashboard.markPaid")}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-royal-200 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-[15px] font-extrabold tracking-tight text-ink">
              {t("dashboard.recentOrders")}
            </h2>
            <p className="mt-1 text-xs text-ink-muted">
              {t("dashboard.ordersWeek")}: {stats.weekOrders.length}
            </p>
          </div>
          <Link
            href="/dashboard/orders"
            className="flex items-center gap-1.5 rounded-full bg-royal-50 px-3 py-1.5 text-xs font-extrabold text-royal-800 transition hover:bg-royal-100"
          >
            {t("dashboard.viewAll")}
            <ArrowRight className="h-3.5 w-3.5 flip-rtl" />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-ink-muted">
            {t("dashboard.noOrders")}
          </p>
        ) : (
          <ul className="space-y-2.5 p-3 sm:p-4">
            {recentOrders.map((order) => {
              const qty = order.items.reduce((sum, item) => sum + item.qty, 0);
              return (
                <li
                  key={order.id}
                  className="flex flex-col gap-3 rounded-2xl border border-royal-200 bg-white px-4 py-4 transition hover:border-royal-200 hover:bg-royal-50/30 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-royal-50 text-xs font-extrabold text-royal-800">
                      {order.customerName
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-extrabold text-ink">
                          {order.customerName}
                        </p>
                        <span className="text-[11px] font-bold text-ink-muted">
                          #{order.orderNumber}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-ink-muted">
                        {qty} {t("orders.items")} ·{" "}
                        {order.items
                          .map((item) => item.name)
                          .slice(0, 2)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <StatusPill status={order.orderStatus} lang={lang} />
                    <PaymentStatusPill
                      status={order.paymentStatus}
                      lang={lang}
                    />
                    <span className="text-sm font-extrabold text-ink">
                      <span dir="ltr">{formatMoney(order.total)}</span>
                    </span>
                    <span className="hidden items-center gap-1 text-[11px] font-semibold text-ink-muted sm:flex">
                      <Clock className="h-3 w-3" />
                      {relativeDay(order.createdAt, lang)}{" "}
                      {formatTime(order.createdAt)}
                    </span>
                    <a
                      href={waLink(
                        order.customerPhone,
                        orderWhatsAppMessage(order, shop.name),
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="grid h-8 w-8 place-items-center rounded-full bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100"
                      title={t("orders.whatsapp")}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <QrModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        url={shopUrl(shop.slug)}
        slug={shop.slug}
        shopName={shop.name}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone,
  trend,
}: {
  label: string;
  value: string;
  icon: typeof Wallet;
  hint: string;
  tone: "royal" | "gold" | "ocean" | "rose";
  trend?: number;
}) {
  const tones = {
    royal: "bg-royal-50 text-royal-700",
    gold: "bg-gold-50 text-gold-700",
    ocean: "bg-sky-50 text-sky-700",
    rose: "bg-rose-50 text-rose-700",
  };
  const showTrend = typeof trend === "number" && trend !== 0;
  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "grid h-10 w-10 place-items-center rounded-xl",
            tones[tone],
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
        {showTrend && (
          <span
            className={cn(
              "chip gap-1",
              trend! >= 0
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700",
            )}
          >
            {trend! >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(trend!)}%
          </span>
        )}
      </div>
      <div className="mt-4 border-t border-royal-200 pt-3.5">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">
          {label}
        </p>
        <p
          className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-[1.7rem]"
          dir="ltr"
        >
          {value}
        </p>
        <p className="mt-1.5 text-xs font-semibold text-ink-muted">{hint}</p>
      </div>
    </div>
  );
}

