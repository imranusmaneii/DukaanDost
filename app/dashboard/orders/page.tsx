"use client";

import { useMemo, useState } from "react";
import {
  Banknote,
  CheckCheck,
  ChevronDown,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShoppingBag,
  Truck,
  User,
  Wallet,
} from "lucide-react";
import { useStore } from "@/lib/store";
import type { Order, OrderStatus } from "@/lib/types";
import {
  ORDER_STATUSES,
  PAYMENT_LABELS,
  cn,
  formatMoney,
  formatTime,
  orderWhatsAppMessage,
  relativeDay,
  waLink,
} from "@/lib/utils";
import {
  EmptyState,
  Modal,
  PaymentPill,
  PaymentStatusPill,
  StatusPill,
  useToast,
} from "@/components/ui";

const FILTERS: Array<{ value: OrderStatus | "all"; key: string }> = [
  { value: "all", key: "common.all" },
  { value: "pending", key: "status.pending" },
  { value: "confirmed", key: "status.confirmed" },
  { value: "paid", key: "status.paid" },
  { value: "delivered", key: "status.delivered" },
  { value: "cancelled", key: "status.cancelled" },
];

export default function OrdersPage() {
  const {
    shop,
    orders,
    lang,
    t,
    setOrderStatus,
    setPaymentStatus,
    hydrated,
  } = useStore();
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { show, node } = useToast();

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: orders.length };
    ORDER_STATUSES.forEach((status) => {
      map[status] = orders.filter((order) => order.orderStatus === status).length;
    });
    return map;
  }, [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesFilter =
        filter === "all" || order.orderStatus === filter;
      if (!matchesFilter) return false;
      if (!q) return true;
      return (
        order.customerName.toLowerCase().includes(q) ||
        order.customerPhone.replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
        String(order.orderNumber).includes(q)
      );
    });
  }, [orders, filter, query]);

  const selected = orders.find((order) => order.id === selectedId) ?? null;

  if (!hydrated) return null;

  return (
    <div className="space-y-7">
      {node}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[2rem]">
            {t("orders.title")}
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-ink-muted">
            {t("orders.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-royal-100 bg-white px-4 py-3.5 shadow-sm">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-50 text-gold-700">
            <ShoppingBag className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-ink-muted">
              {t("dashboard.ordersWeek")}
            </p>
            <p className="text-lg font-extrabold leading-tight text-ink">
              {orders.filter((order) => order.orderStatus !== "cancelled").length}
            </p>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-extrabold transition",
                  filter === item.value
                    ? "bg-royal-700 text-white shadow-glow"
                    : "bg-royal-50 text-ink-soft hover:bg-royal-100",
                )}
              >
                {item.value === "all"
                  ? t("common.all")
                  : t(`status.${item.value}`)}
                <span
                  className={cn(
                    "grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px]",
                    filter === item.value
                      ? "bg-white/20 text-white"
                      : "bg-white text-royal-800",
                  )}
                >
                  {counts[item.value] ?? 0}
                </span>
              </button>
            ))}
          </div>
          <div className="relative lg:w-80">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted rtl:left-auto rtl:right-3.5" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("orders.searchPlaceholder")}
              className="input pl-10 rtl:pl-4 rtl:pr-10"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={t("orders.empty")}
          hint={t("orders.emptyHint")}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              lang={lang}
              shopName={shop.name}
              t={t}
              onOpen={() => setSelectedId(order.id)}
              onStatus={(status) => {
                setOrderStatus(order.id, status);
                show(`${t("orders.updateStatus")} · ${status}`);
              }}
              onPaid={() => {
                setPaymentStatus(order.id, "paid");
                show(t("dashboard.markPaid"));
              }}
            />
          ))}
        </div>
      )}

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected ? `#${selected.orderNumber}` : ""}
        subtitle={selected ? t("orders.orderDetails") : undefined}
        size="lg"
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={selected.orderStatus} lang={lang} />
              <PaymentStatusPill
                status={selected.paymentStatus}
                lang={lang}
              />
              <PaymentPill method={selected.paymentMethod} lang={lang} />
              <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-ink-muted rtl:ml-0 rtl:mr-auto">
                <Clock className="h-3.5 w-3.5" />
                {relativeDay(selected.createdAt, lang)} ·{" "}
                {formatTime(selected.createdAt)}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-royal-100 bg-royal-50/40 p-4">
                <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-ink-muted">
                  <User className="h-3 w-3" />
                  {t("common.customer")}
                </p>
                <p className="mt-1 text-sm font-extrabold text-ink">
                  {selected.customerName}
                </p>
                <a
                  href={`tel:${selected.customerPhone}`}
                  className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-royal-700"
                >
                  <Phone className="h-3 w-3" />
                  <span dir="ltr">{selected.customerPhone}</span>
                </a>
              </div>
              <div className="rounded-2xl border border-royal-100 bg-royal-50/40 p-4">
                <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-ink-muted">
                  <MapPin className="h-3 w-3" />
                  {t("orders.deliveryAddress")}
                </p>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-ink">
                  {selected.address}
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-royal-100">
              <div className="flex items-center justify-between bg-royal-50/60 px-4 py-2.5">
                <p className="text-[11px] font-extrabold uppercase tracking-wide text-ink-muted">
                  {t("orders.order")} · {t("orders.items")}
                </p>
                <p className="text-[11px] font-extrabold uppercase tracking-wide text-ink-muted">
                  {t("common.total")}
                </p>
              </div>
              <ul className="divide-y divide-royal-100/60">
                {selected.items.map((item) => (
                  <li
                    key={`${item.productId}-${item.name}`}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-royal-50 text-lg">
                      {item.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-ink">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-ink-muted">
                        <span dir="ltr">{formatMoney(item.price)}</span> ×{" "}
                        {item.qty}
                      </p>
                    </div>
                    <p className="text-xs font-extrabold text-ink">
                      <span dir="ltr">
                        {formatMoney(item.price * item.qty)}
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-royal-100 bg-royal-50/40 px-4 py-3">
                <span className="text-xs font-extrabold text-ink-soft">
                  {t("common.total")}
                </span>
                <span className="text-base font-extrabold text-royal-800">
                  <span dir="ltr">{formatMoney(selected.total)}</span>
                </span>
              </div>
            </div>

            {selected.note && (
              <div className="rounded-2xl border border-gold-200 bg-gold-50/60 p-4">
                <p className="text-[11px] font-extrabold uppercase tracking-wide text-gold-800">
                  {t("orders.note")}
                </p>
                <p className="mt-1 text-xs font-semibold text-ink">
                  “{selected.note}”
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-royal-100 p-4">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-ink-muted">
                {t("orders.paymentMethod")}
              </p>
              <p className="mt-1 text-sm font-bold text-ink">
                {lang === "ur"
                  ? PAYMENT_LABELS[selected.paymentMethod].ur
                  : PAYMENT_LABELS[selected.paymentMethod].en}
              </p>
            </div>

            <div>
              <p className="label">{t("orders.updateStatus")}</p>
              <div className="flex flex-wrap gap-2">
                {ORDER_STATUSES.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => {
                      setOrderStatus(selected.id, status);
                      show(t("orders.updateStatus"));
                    }}
                    className={cn(
                      "rounded-full border px-3.5 py-2 text-xs font-extrabold transition",
                      selected.orderStatus === status
                        ? "border-royal-700 bg-royal-700 text-white"
                        : "border-royal-100 bg-white text-ink-soft hover:border-royal-300 hover:bg-royal-50",
                    )}
                  >
                    {t(`status.${status}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-royal-100 pt-4 sm:flex-row">
              <a
                href={waLink(
                  selected.customerPhone,
                  orderWhatsAppMessage(selected, shop.name),
                )}
                target="_blank"
                rel="noreferrer"
                className="btn-primary flex-1 px-4 py-3"
              >
                <MessageCircle className="h-4 w-4" />
                {t("orders.confirmWhatsApp")}
              </a>
              {selected.paymentStatus === "pending" ? (
                <button
                  type="button"
                  onClick={() => {
                    setPaymentStatus(selected.id, "paid");
                    show(t("dashboard.markPaid"));
                  }}
                  className="btn-gold px-4 py-3"
                >
                  <Banknote className="h-4 w-4" />
                  {t("orders.markPaid")}
                </button>
              ) : (
                <span className="btn bg-emerald-50 px-4 py-3 text-emerald-700">
                  <CheckCheck className="h-4 w-4" />
                  {t("status.paid")}
                </span>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function OrderRow({
  order,
  lang,
  shopName,
  t,
  onOpen,
  onStatus,
  onPaid,
}: {
  order: Order;
  lang: "en" | "ur";
  shopName: string;
  t: (key: string) => string;
  onOpen: () => void;
  onStatus: (status: OrderStatus) => void;
  onPaid: () => void;
}) {
  const qty = order.items.reduce((sum, item) => sum + item.qty, 0);
  return (
    <div className="card p-5 transition hover:border-royal-200 hover:shadow-glow/10 sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <button
          type="button"
          onClick={onOpen}
          className="flex min-w-0 flex-1 items-center gap-3 text-left rtl:text-right"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-royal-50 text-sm font-extrabold text-royal-800">
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
              <span className="rounded-full bg-royal-50 px-2 py-0.5 text-[11px] font-extrabold text-royal-700">
                #{order.orderNumber}
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs text-ink-muted">
              {qty} {t("orders.items")} ·{" "}
              {order.items.map((item) => item.name).join(", ")}
            </p>
            <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-ink-muted lg:hidden">
              <Clock className="h-3 w-3" />
              {relativeDay(order.createdAt, lang)} ·{" "}
              {formatTime(order.createdAt)}
            </p>
          </div>
        </button>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <div className="hidden min-w-[72px] text-right lg:block rtl:text-left">
            <p className="text-sm font-extrabold text-ink">
              <span dir="ltr">{formatMoney(order.total)}</span>
            </p>
            <p className="text-[11px] font-semibold text-ink-muted">
              {relativeDay(order.createdAt, lang)}
            </p>
          </div>
          <StatusPill status={order.orderStatus} lang={lang} />
          <PaymentStatusPill status={order.paymentStatus} lang={lang} />
          <div className="relative">
            <select
              value={order.orderStatus}
              onChange={(event) =>
                onStatus(event.target.value as OrderStatus)
              }
              className="h-9 appearance-none rounded-full border border-royal-100 bg-white pl-3 pr-8 text-xs font-bold text-ink-soft transition hover:border-royal-300 focus:border-royal-400 focus:outline-none focus:ring-2 focus:ring-royal-200"
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t(`status.${status}`)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted rtl:right-auto rtl:left-2.5" />
          </div>
          {order.paymentStatus === "pending" && (
            <button
              type="button"
              onClick={onPaid}
              className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100"
              title={t("orders.markPaid")}
            >
              <Wallet className="h-4 w-4" />
            </button>
          )}
          <a
            href={waLink(
              order.customerPhone,
              orderWhatsAppMessage(order, shopName),
            )}
            target="_blank"
            rel="noreferrer"
            className="grid h-9 w-9 place-items-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700"
            title={t("orders.whatsapp")}
          >
            <MessageCircle className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={onOpen}
            className="grid h-9 w-9 place-items-center rounded-full border border-royal-100 text-royal-800 transition hover:bg-royal-50"
            title={t("orders.viewDetails")}
          >
            <Truck className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

