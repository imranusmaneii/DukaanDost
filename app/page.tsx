import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Bell,
  Check,
  ChefHat,
  Clock,
  Gem,
  Gift,
  Globe2,
  Languages,
  LayoutDashboard,
  Link2,
  MessageCircle,
  Package,
  QrCode,
  Quote,
  Scissors,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  TrendingUp,
  Truck,
  Wallet,
  Zap,
} from "lucide-react";
import { Logo, SectionLabel, ShopAvatar } from "@/components/ui";
import { seedProducts, seedShop } from "@/lib/seed";
import { formatMoney, themeTile } from "@/lib/utils";

const NAV = [
  { label: "Problem", href: "#problem" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Earnings", href: "#earnings" },
  { label: "Pricing", href: "#pricing" },
  { label: "Shops", href: "/shops" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#faf7ff]">
      <header className="sticky top-0 z-50 border-b border-royal-100/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <Link href="/" aria-label="DukaanDost home">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-7 lg:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-bold text-ink-soft transition hover:text-royal-700"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost hidden px-4 py-2.5 sm:inline-flex">
              Sign in
            </Link>
            <Link href="/login?mode=signup" className="btn-primary px-4 py-2.5">
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-mesh">
        <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-royal-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-gold-300/25 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-[0.35]" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-[1.08fr_0.92fr] lg:gap-6">
          <div className="animate-fade-up">
            <SectionLabel>GDG Kolachi · SME & Startup Enablement</SectionLabel>
            <h1 className="mt-4 max-w-xl text-balance text-4xl font-extrabold leading-[1.06] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
              Your shop, your orders, your earnings —{" "}
              <span className="relative whitespace-nowrap text-royal-700">
                all in one link
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 300 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 9C60 3 140 2 298 6"
                    stroke="#f5b301"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              .
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-soft">
              DukaanDost gives home businesses in Pakistan a professional
              online shop in about two minutes. No website, no tech skills, no
              upfront cost. Keep selling on WhatsApp — we keep track of the
              rest.
            </p>

            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Link href="/login?mode=signup" className="btn-gold px-6 py-3.5 text-sm">
                <Sparkles className="h-4 w-4" />
                Create your shop free
              </Link>
              <Link
                href="/shops"
                className="btn-ghost px-6 py-3.5 text-sm"
              >
                <Store className="h-4 w-4" />
                Browse shops
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2">
              {[
                "2-minute setup",
                "No app download",
                "Urdu + English",
                "Free to start",
              ].map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-1.5 text-xs font-bold text-ink-soft"
                >
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                {["A", "B", "R", "S"].map((letter, index) => (
                  <span
                    key={letter}
                    className={`grid h-8 w-8 place-items-center rounded-full border-2 border-white text-[11px] font-extrabold text-white ${
                      ["bg-royal-500", "bg-gold-500", "bg-rose-500", "bg-emerald-500"][
                        index
                      ]
                    }`}
                  >
                    {letter}
                  </span>
                ))}
              </div>
              <p className="text-xs font-semibold text-ink-muted">
                Built for bakers, boutiques, tailors &{" "}
                <span className="font-extrabold text-ink">thousands more</span>
              </p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[420px] animate-fade-up [animation-delay:120ms]">
            <div className="absolute -left-6 top-16 z-20 hidden animate-float sm:block">
              <div className="flex items-center gap-2.5 rounded-2xl border border-royal-100 bg-white px-3.5 py-3 shadow-card">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold-100 text-gold-700">
                  <Bell className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wide text-ink-muted">
                    New order
                  </p>
                  <p className="text-xs font-extrabold text-ink">
                    #1049 · Rs 2,500
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 bottom-24 z-20 hidden animate-float [animation-delay:1.4s] sm:block">
              <div className="rounded-2xl border border-royal-100 bg-white p-3.5 shadow-card">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                    <TrendingUp className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wide text-ink-muted">
                      This week
                    </p>
                    <p className="text-sm font-extrabold text-ink">
                      Rs 16,600
                    </p>
                  </div>
                </div>
                <p className="mt-1.5 text-[10px] font-bold text-emerald-600">
                  +41% vs last week
                </p>
              </div>
            </div>

            <div className="relative mx-auto w-[290px] rounded-[2.6rem] border-[7px] border-ink bg-ink p-1.5 shadow-2xl sm:w-[320px]">
              <div className="overflow-hidden rounded-[2.1rem] bg-[#faf7ff]">
                <div className="relative bg-royal-radial px-4 pb-5 pt-7 text-white">
                  <div className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-gold-300/25 blur-xl" />
                  <div className="flex items-center gap-2.5">
                    <ShopAvatar
                      emoji={seedShop.logoEmoji}
                      theme={seedShop.logoColor}
                      size="md"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold">
                        {seedShop.name}
                      </p>
                      <p className="truncate text-[10px] text-gold-200">
                        {seedShop.tagline}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5">
                    <span className="flex items-center gap-1 rounded-full bg-emerald-400/20 px-2 py-0.5 text-[8px] font-bold text-emerald-200">
                      <span className="h-1 w-1 rounded-full bg-emerald-300" />
                      Open for orders
                    </span>
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[8px] font-bold">
                      COD · Easypaisa
                    </span>
                  </div>
                </div>
                <div className="space-y-2 p-3">
                  {seedProducts.slice(0, 3).map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-2 rounded-xl border border-royal-100 bg-white p-1.5"
                    >
                      <span
                        className={`grid h-10 w-10 place-items-center rounded-lg text-lg ${themeTile(
                          product.theme,
                        )}`}
                      >
                        {product.emoji}
                      </span>
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
                  ))}
                  <div className="flex items-center justify-between rounded-xl bg-royal-800 px-2.5 py-2 text-white">
                    <span className="flex items-center gap-1 text-[8px] font-bold">
                      <ShoppingCart className="h-2.5 w-2.5 text-gold-300" />
                      2 items
                    </span>
                    <span className="text-[8px] font-bold">
                      Rs 3,700 · View cart
                    </span>
                  </div>
                  <p className="pt-1 text-center text-[7px] font-semibold text-ink-muted">
                    Powered by DukaanDost
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-12 sm:px-6">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-royal-100 bg-royal-100 shadow-card sm:grid-cols-4">
            {[
              { value: "2 min", label: "To open your shop", icon: Zap },
              { value: "0", label: "Tech skills needed", icon: ShieldCheck },
              { value: "Rs 0", label: "To get started", icon: Wallet },
              { value: "اردو + EN", label: "One-tap language", icon: Languages },
            ].map((stat) => (
              <div key={stat.label} className="bg-white px-4 py-4 sm:px-5 sm:py-5">
                <stat.icon className="h-4 w-4 text-gold-500" />
                <p className="mt-2 text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
                  {stat.value}
                </p>
                <p className="text-[11px] font-semibold text-ink-muted">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="problem" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="lg:sticky lg:top-24">
            <SectionLabel>The problem</SectionLabel>
            <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Chat apps were built for talking.{" "}
              <span className="text-royal-700">Not for selling.</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              Home businesses in Pakistan run on WhatsApp and Instagram DMs.
              Orders get buried, prices get typed again and again, and nobody
              knows what they actually earned this month.
            </p>

            <div className="mt-6 rounded-3xl border border-royal-100 bg-white p-5 shadow-card">
              <Quote className="h-6 w-6 text-gold-400" />
              <p className="mt-2 text-sm font-semibold leading-relaxed text-ink">
                “I lose track of who has paid and who still owes me. Every
                evening I am scrolling through chats to find orders.”
              </p>
              <div className="mt-3 flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-rose-100 text-xs font-extrabold text-rose-700">
                  A
                </span>
                <div>
                  <p className="text-xs font-extrabold text-ink">Ayesha, 28</p>
                  <p className="text-[11px] text-ink-muted">
                    Home baker · Gulshan, Karachi
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                icon: MessageCircle,
                title: "Lost orders",
                body: "An order sits in a chat with 200 unread messages and is never fulfilled.",
                tone: "bg-rose-50 text-rose-700",
              },
              {
                icon: Clock,
                title: "Repeated work",
                body: "The same price list is typed or forwarded to every customer, every day.",
                tone: "bg-gold-50 text-gold-700",
              },
              {
                icon: Wallet,
                title: "Unclear payments",
                body: "Nobody remembers who paid by Easypaisa or JazzCash and who owes cash.",
                tone: "bg-royal-50 text-royal-700",
              },
              {
                icon: BarChart3,
                title: "No earnings picture",
                body: "You cannot say how much you earned this week or which product sells best.",
                tone: "bg-sky-50 text-sky-700",
              },
              {
                icon: Store,
                title: "Unprofessional image",
                body: "No catalogue, no order number, no proof of purchase — so customers trust less.",
                tone: "bg-emerald-50 text-emerald-700",
              },
              {
                icon: Package,
                title: "Tools are too heavy",
                body: "Full e-commerce platforms need a website, a domain, a fee and English.",
                tone: "bg-fuchsia-50 text-fuchsia-700",
              },
            ].map((pain) => (
              <div
                key={pain.title}
                className="group rounded-3xl border border-royal-100 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-royal-200 hover:shadow-glow/10"
              >
                <span
                  className={`grid h-10 w-10 place-items-center rounded-2xl ${pain.tone}`}
                >
                  <pain.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 text-sm font-extrabold text-ink">
                  {pain.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  {pain.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="border-y border-royal-100 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>The simple fix</SectionLabel>
            <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              One link. One order list.{" "}
              <span className="text-royal-700">One earnings view.</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              DukaanDost does not replace WhatsApp. It sits beside it, so
              customers keep chatting where they already trust you.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Link2,
                title: "Shop setup in minutes",
                body: "Add your shop name, logo, WhatsApp number and products. Get a shareable link like ayesha-bakes.dukaandost.app.",
                tag: "2-minute setup",
              },
              {
                icon: ShoppingBag,
                title: "Customer storefront",
                body: "Customers browse products, add to cart, enter their details and place an order. No signup needed.",
                tag: "No account required",
              },
              {
                icon: LayoutDashboard,
                title: "Order dashboard",
                body: "Every order saved with a number, items, customer details and status. New orders appear instantly.",
                tag: "Real-time",
              },
              {
                icon: TrendingUp,
                title: "Weekly earnings",
                body: "See this week's earnings, order count, average order value and your best-selling product.",
                tag: "No spreadsheet",
              },
              {
                icon: MessageCircle,
                title: "WhatsApp confirmation",
                body: "One tap opens WhatsApp with a ready-made confirmation message. No Business API or approval needed.",
                tag: "Keeps your channel",
              },
              {
                icon: Languages,
                title: "Urdu and English",
                body: "Switch the whole interface with one tap, including right-to-left support. Built for local sellers first.",
                tag: "Stand-out feature",
                gold: true,
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className={`relative overflow-hidden rounded-3xl border p-5 transition hover:-translate-y-0.5 ${
                  feature.gold
                    ? "border-gold-300 bg-gold-50/60 shadow-gold"
                    : "border-royal-100 bg-white shadow-card hover:border-royal-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`grid h-11 w-11 place-items-center rounded-2xl ${
                      feature.gold
                        ? "bg-gold-300 text-royal-950"
                        : "bg-royal-50 text-royal-700"
                    }`}
                  >
                    <feature.icon className="h-5 w-5" />
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                      feature.gold
                        ? "bg-royal-800 text-gold-200"
                        : "bg-royal-50 text-royal-700"
                    }`}
                  >
                    {feature.tag}
                  </span>
                </div>
                <h3 className="mt-4 text-sm font-extrabold text-ink">
                  {feature.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  {feature.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {[
              { icon: Languages, label: "Urdu toggle" },
              { icon: Wallet, label: "Pending payments list" },
              { icon: QrCode, label: "QR code" },
              { icon: Truck, label: "Payment instructions" },
              { icon: Sparkles, label: "AI product help" },
            ].map((item) => (
              <span
                key={item.label}
                className="flex items-center gap-1.5 rounded-full border border-royal-100 bg-white px-3 py-1.5 text-[11px] font-bold text-ink-soft"
              >
                <item.icon className="h-3.5 w-3.5 text-gold-500" />
                {item.label}
              </span>
            ))}
            <span className="rounded-full bg-royal-50 px-3 py-1.5 text-[11px] font-extrabold text-royal-700">
              + more after the MVP
            </span>
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            From signup to first order,{" "}
            <span className="text-royal-700">without the mess.</span>
          </h2>
        </div>

        <div className="relative mt-10 grid gap-4 md:grid-cols-3">
          <div className="pointer-events-none absolute left-[16%] right-[16%] top-10 hidden border-t-2 border-dashed border-royal-200 md:block" />
          {[
            {
              step: "01",
              icon: Store,
              title: "Set up your shop",
              body: "Sign up, add your shop name, logo, WhatsApp number and a few products with photos and prices.",
            },
            {
              step: "02",
              icon: Link2,
              title: "Share one link",
              body: "Copy your shop link or download the QR code. Put it in your Instagram bio, WhatsApp status or a chat.",
            },
            {
              step: "03",
              icon: Bell,
              title: "Take orders & get paid",
              body: "Orders appear instantly. Confirm on WhatsApp, mark payments and watch your weekly earnings grow.",
            },
          ].map((step) => (
            <div
              key={step.step}
              className="relative rounded-3xl border border-royal-100 bg-white p-6 shadow-card"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-royal-radial text-white shadow-glow">
                  <step.icon className="h-5 w-5" />
                </span>
                <span className="text-3xl font-extrabold tracking-tight text-royal-100">
                  {step.step}
                </span>
              </div>
              <h3 className="mt-4 text-base font-extrabold text-ink">
                {step.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-royal-100 bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionLabel>Stay on WhatsApp</SectionLabel>
            <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Customers chat where they trust you.{" "}
              <span className="text-royal-700">We handle the rest.</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              No WhatsApp Business API. No approvals. No monthly integration.
              DukaanDost uses simple wa.me links, so one tap opens WhatsApp
              with a ready-made message.
            </p>
            <div className="mt-6 space-y-3">
              {[
                "Pre-filled confirmation with order number and total",
                "Payment reminder button for unpaid orders",
                "Customers order from your link, not from a chat",
                "You keep your customer relationship — no marketplace",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span className="text-sm font-semibold text-ink-soft">
                    {item}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/shops"
              className="btn-primary mt-7 px-5 py-3"
            >
              Try the customer flow
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="pointer-events-none absolute -inset-4 rounded-[2.5rem] bg-royal-100/50 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-royal-100 bg-[#efe7de] shadow-2xl">
              <div className="flex items-center gap-3 bg-[#075e54] px-4 py-3 text-white">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-sm font-extrabold">
                  AB
                </span>
                <div className="flex-1">
                  <p className="text-sm font-extrabold">Ayesha Bakes</p>
                  <p className="text-[10px] text-white/70">online</p>
                </div>
                <MessageCircle className="h-4 w-4" />
              </div>
              <div className="space-y-2.5 px-3.5 py-5">
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 shadow-sm">
                  <p className="text-[11px] font-semibold text-ink">
                    Assalam-o-Alaikum, chocolate cake kitne ka hai?
                  </p>
                  <p className="mt-0.5 text-right text-[8px] text-ink-muted">
                    10:18 AM
                  </p>
                </div>
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-[#dcf8c6] px-3 py-2 shadow-sm">
                  <p className="text-[11px] font-semibold text-ink">
                    Walaikum salam! Yahan se order karein, sab prices likhe
                    hain 👇
                  </p>
                  <p className="mt-1 break-all rounded-lg bg-white/70 px-2 py-1 text-[9px] font-bold text-royal-700">
                    dukaandost.app/shops
                  </p>
                  <p className="mt-0.5 text-right text-[8px] text-ink-muted">
                    10:19 AM
                  </p>
                </div>
                <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 shadow-sm">
                  <p className="text-[11px] font-semibold text-ink">
                    Order #1042 confirm ho gaya. 1 chocolate cake (Rs 2,500),
                    kal deliver hoga. Shukriya!
                  </p>
                  <div className="mt-1.5 flex items-center gap-1 text-[9px] font-bold text-emerald-600">
                    <BadgeCheck className="h-3 w-3" />
                    Sent from DukaanDost
                  </div>
                </div>
                <div className="ml-auto flex w-fit items-center gap-1.5 rounded-full bg-[#25d366] px-3 py-2 text-[10px] font-extrabold text-white shadow">
                  <MessageCircle className="h-3.5 w-3.5" />
                  Send WhatsApp confirmation
                </div>
              </div>
            </div>
            <div className="absolute -right-3 -top-3 hidden animate-float rounded-2xl border border-gold-200 bg-gold-50 px-3 py-2 shadow-gold sm:block">
              <p className="flex items-center gap-1 text-[10px] font-extrabold text-gold-800">
                <Zap className="h-3 w-3" />
                No API approval
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="earnings" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionLabel>Your money, clear</SectionLabel>
            <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Know what you earned{" "}
              <span className="text-royal-700">this week.</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              No notebooks. No guessing. A simple dashboard shows weekly
              earnings, order count, average order value, best seller and
              exactly how much is still pending collection.
            </p>
            <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {[
                { icon: TrendingUp, label: "Weekly earnings" },
                { icon: ShoppingBag, label: "Order count" },
                { icon: Star, label: "Best-selling product" },
                { icon: Wallet, label: "Pending collection" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 rounded-2xl border border-royal-100 bg-white px-3.5 py-2.5"
                >
                  <item.icon className="h-4 w-4 text-gold-500" />
                  <span className="text-xs font-bold text-ink-soft">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard"
              className="btn-gold mt-7 px-5 py-3"
            >
              Explore the demo dashboard
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-royal-radial p-5 text-white shadow-glow sm:p-6">
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-gold-300/20 blur-3xl" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-gold-200">
                  Earnings this week
                </p>
                <p className="mt-1 text-3xl font-extrabold tracking-tight">
                  Rs 16,600
                </p>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-emerald-400/20 px-2.5 py-1 text-[10px] font-extrabold text-emerald-200">
                <TrendingUp className="h-3 w-3" />
                +41%
              </span>
            </div>

            <div className="relative mt-5 grid grid-cols-3 gap-2">
              {[
                { label: "Orders", value: "9" },
                { label: "Avg. order", value: "Rs 1,844" },
                { label: "Pending", value: "Rs 7,100" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/10 bg-white/10 px-3 py-2"
                >
                  <p className="text-[9px] font-bold uppercase tracking-wide text-white/55">
                    {stat.label}
                  </p>
                  <p className="text-sm font-extrabold">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="relative mt-5 rounded-2xl bg-white p-4 text-ink">
              <div className="flex items-center justify-between">
                <p className="text-xs font-extrabold">Weekly earnings</p>
                <span className="text-[10px] font-bold text-ink-muted">
                  1 Nov – 7 Nov
                </span>
              </div>
              <div className="mt-4 flex h-28 items-end justify-between gap-2" dir="ltr">
                {[42, 58, 35, 74, 62, 90, 48].map((height, index) => (
                  <div
                    key={index}
                    className="flex h-full flex-1 items-end"
                  >
                    <div
                      style={{ height: `${height}%` }}
                      className={`w-full rounded-t-lg ${
                        index === 5
                          ? "bg-gold-shine shadow-gold"
                          : "bg-gradient-to-t from-royal-200 to-royal-500"
                      }`}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[9px] font-bold text-ink-muted">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day) => (
                    <span key={day} className="flex-1 text-center">
                      {day}
                    </span>
                  ),
                )}
              </div>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-royal-50 px-3 py-2">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-ink-soft">
                  <Gift className="h-3.5 w-3.5 text-gold-500" />
                  Best seller
                </span>
                <span className="text-[10px] font-extrabold text-royal-800">
                  Eid Cookie Box · 5 sold
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-royal-100 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>Built for real sellers</SectionLabel>
            <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              If you sell from home,{" "}
              <span className="text-royal-700">this is for you.</span>
            </h2>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {[
              { icon: ChefHat, label: "Home bakers" },
              { icon: ShoppingBag, label: "Boutiques" },
              { icon: Scissors, label: "Tailors" },
              { icon: Gem, label: "Jewellery" },
              { icon: Gift, label: "Gift boxes" },
              { icon: Sparkles, label: "Makeup artists" },
              { icon: Package, label: "Handicrafts" },
              { icon: Store, label: "General stores" },
            ].map((item) => (
              <span
                key={item.label}
                className="flex items-center gap-1.5 rounded-full border border-royal-100 bg-[#faf7ff] px-3.5 py-2 text-xs font-bold text-ink-soft"
              >
                <item.icon className="h-3.5 w-3.5 text-royal-600" />
                {item.label}
              </span>
            ))}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                name: "Ayesha",
                age: "28",
                business: "Home baker in Gulshan, sells cakes via Instagram",
                problem: "Orders get lost in DMs and she forgets deposits",
                gives: "A shop link, an order list and payment status per order",
                color: "bg-rose-100 text-rose-700",
                emoji: "🎂",
              },
              {
                name: "Bilal",
                age: "35",
                business: "Runs a small clothing boutique page",
                problem: "Answers “price?” 50 times a day",
                gives: "A catalogue link so customers see prices without asking",
                color: "bg-royal-100 text-royal-700",
                emoji: "👗",
              },
              {
                name: "Rubina",
                age: "45",
                business: "Tailor working from home",
                problem: "Writes orders in a notebook and has no income picture",
                gives: "A simple dashboard with weekly earnings",
                color: "bg-gold-100 text-gold-800",
                emoji: "🧵",
              },
            ].map((persona) => (
              <div
                key={persona.name}
                className="rounded-3xl border border-royal-100 bg-[#faf7ff] p-5"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`grid h-11 w-11 place-items-center rounded-2xl text-xl ${persona.color}`}
                  >
                    {persona.emoji}
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-ink">
                      {persona.name},{" "}
                      <span className="font-bold text-ink-muted">
                        {persona.age}
                      </span>
                    </p>
                    <p className="text-[11px] text-ink-muted">
                      {persona.business}
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 border-t border-royal-100 pt-3">
                  <p className="text-[11px] font-semibold text-rose-700">
                    <span className="font-extrabold">Problem:</span>{" "}
                    {persona.problem}
                  </p>
                  <p className="text-[11px] font-semibold text-emerald-700">
                    <span className="font-extrabold">DukaanDost:</span>{" "}
                    {persona.gives}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>Pricing</SectionLabel>
          <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Free to start.{" "}
            <span className="text-royal-700">Pay only when you grow.</span>
          </h2>
          <p className="mt-3 text-sm text-ink-soft">
            Open your shop, list products and take orders without paying
            anything. Upgrade later for unlimited use and extras.
          </p>
        </div>

        <div className="mx-auto mt-9 grid max-w-4xl gap-4 md:grid-cols-2">
          <div className="card relative overflow-hidden p-6">
            <span className="chip bg-emerald-50 text-emerald-700">
              Start here
            </span>
            <p className="mt-4 text-sm font-extrabold text-ink">Free</p>
            <p className="mt-1 text-4xl font-extrabold tracking-tight text-ink">
              Rs 0
              <span className="text-sm font-bold text-ink-muted"> / forever</span>
            </p>
            <p className="mt-2 text-xs text-ink-muted">
              Everything you need for your first orders.
            </p>
            <div className="mt-5 space-y-2.5">
              {[
                "Shop link and QR code",
                "Up to 10 products",
                "Order dashboard and status",
                "Weekly earnings summary",
                "WhatsApp confirmation",
                "English + Urdu",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span className="text-xs font-semibold text-ink-soft">
                    {item}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/login?mode=signup"
              className="btn-primary mt-6 w-full py-3"
            >
              Create my free shop
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-royal-radial p-6 text-white shadow-glow">
            <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-gold-300/25 blur-2xl" />
            <div className="relative flex items-center justify-between">
              <span className="chip bg-gold-300 text-royal-950">
                <Sparkles className="h-3 w-3" />
                Growth
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-gold-200">
                Coming soon
              </span>
            </div>
            <p className="relative mt-4 text-sm font-extrabold text-gold-200">
              Unlimited
            </p>
            <p className="relative mt-1 text-4xl font-extrabold tracking-tight">
              Rs 499
              <span className="text-sm font-bold text-white/60"> / month</span>
            </p>
            <p className="relative mt-2 text-xs text-white/65">
              For shops that are growing every week.
            </p>
            <div className="relative mt-5 space-y-2.5">
              {[
                "Unlimited products and orders",
                "Custom domain and branding",
                "Automated payment reminders",
                "Repeat customer list",
                "Priority support",
                "Early access to AI features",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-white/15 text-gold-300">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span className="text-xs font-semibold text-white/85">
                    {item}
                  </span>
                </div>
              ))}
            </div>
            <button
              type="button"
              disabled
              className="relative mt-6 w-full rounded-full bg-white/10 py-3 text-sm font-extrabold text-white/70 ring-1 ring-inset ring-white/20"
            >
              Join the waitlist
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-royal-radial px-6 py-12 text-center shadow-glow sm:px-10 sm:py-16">
          <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-gold-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-dots opacity-[0.07]" />
          <div className="relative mx-auto max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-gold-200">
              <Sparkles className="h-3.5 w-3.5" />
              Your shop is two minutes away
            </span>
            <h2 className="mt-4 text-balance text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
              Stop losing orders in chats.{" "}
              <span className="text-gold-300">Start your dukaan today.</span>
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-white/70">
              Free to start, no card needed, and your customers never have to
              download an app. Just one link.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
              <Link href="/login?mode=signup" className="btn-gold px-6 py-3.5">
                Create your shop free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="btn bg-white/10 px-6 py-3.5 text-white ring-1 ring-inset ring-white/25 hover:bg-white/20"
              >
                Sign in to dashboard
              </Link>
            </div>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-white/50">
              <Globe2 className="h-3.5 w-3.5" />
              Made in Pakistan, for Pakistan · اردو اور English
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-royal-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Logo />
              <p className="mt-3 max-w-xs text-xs leading-relaxed text-ink-muted">
                Your shop, your orders, your earnings, all in one link. Apni
                dukaan, apni kamai.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Only you can see customer details
              </div>
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-ink">
                Product
              </p>
              <div className="mt-3 space-y-2">
                {[
                  { label: "Features", href: "#features" },
                  { label: "How it works", href: "#how" },
                  { label: "Pricing", href: "#pricing" },
                  { label: "Browse shops", href: "/shops" },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block text-xs font-semibold text-ink-muted transition hover:text-royal-700"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-ink">
                For owners
              </p>
              <div className="mt-3 space-y-2">
                {[
                  { label: "Create a shop", href: "/login?mode=signup" },
                  { label: "Open dashboard", href: "/dashboard" },
                  { label: "Sign in", href: "/login" },
                  { label: "Settings", href: "/dashboard/settings" },
                ].map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-xs font-semibold text-ink-muted transition hover:text-royal-700"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-ink">
                Built for
              </p>
              <p className="mt-3 text-xs leading-relaxed text-ink-muted">
                GDG Kolachi Hackathon
                <br />
                SME & Startup Enablement
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="chip bg-royal-50 text-royal-700">React</span>
                <span className="chip bg-gold-50 text-gold-800">Tailwind</span>
                <span className="chip bg-emerald-50 text-emerald-700">
                  WhatsApp
                </span>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-royal-100 pt-5 sm:flex-row">
            <p className="text-[11px] font-semibold text-ink-muted">
              © 2026 DukaanDost. A hackathon prototype.
            </p>
            <p className="text-[11px] font-semibold text-ink-muted">
              Made with royal purple and sun gold in Karachi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

