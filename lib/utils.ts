import type { Lang, Order, OrderStatus, PaymentMethod, Product } from "./types";

export const CURRENCY = "Rs";

export function formatMoney(amount: number): string {
  return `${CURRENCY} ${Math.round(amount).toLocaleString("en-PK")}`;
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("92")) return digits;
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;
  return `92${digits}`;
}

export function waLink(phone: string, message: string): string {
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(message)}`;
}

export function orderWhatsAppMessage(order: Order, shopName: string): string {
  const items = order.items
    .map((item) => `${item.qty} × ${item.name}`)
    .join(", ");
  return `Assalam-o-Alaikum ${order.customerName}! Your order #${order.orderNumber} from ${shopName} for ${items} (${formatMoney(
    order.total,
  )}) is confirmed. We will update you about delivery soon. Shukriya!`;
}

export function reminderMessage(order: Order, shopName: string): string {
  return `Assalam-o-Alaikum ${order.customerName}! A friendly reminder from ${shopName}: ${formatMoney(
    order.total,
  )} for order #${order.orderNumber} is still pending. You can pay by ${
    PAYMENT_LABELS[order.paymentMethod].en
  }. Shukriya!`;
}

export const PAYMENT_LABELS: Record<
  PaymentMethod,
  { en: string; ur: string; icon: string }
> = {
  cod: { en: "Cash on delivery", ur: "کیش آن ڈیلیوری", icon: "truck" },
  easypaisa: { en: "Easypaisa", ur: "ایزی پیسہ", icon: "phone" },
  jazzcash: { en: "JazzCash", ur: "جاز کیش", icon: "phone" },
  bank: { en: "Bank transfer", ur: "بینک ٹرانسفر", icon: "bank" },
};

export const STATUS_LABELS: Record<
  OrderStatus,
  { en: string; ur: string; tone: string; dot: string }
> = {
  pending: {
    en: "Pending",
    ur: "زیر التوا",
    tone: "bg-gold-50 text-gold-800 border-gold-200",
    dot: "bg-gold-500",
  },
  confirmed: {
    en: "Confirmed",
    ur: "تصدیق شدہ",
    tone: "bg-royal-50 text-royal-800 border-royal-200",
    dot: "bg-royal-500",
  },
  paid: {
    en: "Paid",
    ur: "ادا شدہ",
    tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  delivered: {
    en: "Delivered",
    ur: "پہنچا دیا",
    tone: "bg-sky-50 text-sky-700 border-sky-200",
    dot: "bg-sky-500",
  },
  cancelled: {
    en: "Cancelled",
    ur: "منسوخ",
    tone: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
};

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "paid",
  "delivered",
  "cancelled",
];

export const PAYMENT_STATUS_LABELS = {
  pending: { en: "Unpaid", ur: "غیر ادا شدہ" },
  paid: { en: "Paid", ur: "ادا شدہ" },
};

export function themeTile(theme: string): string {
  return PRODUCT_THEMES[theme]?.tile ?? PRODUCT_THEMES.royal.tile;
}

export function logoGradient(theme: string): string {
  return PRODUCT_THEMES[theme]?.tile ?? PRODUCT_THEMES.royal.tile;
}

export const PRODUCT_THEMES: Record<string, { tile: string; label: string }> = {
  royal: {
    tile: "bg-gradient-to-br from-royal-400 via-royal-600 to-royal-900",
    label: "Royal",
  },
  gold: {
    tile: "bg-gradient-to-br from-gold-200 via-gold-400 to-gold-700",
    label: "Gold",
  },
  rose: {
    tile: "bg-gradient-to-br from-rose-300 via-rose-500 to-rose-800",
    label: "Rose",
  },
  emerald: {
    tile: "bg-gradient-to-br from-emerald-300 via-emerald-500 to-emerald-800",
    label: "Emerald",
  },
  ocean: {
    tile: "bg-gradient-to-br from-sky-300 via-sky-500 to-indigo-800",
    label: "Ocean",
  },
  sunset: {
    tile: "bg-gradient-to-br from-orange-300 via-orange-500 to-pink-700",
    label: "Sunset",
  },
  cocoa: {
    tile: "bg-gradient-to-br from-amber-200 via-amber-600 to-stone-900",
    label: "Cocoa",
  },
  berry: {
    tile: "bg-gradient-to-br from-fuchsia-300 via-fuchsia-600 to-purple-900",
    label: "Berry",
  },
};

export const THEME_KEYS = Object.keys(PRODUCT_THEMES);

export const EMOJI_CHOICES = [
  "🎂",
  "🍰",
  "🧁",
  "🍫",
  "🍪",
  "🥐",
  "🍩",
  "☕",
  "👗",
  "🧵",
  "👜",
  "💍",
  "💄",
  "🧴",
  "🌿",
  "🕯️",
  "🎁",
  "🛍️",
];

export function relativeDay(iso: string, lang: Lang = "en"): string {
  const then = new Date(iso);
  const now = new Date();
  const startThen = new Date(then.getFullYear(), then.getMonth(), then.getDate());
  const startNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round(
    (startNow.getTime() - startThen.getTime()) / 86_400_000,
  );
  if (diff === 0) return lang === "ur" ? "آج" : "Today";
  if (diff === 1) return lang === "ur" ? "کل" : "Yesterday";
  if (diff > 1 && diff < 7)
    return lang === "ur" ? `${diff} دن پہلے` : `${diff} days ago`;
  return then.toLocaleDateString(lang === "ur" ? "ur-PK" : "en-PK", {
    day: "numeric",
    month: "short",
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-PK", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function startOfWeek(date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isThisWeek(iso: string): boolean {
  return new Date(iso).getTime() >= startOfWeek().getTime();
}

export function weekBuckets(orders: Order[]): Array<{
  label: string;
  total: number;
  orders: number;
  iso: string;
}> {
  const now = new Date();
  const buckets: Array<{
    label: string;
    total: number;
    orders: number;
    iso: string;
  }> = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const dayOrders = orders.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return (
        t >= d.getTime() &&
        t < next.getTime() &&
        o.orderStatus !== "cancelled"
      );
    });
    buckets.push({
      label: d.toLocaleDateString("en-PK", { weekday: "short" }),
      total: dayOrders
        .filter((o) => o.paymentStatus === "paid")
        .reduce((sum, o) => sum + o.total, 0),
      orders: dayOrders.length,
      iso: d.toISOString(),
    });
  }
  return buckets;
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
}

export function bestSeller(orders: Order[]): {
  product: string;
  units: number;
} | null {
  const counts = new Map<string, number>();
  orders
    .filter((o) => o.orderStatus !== "cancelled")
    .forEach((o) =>
      o.items.forEach((item) =>
        counts.set(item.name, (counts.get(item.name) ?? 0) + item.qty),
      ),
    );
  let best: { product: string; units: number } | null = null;
  counts.forEach((units, product) => {
    if (!best || units > best.units) best = { product, units };
  });
  return best;
}

export function totalItems(items: Product[] | Order["items"]): number {
  return items.length;
}

export const UNLIMITED_STOCK = 999;

export const SHOP_DOMAIN = (
  process.env.NEXT_PUBLIC_SHOP_DOMAIN || "dukaandost.app"
)
  .trim()
  .toLowerCase();

export function shopHost(slug: string): string {
  return `${slugify(slug) || "shop"}.${SHOP_DOMAIN}`;
}

export function shopUrl(slug: string): string {
  return `https://${shopHost(slug)}`;
}

export function shopPath(slug: string): string {
  return `/shop/${slug}`;
}
