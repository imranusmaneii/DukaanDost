"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  Copy,
  Loader2,
  Store,
  X,
  type LucideIcon,
} from "lucide-react";
import { useStore } from "@/lib/store";
import type { Lang, OrderStatus, PaymentMethod } from "@/lib/types";
import {
  PAYMENT_LABELS,
  PAYMENT_STATUS_LABELS,
  STATUS_LABELS,
  cn,
  logoGradient,
} from "@/lib/utils";
import { isRtl } from "@/lib/i18n";

export function Logo({
  light = false,
  compact = false,
  className,
}: {
  light?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-royal-radial shadow-glow">
        <Store className="h-5 w-5 text-white" strokeWidth={2.4} />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-gold-300 ring-2 ring-white" />
      </span>
      {!compact && (
        <span
          className={cn(
            "text-lg font-extrabold tracking-tight",
            light ? "text-white" : "text-ink",
          )}
        >
          Dukaan<span className="text-royal-700">Dost</span>
          <span className="text-gold-500">.</span>
        </span>
      )}
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2 className={cn("h-4 w-4 animate-spin", className)} strokeWidth={2.5} />
  );
}

export function AppLoader({ label }: { label?: string }) {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-royal-radial shadow-glow">
          <Store className="h-7 w-7 text-white" />
          <span className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-gold-300" />
        </div>
        <p className="text-sm font-semibold text-ink-muted">
          {label ?? "Loading your shop…"}
        </p>
      </div>
    </div>
  );
}

export function StatusPill({
  status,
  lang,
}: {
  status: OrderStatus;
  lang: Lang;
}) {
  const meta = STATUS_LABELS[status];
  return (
    <span className={cn("chip border", meta.tone)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {lang === "ur" ? meta.ur : meta.en}
    </span>
  );
}

export function PaymentPill({
  method,
  lang,
}: {
  method: PaymentMethod;
  lang: Lang;
}) {
  return (
    <span className="chip border border-royal-100 bg-royal-50/70 text-royal-800">
      {lang === "ur" ? PAYMENT_LABELS[method].ur : PAYMENT_LABELS[method].en}
    </span>
  );
}

export function PaymentStatusPill({
  status,
  lang,
}: {
  status: "pending" | "paid";
  lang: Lang;
}) {
  return (
    <span
      className={cn(
        "chip border",
        status === "paid"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-gold-200 bg-gold-50 text-gold-800",
      )}
    >
      {lang === "ur"
        ? PAYMENT_STATUS_LABELS[status].ur
        : PAYMENT_STATUS_LABELS[status].en}
    </span>
  );
}

export function LangToggle({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useStore();
  return (
    <div className="inline-flex items-center rounded-full border border-royal-100 bg-white p-1 shadow-sm">
      <button
        type="button"
        onClick={() => setLang("en")}
        className={cn(
          "rounded-full px-3 py-1.5 text-xs font-bold transition",
          lang === "en"
            ? "bg-royal-700 text-white shadow-sm"
            : "text-ink-muted hover:text-royal-800",
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("ur")}
        className={cn(
          "rounded-full px-3 py-1.5 text-xs font-bold transition",
          lang === "ur"
            ? "bg-royal-700 text-white shadow-sm"
            : "text-ink-muted hover:text-royal-800",
          !compact && "font-urdu",
        )}
      >
        اردو
      </button>
    </div>
  );
}

export function ShopAvatar({
  emoji,
  theme,
  size = "md",
  imageUrl,
}: {
  emoji: string;
  theme: string;
  size?: "sm" | "md" | "lg";
  imageUrl?: string | null;
}) {
  const sizes = {
    sm: "h-10 w-10 text-xl rounded-xl",
    md: "h-12 w-12 text-2xl rounded-2xl",
    lg: "h-16 w-16 text-3xl rounded-3xl",
  };
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden shadow-inner",
        sizes[size],
        logoGradient(theme),
      )}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span className="drop-shadow-sm">{emoji}</span>
      )}
    </span>
  );
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const widths = {
    sm: "sm:max-w-md",
    md: "sm:max-w-xl",
    lg: "sm:max-w-3xl",
  };

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/45 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "animate-pop relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl",
          widths[size],
        )}
      >
        {(title || subtitle) && (
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-royal-100/80 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
            <div>
              {title && (
                <h2 className="text-lg font-extrabold tracking-tight text-ink">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-0.5 text-sm text-ink-muted">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-royal-50 text-royal-800 transition hover:bg-royal-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="px-5 py-5 sm:px-6">{children}</div>
        {footer && (
          <div className="sticky bottom-0 border-t border-royal-100/80 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[85]">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/45 backdrop-blur-sm"
      />
      <aside className="animate-drawer absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl rtl:left-0 rtl:right-auto">
        <div className="flex items-start justify-between gap-4 border-b border-royal-100 px-5 py-4">
          <div>
            {title && (
              <h2 className="text-lg font-extrabold tracking-tight text-ink">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-sm text-ink-muted">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-royal-50 text-royal-800 transition hover:bg-royal-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="border-t border-royal-100 bg-white px-5 py-4">
            {footer}
          </div>
        )}
      </aside>
    </div>,
    document.body,
  );
}

export function CopyButton({
  path,
  label,
  copiedLabel,
  className,
  variant = "ghost",
}: {
  path: string;
  label: string;
  copiedLabel: string;
  className?: string;
  variant?: "ghost" | "soft" | "gold";
}) {
  const [copied, setCopied] = useState(false);
  const { t } = useStore();

  async function copy() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${path}`
        : path;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        variant === "gold"
          ? "btn-gold"
          : variant === "soft"
            ? "btn-soft"
            : "btn-ghost",
        "px-4 py-2.5",
        className,
      )}
    >
      {copied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      <span>{copied ? copiedLabel : label}</span>
      <span className="sr-only">{t("common.copyLink")}</span>
    </button>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  hint,
  action,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-royal-200 bg-royal-50/40 px-6 py-14 text-center">
      <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white text-royal-700 shadow-card">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="text-base font-extrabold text-ink">{title}</h3>
      {hint && (
        <p className="mt-1 max-w-sm text-sm text-ink-muted">{hint}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Toast({
  message,
  tone = "success",
}: {
  message: string;
  tone?: "success" | "info";
}) {
  return (
    <div
      className={cn(
        "animate-toast fixed bottom-24 left-1/2 z-[90] -translate-x-1/2 rounded-full px-4 py-2.5 text-sm font-bold text-white shadow-glow sm:bottom-8",
        tone === "success" ? "bg-emerald-600" : "bg-royal-700",
      )}
    >
      {message}
    </div>
  );
}

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  function show(next: string) {
    setMessage(next);
    window.setTimeout(() => setMessage(null), 2200);
  }
  const node = message ? <Toast message={message} /> : null;
  return { show, node };
}

export function SectionLabel({
  children,
  light = false,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-widest",
        light
          ? "border-white/25 bg-white/10 text-gold-200"
          : "border-royal-200/70 bg-white text-royal-700",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
      {children}
    </span>
  );
}

export function Currency({ value }: { value: string }) {
  return <span dir="ltr">{value}</span>;
}

export function DirText({ lang }: { lang: Lang }) {
  return <span>{isRtl(lang) ? "rtl" : "ltr"}</span>;
}
