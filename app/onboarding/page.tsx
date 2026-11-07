"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  ChevronRight,
  CreditCard,
  Link2,
  MessageCircle,
  Package,
  Plus,
  Smartphone,
  Sparkles,
  Store,
  Trash2,
  Truck,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import type { Lang, PaymentMethod, Product } from "@/lib/types";
import {
  EMOJI_CHOICES,
  PAYMENT_LABELS,
  PRODUCT_THEMES,
  THEME_KEYS,
  UNLIMITED_STOCK,
  cn,
  formatMoney,
  shopHost,
  slugify,
} from "@/lib/utils";
import { ImageUpload } from "@/components/ImageUpload";
import { Logo, ShopAvatar } from "@/components/ui";

const STEPS = ["Shop details", "Products", "Payments", "Publish"];

const PAYMENT_OPTIONS: Array<{ id: PaymentMethod; icon: typeof Truck }> = [
  { id: "cod", icon: Truck },
  { id: "easypaisa", icon: Smartphone },
  { id: "jazzcash", icon: Smartphone },
  { id: "bank", icon: Banknote },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, user } = useAuth();
  const { createShop, addProduct, hasShop, hydrated, lang, setLang } =
    useStore();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [shopForm, setShopForm] = useState({
    name: "",
    ownerName: "",
    whatsappNumber: "",
    tagline: "",
    description: "",
    logoEmoji: "🏪",
    logoColor: "royal",
    logoUrl: null as string | null,
  });
  const [fulfillment, setFulfillment] = useState({
    deliveryNote: "",
    isOpen: true,
  });
  const [paymentForm, setPaymentForm] = useState<{
    methods: PaymentMethod[];
    accounts: { easypaisa: string; jazzcash: string; bank: string };
  }>({
    methods: ["cod"],
    accounts: { easypaisa: "", jazzcash: "", bank: "" },
  });
  const [draftProduct, setDraftProduct] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    emoji: "🎂",
    theme: "royal",
    imageUrl: null as string | null,
  });
  const [newProducts, setNewProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (profile?.fullName) {
      setShopForm((prev) =>
        prev.ownerName ? prev : { ...prev, ownerName: profile.fullName },
      );
    }
  }, [profile?.fullName]);

  useEffect(() => {
    if (hydrated && hasShop) router.replace("/dashboard");
  }, [hydrated, hasShop, router]);

  const previewSlug = useMemo(
    () => slugify(shopForm.name) || "your-shop",
    [shopForm.name],
  );

  function next() {
    if (step === 0) {
      if (!shopForm.name.trim() || !shopForm.whatsappNumber.trim()) {
        setError("Please add your shop name and WhatsApp number.");
        return;
      }
      if (shopForm.whatsappNumber.replace(/\D/g, "").length < 10) {
        setError("Add a valid WhatsApp number with at least 10 digits.");
        return;
      }
    }
    if (step === 1 && newProducts.length === 0) {
      setError("Add at least one product so customers have something to buy.");
      return;
    }
    if (step === 2) {
      if (paymentForm.methods.length === 0) {
        setError("Choose at least one payment method.");
        return;
      }
      if (
        paymentForm.methods.includes("easypaisa") &&
        !paymentForm.accounts.easypaisa.trim()
      ) {
        setError("Add your Easypaisa number, or turn that method off.");
        return;
      }
      if (
        paymentForm.methods.includes("jazzcash") &&
        !paymentForm.accounts.jazzcash.trim()
      ) {
        setError("Add your JazzCash number, or turn that method off.");
        return;
      }
      if (
        paymentForm.methods.includes("bank") &&
        !paymentForm.accounts.bank.trim()
      ) {
        setError("Add your bank account or IBAN, or turn that method off.");
        return;
      }
    }
    setError("");
    setStep((prev) => Math.min(STEPS.length - 1, prev + 1));
  }

  function addDraftProduct() {
    const price = Number(draftProduct.price);
    const stock =
      draftProduct.stock.trim() === ""
        ? UNLIMITED_STOCK
        : Math.max(0, Number(draftProduct.stock) || 0);
    if (!draftProduct.name.trim() || !Number.isFinite(price) || price <= 0) {
      setError("Add a product name and a price above 0.");
      return;
    }
    if (!draftProduct.imageUrl) {
      setError("Upload a real product photo.");
      return;
    }
    setNewProducts((prev) => [
      ...prev,
      {
        id: `draft-${Date.now()}-${prev.length}`,
        name: draftProduct.name.trim(),
        price,
        description: draftProduct.description.trim(),
        emoji: draftProduct.emoji,
        theme: draftProduct.theme,
        imageUrl: draftProduct.imageUrl,
        inStock: stock > 0,
        stock,
      },
    ]);
    setDraftProduct({
      name: "",
      price: "",
      stock: "",
      description: "",
      emoji: "🎂",
      theme: shopForm.logoColor,
      imageUrl: null,
    });
    setError("");
  }

  function toggleMethod(method: PaymentMethod) {
    setPaymentForm((prev) => {
      const has = prev.methods.includes(method);
      if (has && prev.methods.length === 1) return prev;
      return {
        ...prev,
        methods: has
          ? prev.methods.filter((item) => item !== method)
          : [...prev.methods, method],
      };
    });
  }

  async function publish() {
    if (!user) {
      setError("Please sign in first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const shop = await createShop({
        name: shopForm.name.trim(),
        ownerName: shopForm.ownerName.trim() || profile?.fullName || "",
        whatsappNumber: shopForm.whatsappNumber.trim(),
        tagline: shopForm.tagline.trim(),
        description: shopForm.description.trim(),
        logoEmoji: shopForm.logoEmoji,
        logoColor: shopForm.logoColor,
        logoUrl: shopForm.logoUrl,
        isOpen: fulfillment.isOpen,
        slug: previewSlug,
        paymentMethods: paymentForm.methods,
        paymentAccounts: paymentForm.accounts,
        deliveryNote: fulfillment.deliveryNote.trim(),
        language: lang,
      });
      for (const product of newProducts) {
        await addProduct({
          name: product.name,
          price: product.price,
          description: product.description,
          emoji: product.emoji,
          theme: product.theme,
          imageUrl: product.imageUrl,
          inStock: product.inStock,
          stock: product.stock,
        });
      }
      router.push(`/dashboard`);
      router.refresh();
      void shop;
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not create your shop.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (!hydrated) return null;
  if (hasShop) return null;

  return (
    <div className="min-h-screen bg-mesh">
      <header className="border-b border-royal-100/70 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden items-center rounded-full border border-royal-100 bg-white p-1 sm:flex">
              {(["en", "ur"] as Lang[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setLang(value)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-extrabold transition",
                    lang === value
                      ? "bg-royal-700 text-white"
                      : "text-ink-muted",
                    value === "ur" && "font-urdu",
                  )}
                >
                  {value === "en" ? "EN" : "اردو"}
                </button>
              ))}
            </div>
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-xs font-extrabold text-royal-700 hover:underline"
            >
              Dashboard
              <ChevronRight className="h-3.5 w-3.5 flip-rtl" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip border border-royal-200 bg-white text-royal-700">
            <Sparkles className="h-3.5 w-3.5 text-gold-500" />
            Two-minute setup
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Let’s open your <span className="text-royal-700">dukaan</span>
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Add your shop details, list your real products, and choose where you
            want to receive payments.
          </p>
        </div>

        <div className="mx-auto mt-7 flex max-w-3xl items-center gap-2">
          {STEPS.map((label, index) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div className="flex flex-1 flex-col gap-1.5">
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    index <= step ? "bg-royal-700" : "bg-royal-100",
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-extrabold uppercase tracking-wide",
                    index <= step ? "text-royal-700" : "text-ink-muted",
                  )}
                >
                  {index + 1}. {label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="card p-5 sm:p-7">
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-extrabold text-ink">
                    Shop details
                  </h2>
                  <p className="text-xs text-ink-muted">
                    This is what customers will see on your link.
                  </p>
                </div>

                <ImageUpload
                  value={shopForm.logoUrl}
                  onChange={(url) =>
                    setShopForm((prev) => ({ ...prev, logoUrl: url }))
                  }
                  folder="shop"
                  label="Shop logo or photo"
                  hint="A square photo works best. You can change it later."
                  fallback={
                    <span className="text-3xl">{shopForm.logoEmoji}</span>
                  }
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="onb-name">
                      Shop name *
                    </label>
                    <input
                      id="onb-name"
                      value={shopForm.name}
                      onChange={(event) =>
                        setShopForm((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Ayesha Bakes"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="onb-owner">
                      Your name
                    </label>
                    <input
                      id="onb-owner"
                      value={shopForm.ownerName}
                      onChange={(event) =>
                        setShopForm((prev) => ({
                          ...prev,
                          ownerName: event.target.value,
                        }))
                      }
                      placeholder="Ayesha Khan"
                      className="input"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label" htmlFor="onb-whatsapp">
                      WhatsApp number *
                    </label>
                    <input
                      id="onb-whatsapp"
                      value={shopForm.whatsappNumber}
                      onChange={(event) =>
                        setShopForm((prev) => ({
                          ...prev,
                          whatsappNumber: event.target.value,
                        }))
                      }
                      placeholder="0300 1234567"
                      className="input"
                      dir="ltr"
                      inputMode="tel"
                    />
                    <p className="mt-1 text-[11px] text-ink-muted">
                      Orders and confirmations will come here.
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label" htmlFor="onb-tagline">
                      Tagline
                    </label>
                    <input
                      id="onb-tagline"
                      value={shopForm.tagline}
                      onChange={(event) =>
                        setShopForm((prev) => ({
                          ...prev,
                          tagline: event.target.value,
                        }))
                      }
                      placeholder="Fresh homemade cakes in Gulshan"
                      className="input"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label" htmlFor="onb-description">
                      Short description
                    </label>
                    <textarea
                      id="onb-description"
                      value={shopForm.description}
                      onChange={(event) =>
                        setShopForm((prev) => ({
                          ...prev,
                          description: event.target.value,
                        }))
                      }
                      rows={2}
                      placeholder="Tell customers what you make and where you deliver."
                      className="input resize-none"
                    />
                  </div>
                </div>

                <div>
                  <p className="label">Shop icon (if no photo)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {EMOJI_CHOICES.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() =>
                          setShopForm((prev) => ({
                            ...prev,
                            logoEmoji: emoji,
                          }))
                        }
                        className={cn(
                          "grid h-9 w-9 place-items-center rounded-xl border text-lg transition",
                          shopForm.logoEmoji === emoji
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
                  <p className="label">Brand colour</p>
                  <div className="flex flex-wrap gap-2">
                    {THEME_KEYS.map((theme) => (
                      <button
                        key={theme}
                        type="button"
                        onClick={() =>
                          setShopForm((prev) => ({
                            ...prev,
                            logoColor: theme,
                          }))
                        }
                        className={cn(
                          "grid h-9 w-9 place-items-center rounded-xl ring-offset-2 transition",
                          PRODUCT_THEMES[theme].tile,
                          shopForm.logoColor === theme
                            ? "ring-2 ring-royal-600"
                            : "hover:scale-105",
                        )}
                      >
                        {shopForm.logoColor === theme && (
                          <Check className="h-4 w-4 text-white drop-shadow" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-extrabold text-ink">
                    Add your real products
                  </h2>
                  <p className="text-xs text-ink-muted">
                    Your shop starts empty. Add what you actually sell — prices
                    are in rupees.
                  </p>
                </div>

                <div className="rounded-2xl border border-royal-100 bg-royal-50/40 p-3.5">
                  <div className="grid gap-2 sm:grid-cols-[1fr_110px_90px]">
                    <input
                      value={draftProduct.name}
                      onChange={(event) =>
                        setDraftProduct((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Product name"
                      className="input"
                    />
                    <input
                      value={draftProduct.price}
                      onChange={(event) =>
                        setDraftProduct((prev) => ({
                          ...prev,
                          price: event.target.value,
                        }))
                      }
                      placeholder="Price"
                      type="number"
                      min={0}
                      className="input"
                      dir="ltr"
                    />
                    <input
                      value={draftProduct.stock}
                      onChange={(event) =>
                        setDraftProduct((prev) => ({
                          ...prev,
                          stock: event.target.value,
                        }))
                      }
                      placeholder="Stock (optional)"
                      type="number"
                      min={0}
                      className="input"
                      dir="ltr"
                    />
                  </div>
                  <textarea
                    value={draftProduct.description}
                    onChange={(event) =>
                      setDraftProduct((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                    rows={2}
                    placeholder="Short description (optional)"
                    className="input mt-2 resize-none"
                  />
                  <div className="mt-2">
                    <ImageUpload
                      value={draftProduct.imageUrl}
                      onChange={(url) =>
                        setDraftProduct((prev) => ({
                          ...prev,
                          imageUrl: url,
                        }))
                      }
                      folder="products"
                      label="Product photo (required)"
                      hint="Upload a real photo of the product. Shops with photos sell more."
                      aspect="product"
                      required
                      fallback={
                        <span className="text-2xl">{draftProduct.emoji}</span>
                      }
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {EMOJI_CHOICES.slice(0, 12).map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() =>
                          setDraftProduct((prev) => ({ ...prev, emoji }))
                        }
                        className={cn(
                          "grid h-8 w-8 place-items-center rounded-lg border text-base transition",
                          draftProduct.emoji === emoji
                            ? "border-royal-500 bg-white"
                            : "border-transparent hover:bg-white",
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={addDraftProduct}
                      className="btn-primary ml-auto px-3.5 py-2 text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add product
                    </button>
                  </div>
                </div>

                {newProducts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-royal-200 px-4 py-8 text-center">
                    <Package className="mx-auto h-8 w-8 text-royal-300" />
                    <p className="mt-2 text-sm font-bold text-ink">
                      No products added yet
                    </p>
                    <p className="text-xs text-ink-muted">
                      Add at least one to make your shop useful.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {newProducts.map((product) => (
                      <li
                        key={product.id}
                        className="flex items-center gap-3 rounded-2xl border border-royal-100 p-2.5"
                      >
                        <ShopAvatar
                          emoji={product.emoji}
                          theme={product.theme}
                          imageUrl={product.imageUrl}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-extrabold text-ink">
                            {product.name}
                          </p>
                          <p className="text-[11px] font-bold text-royal-700">
                            <span dir="ltr">
                              {formatMoney(product.price)}
                            </span>{" "}
                            · {product.stock} in stock
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setNewProducts((prev) =>
                              prev.filter((item) => item.id !== product.id),
                            )
                          }
                          className="grid h-8 w-8 place-items-center rounded-full text-ink-muted transition hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-extrabold text-ink">
                    Where should customers pay you?
                  </h2>
                  <p className="text-xs text-ink-muted">
                    These are your own accounts. Customers will see them at
                    checkout — we never keep your money.
                  </p>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  {PAYMENT_OPTIONS.map(({ id, icon: Icon }) => {
                    const active = paymentForm.methods.includes(id);
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

                <div className="grid gap-3 sm:grid-cols-3">
                  {paymentForm.methods.includes("easypaisa") && (
                    <div>
                      <label className="label" htmlFor="onb-easypaisa">
                        Easypaisa number
                      </label>
                      <input
                        id="onb-easypaisa"
                        value={paymentForm.accounts.easypaisa}
                        onChange={(event) =>
                          setPaymentForm((prev) => ({
                            ...prev,
                            accounts: {
                              ...prev.accounts,
                              easypaisa: event.target.value,
                            },
                          }))
                        }
                        placeholder="03xx xxxxxxx"
                        className="input"
                        dir="ltr"
                      />
                    </div>
                  )}
                  {paymentForm.methods.includes("jazzcash") && (
                    <div>
                      <label className="label" htmlFor="onb-jazzcash">
                        JazzCash number
                      </label>
                      <input
                        id="onb-jazzcash"
                        value={paymentForm.accounts.jazzcash}
                        onChange={(event) =>
                          setPaymentForm((prev) => ({
                            ...prev,
                            accounts: {
                              ...prev.accounts,
                              jazzcash: event.target.value,
                            },
                          }))
                        }
                        placeholder="03xx xxxxxxx"
                        className="input"
                        dir="ltr"
                      />
                    </div>
                  )}
                  {paymentForm.methods.includes("bank") && (
                    <div>
                      <label className="label" htmlFor="onb-bank">
                        Bank / IBAN
                      </label>
                      <input
                        id="onb-bank"
                        value={paymentForm.accounts.bank}
                        onChange={(event) =>
                          setPaymentForm((prev) => ({
                            ...prev,
                            accounts: {
                              ...prev.accounts,
                              bank: event.target.value,
                            },
                          }))
                        }
                        placeholder="Bank name · IBAN"
                        className="input"
                        dir="ltr"
                      />
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-royal-100 p-4">
                  <p className="flex items-center gap-2 text-xs font-extrabold text-ink">
                    <CreditCard className="h-4 w-4 text-royal-700" />
                    Delivery and store status
                  </p>
                  <textarea
                    value={fulfillment.deliveryNote}
                    onChange={(event) =>
                      setFulfillment((prev) => ({
                        ...prev,
                        deliveryNote: event.target.value,
                      }))
                    }
                    rows={2}
                    placeholder="Delivery areas, timings, or pickup instructions."
                    className="input mt-2 resize-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFulfillment((prev) => ({
                        ...prev,
                        isOpen: !prev.isOpen,
                      }))
                    }
                    className="mt-3 flex w-full items-center justify-between rounded-2xl bg-royal-50/60 px-4 py-3"
                  >
                    <span className="text-left">
                      <span className="block text-xs font-extrabold text-ink">
                        Open for orders
                      </span>
                      <span className="block text-[11px] text-ink-muted">
                        Turn this off anytime from your dashboard.
                      </span>
                    </span>
                    <span
                      className={cn(
                        "relative h-6 w-11 rounded-full transition",
                        fulfillment.isOpen ? "bg-emerald-500" : "bg-royal-200",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
                          fulfillment.isOpen ? "left-[22px]" : "left-0.5",
                        )}
                      />
                    </span>
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-extrabold text-ink">
                    Your shop is ready
                  </h2>
                  <p className="text-xs text-ink-muted">
                    Review everything, then publish and share your link.
                  </p>
                </div>

                <div className="rounded-2xl border border-royal-100 bg-royal-50/40 p-4">
                  <div className="flex items-center gap-3">
                    <ShopAvatar
                      emoji={shopForm.logoEmoji}
                      theme={shopForm.logoColor}
                      imageUrl={shopForm.logoUrl}
                      size="lg"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-ink">
                        {shopForm.name}
                      </p>
                      <p className="truncate text-xs text-ink-muted">
                        {shopForm.tagline || "Fresh orders, made with love"}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-royal-700">
                        <Link2 className="h-3 w-3" />
                        {shopHost(previewSlug)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 border-t border-royal-200/60 pt-3 text-center">
                    <div>
                      <p className="text-lg font-extrabold text-ink">
                        {newProducts.length}
                      </p>
                      <p className="text-[10px] font-bold uppercase text-ink-muted">
                        Products
                      </p>
                    </div>
                    <div>
                      <p className="text-lg font-extrabold text-ink">
                        {paymentForm.methods.length}
                      </p>
                      <p className="text-[10px] font-bold uppercase text-ink-muted">
                        Pay methods
                      </p>
                    </div>
                    <div>
                      <p className="text-lg font-extrabold text-ink">0</p>
                      <p className="text-[10px] font-bold uppercase text-ink-muted">
                        Rs to start
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 rounded-2xl border border-royal-100 p-4">
                  {[
                    "One shareable shop link",
                    "Orders saved with customer details",
                    "Payment status on every order",
                    "Your own payment accounts",
                    "WhatsApp confirmation in one tap",
                    "English and Urdu",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                        <Check className="h-3 w-3" />
                      </span>
                      <span className="text-xs font-semibold text-ink-soft">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-start gap-2 rounded-2xl bg-royal-50 px-3.5 py-3 text-[11px] font-semibold text-royal-800">
                  <MessageCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  Customers never need an account. They open the link, add
                  items and order — you confirm on WhatsApp.
                </div>
              </div>
            )}

            {error && (
              <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
                {error}
              </p>
            )}

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-royal-100 pt-4">
              {step === 0 ? (
                <Link href="/" className="btn-ghost px-4 py-2.5">
                  <ArrowLeft className="h-4 w-4 flip-rtl" />
                  Home
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setStep((prev) => Math.max(0, prev - 1));
                  }}
                  className="btn-ghost px-4 py-2.5"
                >
                  <ArrowLeft className="h-4 w-4 flip-rtl" />
                  Back
                </button>
              )}

              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={next}
                  className="btn-primary px-5 py-2.5"
                >
                  Continue
                  <ArrowRight className="h-4 w-4 flip-rtl" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void publish()}
                  disabled={busy}
                  className="btn-gold px-5 py-2.5 disabled:opacity-60"
                >
                  <Store className="h-4 w-4" />
                  {busy ? "Publishing…" : "Publish my shop"}
                </button>
              )}
            </div>
          </div>

          <div className="lg:sticky lg:top-6 lg:self-start">
            <div className="mx-auto w-full max-w-[320px] rounded-[2.2rem] border-[6px] border-ink bg-ink p-1.5 shadow-2xl">
              <div className="relative overflow-hidden rounded-[1.8rem] bg-[#faf7ff]">
                <div className="relative bg-royal-radial px-4 pb-5 pt-8 text-white">
                  <div className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-gold-300/20 blur-xl" />
                  <div className="flex items-center gap-2.5">
                    <ShopAvatar
                      emoji={shopForm.logoEmoji}
                      theme={shopForm.logoColor}
                      imageUrl={shopForm.logoUrl}
                      size="md"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold">
                        {shopForm.name || "Your shop name"}
                      </p>
                      <p className="truncate text-[10px] text-gold-200">
                        {shopForm.tagline || "Your tagline here"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-1.5">
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[8px] font-bold">
                      {fulfillment.isOpen ? "Open for orders" : "Closed"}
                    </span>
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[8px] font-bold">
                      WhatsApp
                    </span>
                  </div>
                </div>
                <div className="space-y-2 p-3">
                  {newProducts.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-royal-200 px-3 py-6 text-center">
                      <Package className="mx-auto h-5 w-5 text-royal-300" />
                      <p className="mt-1 text-[9px] font-bold text-ink-muted">
                        Your products will appear here
                      </p>
                    </div>
                  ) : (
                    newProducts.slice(0, 3).map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-2 rounded-xl border border-royal-100 bg-white p-1.5"
                      >
                        <ShopAvatar
                          emoji={product.emoji}
                          theme={product.theme}
                          imageUrl={product.imageUrl}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[9px] font-extrabold text-ink">
                            {product.name}
                          </p>
                          <p className="text-[8px] font-bold text-royal-700">
                            {formatMoney(product.price)}
                          </p>
                        </div>
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-royal-700 text-[10px] font-bold text-white">
                          +
                        </span>
                      </div>
                    ))
                  )}
                  <div className="flex items-center justify-between rounded-xl bg-royal-800 px-2.5 py-2 text-white">
                    <span className="text-[8px] font-bold">View cart</span>
                    <span className="text-[8px] font-bold">
                      {formatMoney(
                        newProducts
                          .slice(0, 1)
                          .reduce((sum, item) => sum + item.price, 0),
                      )}
                    </span>
                  </div>
                  <p className="pt-1 text-center text-[7px] font-semibold text-ink-muted">
                    Powered by DukaanDost
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-[11px] font-semibold text-ink-muted">
              Live preview of your shop link
            </p>
          </div>
        </div>

        <div className="mx-auto mt-6 max-w-2xl text-center text-[11px] font-semibold text-ink-muted">
          Your shop starts empty. Orders, earnings and customers only appear
          when they are real.
        </div>
      </main>
    </div>
  );
}
