"use client";

import { useEffect, useState } from "react";
import {
  Banknote,
  Check,
  CreditCard,
  Link2,
  Save,
  ShieldCheck,
  Smartphone,
  Store,
  Truck,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import type { PaymentAccounts, PaymentMethod } from "@/lib/types";
import { PAYMENT_LABELS, cn, shopHost } from "@/lib/utils";
import { useToast } from "@/components/ui";

const METHODS: Array<{ id: PaymentMethod; icon: typeof Truck }> = [
  { id: "cod", icon: Truck },
  { id: "easypaisa", icon: Smartphone },
  { id: "jazzcash", icon: Smartphone },
  { id: "bank", icon: Banknote },
];

export default function AdminPage() {
  const { user } = useAuth();
  const { shop, lang, updateShop, hydrated } = useStore();
  const { show, node } = useToast();
  const [methods, setMethods] = useState<PaymentMethod[]>(shop.paymentMethods);
  const [accounts, setAccounts] = useState<PaymentAccounts>(shop.paymentAccounts);
  const [isOpen, setIsOpen] = useState(shop.isOpen);
  const [deliveryNote, setDeliveryNote] = useState(shop.deliveryNote);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMethods(shop.paymentMethods);
    setAccounts(shop.paymentAccounts);
    setIsOpen(shop.isOpen);
    setDeliveryNote(shop.deliveryNote);
  }, [shop.id, shop.paymentMethods, shop.paymentAccounts, shop.isOpen, shop.deliveryNote]);

  function toggleMethod(method: PaymentMethod) {
    setMethods((prev) => {
      const has = prev.includes(method);
      if (has && prev.length === 1) return prev;
      return has ? prev.filter((item) => item !== method) : [...prev, method];
    });
  }

  async function save() {
    setError("");
    if (methods.includes("easypaisa") && !accounts.easypaisa.trim()) {
      setError("Add your Easypaisa number, or turn that method off.");
      return;
    }
    if (methods.includes("jazzcash") && !accounts.jazzcash.trim()) {
      setError("Add your JazzCash number, or turn that method off.");
      return;
    }
    if (methods.includes("bank") && !accounts.bank.trim()) {
      setError("Add your bank account or IBAN, or turn that method off.");
      return;
    }
    setBusy(true);
    try {
      await updateShop({
        paymentMethods: methods,
        paymentAccounts: accounts,
        isOpen,
        deliveryNote,
      });
      show("Admin settings saved");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  if (!hydrated) return null;

  return (
    <div className="space-y-7">
      {node}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-royal-600">
            Shop owner only
          </p>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-ink sm:text-[2rem]">
            <ShieldCheck className="h-6 w-6 text-royal-700" />
            Admin
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-ink-muted">
            Your payment accounts and store controls. Customers see these
            details at checkout.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void save()}
          disabled={busy}
          className="btn-primary px-4 py-2.5 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {busy ? "Saving…" : "Save changes"}
        </button>
      </div>

      {error && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
          {error}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        <div className="card p-5 sm:p-6 lg:col-span-2">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-royal-50 text-royal-700">
              <CreditCard className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-[15px] font-extrabold tracking-tight text-ink">
                Payment accounts
              </h2>
              <p className="mt-0.5 text-xs text-ink-muted">
                Turn on the methods you accept and enter your own details.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {METHODS.map(({ id, icon: Icon }) => {
              const active = methods.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleMethod(id)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition rtl:text-right",
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
                      ? PAYMENT_LABELS[id].ur
                      : PAYMENT_LABELS[id].en}
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

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {methods.includes("easypaisa") && (
              <div>
                <label className="label" htmlFor="admin-easypaisa">
                  Easypaisa number
                </label>
                <input
                  id="admin-easypaisa"
                  value={accounts.easypaisa}
                  onChange={(event) =>
                    setAccounts((prev) => ({
                      ...prev,
                      easypaisa: event.target.value,
                    }))
                  }
                  placeholder="03xx xxxxxxx"
                  className="input"
                  dir="ltr"
                />
              </div>
            )}
            {methods.includes("jazzcash") && (
              <div>
                <label className="label" htmlFor="admin-jazzcash">
                  JazzCash number
                </label>
                <input
                  id="admin-jazzcash"
                  value={accounts.jazzcash}
                  onChange={(event) =>
                    setAccounts((prev) => ({
                      ...prev,
                      jazzcash: event.target.value,
                    }))
                  }
                  placeholder="03xx xxxxxxx"
                  className="input"
                  dir="ltr"
                />
              </div>
            )}
            {methods.includes("bank") && (
              <div className="sm:col-span-3">
                <label className="label" htmlFor="admin-bank">
                  Bank account / IBAN
                </label>
                <input
                  id="admin-bank"
                  value={accounts.bank}
                  onChange={(event) =>
                    setAccounts((prev) => ({
                      ...prev,
                      bank: event.target.value,
                    }))
                  }
                  placeholder="Bank name · Account title · IBAN"
                  className="input"
                  dir="ltr"
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => void save()}
              disabled={busy}
              className="btn-primary px-4 py-2.5 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {busy ? "Saving…" : "Save payment settings"}
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                <Store className="h-4 w-4" />
              </span>
              <h2 className="text-[15px] font-extrabold tracking-tight text-ink">
                Store controls
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className="mt-5 flex w-full items-center justify-between rounded-2xl bg-royal-50/60 px-4 py-3.5"
            >
              <span className="text-left">
                <span className="block text-xs font-extrabold text-ink">
                  {isOpen ? "Open for orders" : "Closed"}
                </span>
                <span className="block text-[11px] text-ink-muted">
                  {isOpen
                    ? "Customers can place orders."
                    : "Checkout is paused."}
                </span>
              </span>
              <span
                className={cn(
                  "relative h-6 w-11 rounded-full transition",
                  isOpen ? "bg-emerald-500" : "bg-royal-200",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
                    isOpen ? "left-[22px]" : "left-0.5",
                  )}
                />
              </span>
            </button>

            <label className="label mt-5" htmlFor="admin-delivery">
              Delivery note
            </label>
            <textarea
              id="admin-delivery"
              value={deliveryNote}
              onChange={(event) => setDeliveryNote(event.target.value)}
              rows={3}
              placeholder="Delivery areas, charges, timings or pickup instructions."
              className="input resize-none"
            />
            <button
              type="button"
              onClick={() => void save()}
              disabled={busy}
              className="btn-primary mt-4 w-full px-4 py-2.5 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {busy ? "Saving…" : "Save store settings"}
            </button>
          </div>

          <div className="card p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-royal-50 text-royal-700">
                <Link2 className="h-4 w-4" />
              </span>
              <h2 className="text-[15px] font-extrabold tracking-tight text-ink">
                Account
              </h2>
            </div>
            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-ink-muted">Owner</span>
                <span className="truncate font-extrabold text-ink">
                  {shop.ownerName || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-ink-muted">Email</span>
                <span className="truncate font-extrabold text-ink">
                  {user?.email ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-ink-muted">Shop link</span>
                <span className="truncate font-extrabold text-royal-700">
                  {shopHost(shop.slug)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
