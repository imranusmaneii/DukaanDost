"use client";

import {
  BadgeCheck,
  Banknote,
  BellRing,
  Clock,
  MessageCircle,
  Phone,
  Wallet,
} from "lucide-react";
import { useMemo } from "react";
import { useStore } from "@/lib/store";
import {
  PAYMENT_LABELS,
  formatMoney,
  reminderMessage,
  relativeDay,
  waLink,
} from "@/lib/utils";
import {
  EmptyState,
  PaymentPill,
  useToast,
} from "@/components/ui";

export default function PaymentsPage() {
  const { shop, orders, lang, t, setPaymentStatus, hydrated } = useStore();
  const { show, node } = useToast();

  const pending = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.paymentStatus === "pending" &&
          order.orderStatus !== "cancelled",
      ),
    [orders],
  );

  const total = pending.reduce((sum, order) => sum + order.total, 0);

  if (!hydrated) return null;

  return (
    <div className="space-y-5">
      {node}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          {t("payments.title")}
        </h1>
        <p className="mt-1 max-w-xl text-sm text-ink-muted">
          {t("payments.subtitle")}
        </p>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-royal-radial p-5 text-white shadow-glow sm:p-6">
        <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-gold-300/20 blur-2xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-gold-300 ring-1 ring-inset ring-white/20">
              <Wallet className="h-7 w-7" />
            </span>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-gold-200">
                {t("payments.totalPending")}
              </p>
              <p className="mt-0.5 text-3xl font-extrabold tracking-tight">
                <span dir="ltr">{formatMoney(total)}</span>
              </p>
              <p className="mt-0.5 text-xs text-white/60">
                {pending.length} {t("payments.ordersPending")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-inset ring-white/15">
            <BellRing className="h-5 w-5 text-gold-300" />
            <div>
              <p className="text-xs font-extrabold text-white">
                {pending.length === 0
                  ? t("payments.empty")
                  : t("payments.remind")}
              </p>
              <p className="text-[11px] text-white/60">
                {t("dashboard.pendingPayments")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {pending.length === 0 ? (
        <EmptyState
          icon={BadgeCheck}
          title={t("payments.empty")}
          hint={t("payments.emptyHint")}
        />
      ) : (
        <div className="space-y-2.5">
          {pending.map((order) => (
            <div key={order.id} className="card p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gold-50 text-sm font-extrabold text-gold-800">
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
                      <span className="rounded-full bg-royal-50 px-2 py-0.5 text-[10px] font-extrabold text-royal-700">
                        #{order.orderNumber}
                      </span>
                      <PaymentPill method={order.paymentMethod} lang={lang} />
                    </div>
                    <p className="mt-0.5 truncate text-xs text-ink-muted">
                      {order.items
                        .map((item) => `${item.qty} × ${item.name}`)
                        .join(", ")}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-ink-muted">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span dir="ltr">{order.customerPhone}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {t("payments.awaiting")} ·{" "}
                        {relativeDay(order.createdAt, lang)}
                      </span>
                      <span>
                        {t("payments.method")}{" "}
                        {lang === "ur"
                          ? PAYMENT_LABELS[order.paymentMethod].ur
                          : PAYMENT_LABELS[order.paymentMethod].en}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-royal-100/70 pt-3 lg:border-t-0 lg:pt-0">
                  <p className="mr-auto text-lg font-extrabold text-ink lg:mr-3 rtl:ml-3 rtl:mr-0">
                    <span dir="ltr">{formatMoney(order.total)}</span>
                  </p>
                  <a
                    href={waLink(
                      order.customerPhone,
                      reminderMessage(order, shop.name),
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-soft px-3.5 py-2.5"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {t("payments.remind")}
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentStatus(order.id, "paid");
                      show(t("dashboard.markPaid"));
                    }}
                    className="btn-gold px-3.5 py-2.5"
                  >
                    <Banknote className="h-4 w-4" />
                    {t("payments.markPaid")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
