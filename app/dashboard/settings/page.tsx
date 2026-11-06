"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Check,
  Languages,
  Save,
  ShieldCheck,
  Store,
  Wallet,
} from "lucide-react";
import { useStore } from "@/lib/store";
import type { Lang } from "@/lib/types";
import {
  PRODUCT_THEMES,
  THEME_KEYS,
  cn,
  slugify,
  EMOJI_CHOICES,
} from "@/lib/utils";
import { ImageUpload } from "@/components/ImageUpload";
import { ShopAvatar, useToast } from "@/components/ui";

export default function SettingsPage() {
  const { shop, products, t, updateShop, setLang, hydrated } = useStore();
  const { show, node } = useToast();
  const [draft, setDraft] = useState(shop);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setDraft(shop);
  }, [shop]);

  async function save() {
    setError("");
    if (!draft.name.trim()) {
      setError("Shop name cannot be empty.");
      return;
    }
    setBusy(true);
    try {
      await updateShop({
        name: draft.name.trim(),
        ownerName: draft.ownerName.trim(),
        whatsappNumber: draft.whatsappNumber.trim(),
        tagline: draft.tagline.trim(),
        description: draft.description.trim(),
        slug: slugify(draft.slug || draft.name),
        logoEmoji: draft.logoEmoji,
        logoColor: draft.logoColor,
        logoUrl: draft.logoUrl,
        language: draft.language,
      });
      setLang(draft.language);
      show(t("settings.saved"));
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not save settings.",
      );
    } finally {
      setBusy(false);
    }
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
        <button
          type="button"
          onClick={() => void save()}
          disabled={busy}
          className="btn-primary px-4 py-2.5 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {busy ? "Saving…" : t("common.save")}
        </button>
      </div>

      {error && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
          {error}
        </p>
      )}

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

          <div className="mt-5">
            <ImageUpload
              value={draft.logoUrl}
              onChange={(url) => setDraft((prev) => ({ ...prev, logoUrl: url }))}
              folder="shop"
              label="Shop logo or photo"
              hint="A square photo works best. Shown on your storefront and dashboard."
              fallback={<span className="text-3xl">{draft.logoEmoji}</span>}
            />
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
                  /shop/
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
                  imageUrl={draft.logoUrl}
                  size="lg"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold">
                    {draft.name || "Your shop"}
                  </p>
                  <p className="truncate text-xs text-white/60">
                    /shop/{slugify(draft.slug || draft.name) || "your-shop"}
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

          <div className="card p-5">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-royal-50 text-royal-700">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <h2 className="text-sm font-extrabold text-ink">
                Payments & admin
              </h2>
            </div>
            <p className="mt-1 text-xs text-ink-muted">
              Set your own Easypaisa, JazzCash or bank details and pause orders
              from the Admin page.
            </p>
            <Link
              href="/dashboard/admin"
              className="btn-soft mt-3 w-full px-3 py-2.5 text-xs"
            >
              <Wallet className="h-4 w-4" />
              Open Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
