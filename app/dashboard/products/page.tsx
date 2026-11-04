"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Minus,
  Package,
  PackagePlus,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import {
  EMOJI_CHOICES,
  PRODUCT_THEMES,
  THEME_KEYS,
  cn,
  formatMoney,
} from "@/lib/utils";
import {
  EmptyState,
  Modal,
  ShopAvatar,
  useToast,
} from "@/components/ui";

interface Draft {
  name: string;
  price: string;
  description: string;
  emoji: string;
  theme: string;
  inStock: boolean;
  stock: string;
}

const EMPTY_DRAFT: Draft = {
  name: "",
  price: "",
  description: "",
  emoji: "🎂",
  theme: "rose",
  inStock: true,
  stock: "10",
};

export default function ProductsPage() {
  const {
    products,
    t,
    addProduct,
    updateProduct,
    deleteProduct,
    hydrated,
  } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [error, setError] = useState("");
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [query, setQuery] = useState("");
  const { show, node } = useToast();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("new") === "1") {
      setOpen(true);
      window.history.replaceState(null, "", "/dashboard/products");
    }
  }, []);

  const filtered = products.filter((product) =>
    product.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  function openAdd() {
    setEditing(null);
    setDraft(EMPTY_DRAFT);
    setError("");
    setOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setDraft({
      name: product.name,
      price: String(product.price),
      description: product.description,
      emoji: product.emoji,
      theme: product.theme,
      inStock: product.inStock,
      stock: String(product.stock),
    });
    setError("");
    setOpen(true);
  }

  function save() {
    const price = Number(draft.price);
    if (!draft.name.trim() || !Number.isFinite(price) || price <= 0) {
      setError(t("products.required"));
      return;
    }
    const payload = {
      name: draft.name.trim(),
      price,
      description: draft.description.trim(),
      emoji: draft.emoji,
      theme: draft.theme,
      inStock: draft.inStock,
      stock: Math.max(0, Number(draft.stock) || 0),
    };
    if (editing) {
      updateProduct(editing.id, payload);
      show(t("common.save"));
    } else {
      addProduct(payload);
      show(t("products.add"));
    }
    setOpen(false);
  }

  if (!hydrated) return null;

  const inStockCount = products.filter((product) => product.inStock).length;

  return (
    <div className="space-y-5">
      {node}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {t("products.title")}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-ink-muted">
            {t("products.subtitle")}
          </p>
        </div>
        <button type="button" onClick={openAdd} className="btn-primary px-4 py-2.5">
          <Plus className="h-4 w-4" />
          {t("products.add")}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card flex items-center gap-3 p-4">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-royal-50 text-royal-700">
            <Package className="h-4 w-4" />
          </span>
          <div>
            <p className="text-lg font-extrabold leading-tight text-ink">
              {products.length}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">
              {t("products.items")}
            </p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
            <Check className="h-4 w-4" />
          </span>
          <div>
            <p className="text-lg font-extrabold leading-tight text-ink">
              {inStockCount}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">
              {t("products.inStock")}
            </p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-50 text-rose-700">
            <X className="h-4 w-4" />
          </span>
          <div>
            <p className="text-lg font-extrabold leading-tight text-ink">
              {products.length - inStockCount}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">
              {t("products.outOfStock")}
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted rtl:left-auto rtl:right-3.5" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("store.searchProducts")}
          className="input pl-10 rtl:pl-4 rtl:pr-10"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={PackagePlus}
          title={products.length === 0 ? t("products.empty") : t("orders.empty")}
          hint={t("products.emptyHint")}
          action={
            <button type="button" onClick={openAdd} className="btn-primary px-4 py-2.5">
              <Plus className="h-4 w-4" />
              {t("products.add")}
            </button>
          }
        />
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="card group overflow-hidden transition hover:border-royal-200 hover:shadow-glow/10"
            >
              <div
                className={cn(
                  "relative grid h-36 place-items-center",
                  PRODUCT_THEMES[product.theme]?.tile ??
                    PRODUCT_THEMES.royal.tile,
                )}
              >
                <span className="text-5xl drop-shadow-md transition group-hover:scale-110">
                  {product.emoji}
                </span>
                <span
                  className={cn(
                    "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-extrabold",
                    product.inStock
                      ? "bg-white/90 text-emerald-700"
                      : "bg-rose-600 text-white",
                  )}
                >
                  {product.inStock
                    ? t("products.inStock")
                    : t("products.outOfStock")}
                </span>
                <div className="absolute right-3 top-3 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEdit(product)}
                    className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-royal-800 shadow-sm transition hover:bg-white"
                    title={t("common.edit")}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setToDelete(product)}
                    className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-rose-600 shadow-sm transition hover:bg-white"
                    title={t("common.delete")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-extrabold text-ink">
                      {product.name}
                    </h3>
                    <p className="mt-0.5 line-clamp-2 min-h-[2rem] text-xs text-ink-muted">
                      {product.description || "—"}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-extrabold text-royal-800">
                    <span dir="ltr">{formatMoney(product.price)}</span>
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-royal-100/70 pt-3">
                  <span className="text-[11px] font-semibold text-ink-muted">
                    {product.stock} {t("products.stockCount")}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateProduct(product.id, {
                        inStock: !product.inStock,
                      })
                    }
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold transition",
                      product.inStock
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "bg-royal-50 text-royal-700 hover:bg-royal-100",
                    )}
                  >
                    {product.inStock ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Minus className="h-3 w-3" />
                    )}
                    {product.inStock
                      ? t("products.inStock")
                      : t("products.outOfStock")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? t("products.editProduct") : t("products.addProduct")}
        subtitle={t("products.subtitle")}
        footer={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-ghost flex-1 px-4 py-3"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={save}
              className="btn-primary flex-1 px-4 py-3"
            >
              {t("products.saveProduct")}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl border border-royal-100 bg-royal-50/40 p-3">
            <span
              className={cn(
                "grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-3xl",
                PRODUCT_THEMES[draft.theme]?.tile ??
                  PRODUCT_THEMES.royal.tile,
              )}
            >
              {draft.emoji}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-ink">
                {draft.name || t("products.name")}
              </p>
              <p className="text-xs font-bold text-royal-800" dir="ltr">
                {formatMoney(Number(draft.price) || 0)}
              </p>
              <p className="mt-0.5 text-[11px] text-ink-muted">
                {draft.description || t("products.description")}
              </p>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="product-name">
              {t("products.name")}
            </label>
            <input
              id="product-name"
              value={draft.name}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="Chocolate Fudge Cake"
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="product-price">
                {t("products.price")}
              </label>
              <input
                id="product-price"
                type="number"
                min={0}
                value={draft.price}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, price: event.target.value }))
                }
                placeholder="2500"
                className="input"
                dir="ltr"
              />
            </div>
            <div>
              <label className="label" htmlFor="product-stock">
                {t("products.stock")}
              </label>
              <input
                id="product-stock"
                type="number"
                min={0}
                value={draft.stock}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, stock: event.target.value }))
                }
                placeholder="10"
                className="input"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="product-description">
              {t("products.description")}
            </label>
            <textarea
              id="product-description"
              value={draft.description}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              rows={2}
              placeholder="Rich Belgian chocolate, 1 lb."
              className="input resize-none"
            />
          </div>

          <div>
            <p className="label">{t("products.emoji")}</p>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_CHOICES.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, emoji }))}
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-xl border text-lg transition",
                    draft.emoji === emoji
                      ? "border-royal-500 bg-royal-50"
                      : "border-royal-100 hover:bg-royal-50",
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="label">{t("products.color")}</p>
            <div className="flex flex-wrap gap-2">
              {THEME_KEYS.map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, theme }))}
                  className={cn(
                    "h-9 w-9 rounded-xl ring-offset-2 transition",
                    PRODUCT_THEMES[theme].tile,
                    draft.theme === theme
                      ? "ring-2 ring-royal-600"
                      : "hover:scale-105",
                  )}
                  title={PRODUCT_THEMES[theme].label}
                >
                  {draft.theme === theme && (
                    <Check className="mx-auto h-4 w-4 text-white drop-shadow" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setDraft((prev) => ({ ...prev, inStock: !prev.inStock }))
            }
            className="flex w-full items-center justify-between rounded-2xl border border-royal-100 px-4 py-3"
          >
            <span className="text-sm font-bold text-ink">
              {t("products.inStock")}
            </span>
            <span
              className={cn(
                "relative h-6 w-11 rounded-full transition",
                draft.inStock ? "bg-emerald-500" : "bg-royal-200",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
                  draft.inStock ? "left-[22px]" : "left-0.5",
                )}
              />
            </span>
          </button>

          {error && (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
              {error}
            </p>
          )}
        </div>
      </Modal>

      <Modal
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title={t("products.deleteConfirm")}
        size="sm"
        footer={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setToDelete(null)}
              className="btn-ghost flex-1 px-4 py-3"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={() => {
                if (toDelete) deleteProduct(toDelete.id);
                setToDelete(null);
                show(t("common.delete"));
              }}
              className="btn-danger flex-1 px-4 py-3"
            >
              {t("common.delete")}
            </button>
          </div>
        }
      >
        <div className="flex items-center gap-3">
          {toDelete && (
            <ShopAvatar
              emoji={toDelete.emoji}
              theme={toDelete.theme}
              size="lg"
            />
          )}
          <div>
            <p className="text-sm font-extrabold text-ink">
              {toDelete?.name}
            </p>
            <p className="text-xs text-ink-muted">
              {toDelete ? formatMoney(toDelete.price) : ""}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

