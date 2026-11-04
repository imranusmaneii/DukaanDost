"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Banknote,
  Check,
  CreditCard,
  Languages,
  RotateCcw,
  Save,
  Smartphone,
  Store,
  Truck,
} from "lucide-react";
import { useStore } from "@/lib/store";
import type { Lang, PaymentMethod } from "@/lib/types";
import {
  PAYMENT_LABELS,
  PRODUCT_THEMES,
  THEME_KEYS,
  cn,
  slugify,
  EMOJI_CHOICES,
} from "@/lib/utils";
import { Modal, ShopAvatar, useToast } from "@/components/ui";
import { seedShop } from "@/lib/seed";

export default function SettingsPage() {
  const {
    shop,
    products,
    lang,
    t,
    updateShop,
    setLang,
    resetDemo,
    hydrated,
  } = useStore();
  const { show, node } = useToast();
  const [draft, setDraft] = useState(shop);
  const [resetOpen, setResetOpen] = useState(false);

  function toggleMethod(method: PaymentMethod) {
    setDraft((prev) => {
      const has = prev.paymentMethods.includes(method);
      if (has && prev.paymentMethods.length === 1) return prev;
      return {
        ...prev,
        paymentMethods: has
          ? prev.paymentMethods.filter((item) => item !== method)
          : [...prev.paymentMethods, method],
      };
    });
  }

  function save() {
    updateShop({
      ...draft,
      slug: slugify(draft.slug || draft.name),
      language: draft.language,
    });
    setLang(draft.language);
    show(t("settings.saved"));
  }

  if (!hydrated) return null;

  return (
    <div className="space-y-5">
      {node}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {t("settings.title")}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-ink-muted">
            {t("settings.subtitle")}
          </p>
        </div>
        <button type="button" onClick={save} className="btn-primary px-4 py-2.5">
          <Save className="h-4 w-4" />
          {t("common.save")}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 sm:p-6 lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-royal-50 text-royal-700">
              <Store className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-extrabold text-ink">
              {t("settings.shopInfo")}
            </h2>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="shop-name">
                {t("settings.shopName")}
              </label>
              <input
                id="shop-name"
                value={draft.name}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, name: event.target.value }))
                }
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="owner-name">
                {t("settings.ownerName")}
              </label>
              <input
                id="owner-name"
                value={draft.ownerName}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    ownerName: event.target.value,
                  }))
                }
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="whatsapp">
                {t("settings.whatsapp")}
              </label>
              <input
                id="whatsapp"
                value={draft.whatsappNumber}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    whatsappNumber: event.target.value,
                  }))
                }
                className="input"
                dir="ltr"
              />
            </div>
            <div>
              <label className="label" htmlFor="slug">
                {t("settings.slug")}
              </label>
              <div className="flex items-center overflow-hidden rounded-2xl border border-royal-100 bg-white focus-within:border-royal-400 focus-within:ring-4 focus-within:ring-royal-200/60">
                <span className="shrink-0 bg-royal-50 px-3 py-3 text-xs font-bold text-ink-muted">
                  dukaandost.app/shop/
                </span>
                <input
                  id="slug"
                  value={draft.slug}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      slug: event.target.value,
                    }))
                  }
                  className="w-full border-0 bg-transparent px-3 py-3 text-sm focus:outline-none"
                  dir="ltr"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="tagline">
                {t("settings.tagline")}
              </label>
              <input
                id="tagline"
                value={draft.tagline}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, tagline: event.target.value }))
                }
                className="input"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="description">
                {t("settings.description")}
              </label>
              <textarea
                id="description"
                value={draft.description}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                rows={3}
                className="input resize-none"
              />
            </div>
          </div>

          <div className="mt-5 border-t border-royal-100 pt-5">
            <p className="label">{t("products.emoji")}</p>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_CHOICES.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({ ...prev, logoEmoji: emoji }))
                  }
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-xl border text-lg transition",
                    draft.logoEmoji === emoji
                      ? "border-royal-500 bg-royal-50"
                      : "border-royal-100 hover:bg-royal-50",
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <p className="label mt-4">{t("products.color")}</p>
            <div className="flex flex-wrap gap-2">
              {THEME_KEYS.map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({ ...prev, logoColor: theme }))
                  }
                  className={cn(
                    "h-9 w-9 rounded-xl ring-offset-2 transition",
                    PRODUCT_THEMES[theme].tile,
                    draft.logoColor === theme
                      ? "ring-2 ring-royal-600"
                      : "hover:scale-105",
                  )}
                  title={PRODUCT_THEMES[theme].label}
                >
                  {draft.logoColor === theme && (
                    <Check className="mx-auto h-4 w-4 text-white drop-shadow" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card overflow-hidden">
            <div className="relative bg-royal-radial p-5 text-white">
              <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-gold-300/20 blur-xl" />
              <div className="relative flex items-center gap-3">
                <ShopAvatar
                  emoji={draft.logoEmoji}
                  theme={draft.logoColor}
                  size="lg"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold">
                    {draft.name || "Your shop"}
                  </p>
                  <p className="truncate text-xs text-white/60">
                    @{slugify(draft.slug || draft.name) || "your-shop"}
                  </p>
                </div>
              </div>
              <p className="relative mt-3 line-clamp-2 text-xs text-white/75">
                {draft.tagline || t("settings.tagline")}
              </p>
            </div>
            <div className="space-y-2 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ink-muted">
                  {t("products.items")}
                </span>
                <span className="font-extrabold text-ink">
                  {products.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ink-muted">
                  {t("settings.paymentMethods")}
                </span>
                <span className="font-extrabold text-ink">
                  {draft.paymentMethods.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ink-muted">
                  {t("common.language")}
                </span>
                <span className="font-extrabold text-ink">
                  {draft.language === "ur" ? "اردو" : "English"}
                </span>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-gold-50 text-gold-700">
                <Languages className="h-4 w-4" />
              </span>
              <h2 className="text-sm font-extrabold text-ink">
                {t("settings.language")}
              </h2>
            </div>
            <p className="mt-1 text-xs text-ink-muted">
              {t("settings.languageHint")}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(["en", "ur"] as Lang[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setDraft((prev) => ({ ...prev, language: value }));
                    setLang(value);
                  }}
                  className={cn(
                    "rounded-2xl border px-3 py-3 text-sm font-extrabold transition",
                    draft.language === value
                      ? "border-royal-600 bg-royal-50 text-royal-800"
                      : "border-royal-100 text-ink-soft hover:bg-royal-50",
                    value === "ur" && "font-urdu",
                  )}
                >
                  {value === "en" ? "English" : "اردو"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-royal-50 text-royal-700">
            <CreditCard className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-extrabold text-ink">
              {t("settings.paymentMethods")}
            </h2>
            <p className="text-xs text-ink-muted">
              {t("settings.paymentHint")}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              { id: "cod", icon: Truck },
              { id: "easypaisa", icon: Smartphone },
              { id: "jazzcash", icon: Smartphone },
              { id: "bank", icon: Banknote },
            ] as Array<{ id: PaymentMethod; icon: typeof Truck }>
          ).map(({ id, icon: Icon }) => {
            const active = draft.paymentMethods.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleMethod(id)}
                className={cn(
                  "flex items-center gap-2.5 rounded-2xl border px-3.5 py-3 text-left transition rtl:text-right",
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

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {draft.paymentMethods.includes("easypaisa") && (
            <div>
              <label className="label" htmlFor="easypaisa">
                {t("settings.easypaisa")}
              </label>
              <input
                id="easypaisa"
                value={draft.paymentAccounts.easypaisa}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    paymentAccounts: {
                      ...prev.paymentAccounts,
                      easypaisa: event.target.value,
                    },
                  }))
                }
                className="input"
                dir="ltr"
              />
            </div>
          )}
          {draft.paymentMethods.includes("jazzcash") && (
            <div>
              <label className="label" htmlFor="jazzcash">
                {t("settings.jazzcash")}
              </label>
              <input
                id="jazzcash"
                value={draft.paymentAccounts.jazzcash}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    paymentAccounts: {
                      ...prev.paymentAccounts,
                      jazzcash: event.target.value,
                    },
                  }))
                }
                className="input"
                dir="ltr"
              />
            </div>
          )}
          {draft.paymentMethods.includes("bank") && (
            <div>
              <label className="label" htmlFor="bank">
                {t("settings.bank")}
              </label>
              <input
                id="bank"
                value={draft.paymentAccounts.bank}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    paymentAccounts: {
                      ...prev.paymentAccounts,
                      bank: event.target.value,
                    },
                  }))
                }
                className="input"
                dir="ltr"
              />
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-end">
          <button type="button" onClick={save} className="btn-primary px-4 py-2.5">
            <Save className="h-4 w-4" />
            {t("common.save")}
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-700">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-rose-900">
                {t("settings.reset")}
              </h2>
              <p className="mt-0.5 max-w-xl text-xs text-rose-700/80">
                {t("settings.resetHint")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setResetOpen(true)}
            className="btn bg-white px-4 py-2.5 text-rose-700 ring-1 ring-inset ring-rose-200 hover:bg-rose-100"
          >
            <RotateCcw className="h-4 w-4" />
            {t("settings.resetButton")}
          </button>
        </div>
      </div>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title={t("settings.reset")}
        size="sm"
        footer={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setResetOpen(false)}
              className="btn-ghost flex-1 px-4 py-3"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={() => {
                resetDemo();
                setDraft({ ...seedShop, language: lang });
                setResetOpen(false);
                show(t("settings.resetButton"));
              }}
              className="btn-danger flex-1 px-4 py-3"
            >
              {t("settings.resetButton")}
            </button>
          </div>
        }
      >
        <p className="text-sm text-ink-soft">{t("settings.resetHint")}</p>
      </Modal>
    </div>
  );
}
