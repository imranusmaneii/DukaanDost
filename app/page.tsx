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
  Menu,
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
import { Logo, ShopAvatar } from "@/components/ui";
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

const PAINS = [
  {
    icon: MessageCircle,
    title: "Lost orders",
    body: "An order sits in a chat with 200 unread messages and is never fulfilled.",
  },
  {
    icon: Clock,
    title: "Repeated work",
    body: "The same price list is typed or forwarded to every customer, every day.",
  },
  {
    icon: Wallet,
    title: "Unclear payments",
    body: "Nobody remembers who paid by Easypaisa or JazzCash and who owes cash.",
  },
  {
    icon: BarChart3,
    title: "No earnings picture",
    body: "You cannot say how much you earned this week or which product sells best.",
  },
  {
    icon: Store,
    title: "Unprofessional image",
    body: "No catalogue, no order number, no proof of purchase — so customers trust less.",
  },
  {
    icon: Package,
    title: "Tools are too heavy",
    body: "Full e-commerce platforms need a website, a domain, a fee and English.",
  },
];

const FEATURES = [
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
];

const STEPS = [
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
];

const CATEGORIES = [
  { icon: ChefHat, label: "Home bakers" },
  { icon: ShoppingBag, label: "Boutiques" },
  { icon: Scissors, label: "Tailors" },
  { icon: Gem, label: "Jewellery" },
  { icon: Gift, label: "Gift boxes" },
  { icon: Sparkles, label: "Makeup artists" },
  { icon: Package, label: "Handicrafts" },
  { icon: Store, label: "General stores" },
];

const PERSONAS = [
  {
    name: "Ayesha Bakes",
    owner: "Ayesha, 28",
    business: "Home baker in Gulshan, sells cakes via Instagram",
    problem: "Orders get lost in DMs and she forgets deposits",
    gives: "A shop link, an order list and payment status per order",
    cover: "lp-cover-rose",
    emoji: "🎂",
    products: [
      { emoji: "🎂", name: "Fudge cake" },
      { emoji: "🧁", name: "Cupcakes" },
      { emoji: "🍪", name: "Cookies" },
    ],
  },
  {
    name: "Bilal Threads",
    owner: "Bilal, 35",
    business: "Runs a small clothing boutique page",
    problem: "Answers “price?” 50 times a day",
    gives: "A catalogue link so customers see prices without asking",
    cover: "lp-cover-royal",
    emoji: "👗",
    products: [
      { emoji: "👗", name: "Lawn suit" },
      { emoji: "🧥", name: "Kurta" },
      { emoji: "🧣", name: "Dupatta" },
    ],
  },
  {
    name: "Rubina Stitches",
    owner: "Rubina, 45",
    business: "Tailor working from home",
    problem: "Writes orders in a notebook and has no income picture",
    gives: "A simple dashboard with weekly earnings",
    cover: "lp-cover-gold",
    emoji: "🧵",
    products: [
      { emoji: "🧵", name: "Stitching" },
      { emoji: "👚", name: "Alterations" },
      { emoji: "🪡", name: "Custom" },
    ],
  },
];

const FREE_FEATURES = [
  "Shop link and QR code",
  "Up to 10 products",
  "Order dashboard and status",
  "Weekly earnings summary",
  "WhatsApp confirmation",
  "English + Urdu",
];

const GROWTH_FEATURES = [
  "Unlimited products and orders",
  "Custom domain and branding",
  "Automated payment reminders",
  "Repeat customer list",
  "Priority support",
  "Early access to AI features",
];

export default function LandingPage() {
  return (
    <div className="landing-ui">
      <header className="lp-nav">
        <div className="lp-wrap lp-nav-inner">
          <Link href="/" aria-label="DukaanDost home">
            <Logo light />
          </Link>

          <nav className="lp-nav-links" aria-label="Main navigation">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="lp-nav-link">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="lp-nav-actions">
            <Link href="/login" className="lp-nav-signin">
              Sign in
            </Link>
            <Link
              href="/login?switch=1"
              className="lp-btn lp-btn-gold lp-btn-sm"
            >
              Start free
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <details className="lp-mobile-menu">
              <summary aria-label="Open menu">
                <Menu className="h-4 w-4" />
              </summary>
              <div className="lp-mobile-panel">
                {NAV.map((item) => (
                  <a key={item.href} href={item.href}>
                    {item.label}
                  </a>
                ))}
                <Link href="/login">Sign in</Link>
              </div>
            </details>
          </div>
        </div>
      </header>

      <main>
        <section className="lp-hero">
          <div className="lp-wrap lp-hero-grid">
            <div className="lp-reveal">
              <span className="lp-eyebrow">
                Built for Pakistan&apos;s home businesses
              </span>
              <h1 className="lp-h1 mt-5">
                Your business deserves
                <span className="block">
                  a <span className="text-[#F2B956]">beautiful place</span>
                </span>
                <span className="block">to grow.</span>
              </h1>
              <p className="lp-hero-sub">
                DukaanDost gives home businesses in Pakistan a professional
                online shop in about two minutes. No website, no tech skills,
                no upfront cost. Keep selling on WhatsApp — we keep track of the
                rest.
              </p>

              <div className="lp-hero-actions">
                <Link
                  href="/login?switch=1"
                  className="lp-btn lp-btn-gold lp-btn-lg"
                >
                  <Sparkles className="h-4 w-4" />
                  Create your shop free
                </Link>
                <Link
                  href="/shops"
                  className="lp-btn lp-btn-ghost-dark lp-btn-lg"
                >
                  <Store className="h-4 w-4" />
                  Browse shops
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="lp-hero-trust">
                {[
                  "2-minute setup",
                  "No app download",
                  "Urdu + English",
                  "Free to start",
                ].map((item) => (
                  <span key={item}>
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    {item}
                  </span>
                ))}
              </div>

              <div className="lp-hero-social">
                <div className="lp-avatars">
                  {["A", "B", "R", "S"].map((letter, index) => (
                    <span key={letter} className={`lp-avatar-${index + 1}`}>
                      {letter}
                    </span>
                  ))}
                </div>
                <p>
                  Built for bakers, boutiques, tailors &{" "}
                  <strong>thousands more</strong>
                </p>
              </div>
            </div>

            <div className="lp-hero-visual lp-reveal lp-delay-2">
              <span className="lp-orb lp-orb-gold" aria-hidden="true" />
              <span className="lp-orb lp-orb-purple" aria-hidden="true" />

              <div className="lp-shop-card">
                <div className="lp-shop-head">
                  <div className="relative z-10 flex items-center gap-3">
                    <ShopAvatar
                      emoji={seedShop.logoEmoji}
                      theme={seedShop.logoColor}
                      size="md"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold">
                        {seedShop.name}
                      </p>
                      <p className="truncate text-[10px] text-[#e2d2f7]">
                        {seedShop.tagline}
                      </p>
                    </div>
                  </div>
                  <div className="relative z-10 mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#2fbf7f]/20 px-2 py-0.5 text-[8px] font-bold text-[#9fe9c4]">
                      <span className="h-1 w-1 rounded-full bg-[#7fe3ae]" />
                      Open for orders
                    </span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[8px] font-bold text-[#e2d2f7]">
                      COD · Easypaisa
                    </span>
                  </div>
                </div>

                <div className="lp-shop-body">
                  {seedProducts.slice(0, 3).map((product) => (
                    <div key={product.id} className="lp-product-row">
                      <span
                        className={`grid h-9 w-9 place-items-center rounded-lg text-base ${themeTile(
                          product.theme,
                        )}`}
                      >
                        {product.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="lp-product-name">{product.name}</p>
                        <p className="lp-product-price">
                          {formatMoney(product.price)}
                        </p>
                      </div>
                      <span className="lp-add-dot">+</span>
                    </div>
                  ))}

                  <div className="lp-shop-cart">
                    <span className="flex items-center gap-1">
                      <ShoppingCart className="h-2.5 w-2.5 text-[#F2B956]" />
                      2 items
                    </span>
                    <span>Rs 3,700 · View cart</span>
                  </div>
                  <p className="lp-shop-credit">Powered by DukaanDost</p>
                </div>
              </div>

              <div className="lp-float lp-float-order">
                <span className="lp-float-icon">
                  <Bell className="h-4 w-4" />
                </span>
                <div>
                  <p className="lp-float-label">New order</p>
                  <p className="lp-float-value">#1049 · Rs 2,500</p>
                </div>
              </div>

              <div className="lp-float lp-float-earnings">
                <div className="flex items-center gap-2">
                  <span className="lp-float-icon">
                    <TrendingUp className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="lp-float-label">This week</p>
                    <p className="lp-float-value">Rs 16,600</p>
                  </div>
                </div>
                <p className="mt-1.5 text-[9px] font-bold text-[#3f9a6d]">
                  +41% vs last week
                </p>
              </div>
            </div>
          </div>

          <div className="lp-wrap lp-stats-wrap">
            <div className="lp-stats">
              {[
                { value: "2 min", label: "To open your shop", icon: Zap },
                { value: "0", label: "Tech skills needed", icon: ShieldCheck },
                { value: "Rs 0", label: "To get started", icon: Wallet },
                {
                  value: "اردو + EN",
                  label: "One-tap language",
                  icon: Languages,
                },
              ].map((stat) => (
                <div key={stat.label} className="lp-stat">
                  <stat.icon className="h-4 w-4" />
                  <p className="lp-stat-value">{stat.value}</p>
                  <p className="lp-stat-label">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="problem" className="lp-section lp-warm">
          <div className="lp-wrap lp-problem">
            <div className="lp-problem-aside">
              <span className="lp-eyebrow lp-eyebrow-light">
                The problem
              </span>
              <h2 className="lp-h2 mt-5">
                Chat apps were built for talking.{" "}
                <span className="lp-gold-text">Not for selling.</span>
              </h2>
              <p className="lp-body">
                Home businesses in Pakistan run on WhatsApp and Instagram DMs.
                Orders get buried, prices get typed again and again, and nobody
                knows what they actually earned this month.
              </p>

              <div className="lp-quote">
                <Quote className="h-5 w-5 text-[#B87916]" />
                <p className="lp-quote-text">
                  “I lose track of who has paid and who still owes me. Every
                  evening I am scrolling through chats to find orders.”
                </p>
                <div className="lp-person">
                  <span className="lp-person-avatar">A</span>
                  <div>
                    <p className="lp-person-name">Ayesha, 28</p>
                    <p className="lp-person-role">
                      Home baker · Gulshan, Karachi
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lp-pain-grid">
              {PAINS.map((pain) => (
                <div key={pain.title} className="lp-pain-card">
                  <span className="lp-icon-tile">
                    <pain.icon className="h-5 w-5" />
                  </span>
                  <h3>{pain.title}</h3>
                  <p>{pain.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="lp-section lp-features">
          <div className="lp-wrap">
            <div className="lp-section-head">
              <span className="lp-eyebrow lp-eyebrow-light">
                The simple fix
              </span>
              <h2 className="lp-h2 mt-5">
                One link. One order list.{" "}
                <span className="lp-gold-text">One earnings view.</span>
              </h2>
              <p className="lp-body">
                DukaanDost does not replace WhatsApp. It sits beside it, so
                customers keep chatting where they already trust you.
              </p>
            </div>

            <div className="lp-feature-grid">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className={`lp-feature-card ${
                    feature.gold ? "lp-feature-card-gold" : ""
                  }`}
                >
                  <div className="lp-feature-head">
                    <span className="lp-icon-tile">
                      <feature.icon className="h-5 w-5" />
                    </span>
                    <span className="lp-feature-tag">{feature.tag}</span>
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.body}</p>
                </div>
              ))}
            </div>

            <div className="lp-chip-row">
              {[
                { icon: Languages, label: "Urdu toggle" },
                { icon: Wallet, label: "Pending payments list" },
                { icon: QrCode, label: "QR code" },
                { icon: Truck, label: "Payment instructions" },
                { icon: Sparkles, label: "AI product help" },
              ].map((item) => (
                <span key={item.label} className="lp-chip">
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </span>
              ))}
              <span className="lp-chip lp-chip-gold">
                + more after the MVP
              </span>
            </div>
          </div>
        </section>

        <section id="how" className="lp-section lp-warm">
          <div className="lp-wrap">
            <div className="lp-section-head">
              <span className="lp-eyebrow lp-eyebrow-light">
                How it works
              </span>
              <h2 className="lp-h2 mt-5">
                From signup to first order,{" "}
                <span className="lp-gold-text">without the mess.</span>
              </h2>
            </div>

            <div className="lp-steps">
              {STEPS.map((step) => (
                <div key={step.step} className="lp-step">
                  <div className="lp-step-top">
                    <span className="lp-step-icon">
                      <step.icon className="h-5 w-5" />
                    </span>
                    <span className="lp-step-num">{step.step}</span>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-section lp-dark">
          <div className="lp-wrap lp-split">
            <div>
              <span className="lp-eyebrow">Stay on WhatsApp</span>
              <h2 className="lp-h2 mt-5">
                Customers chat where they trust you.{" "}
                <span className="text-[#F2B956]">We handle the rest.</span>
              </h2>
              <p className="lp-body">
                No WhatsApp Business API. No approvals. No monthly integration.
                DukaanDost uses simple wa.me links, so one tap opens WhatsApp
                with a ready-made message.
              </p>

              <ul className="lp-check-list">
                {[
                  "Pre-filled confirmation with order number and total",
                  "Payment reminder button for unpaid orders",
                  "Customers order from your link, not from a chat",
                  "You keep your customer relationship — no marketplace",
                ].map((item) => (
                  <li key={item}>
                    <span className="lp-check">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/shops"
                className="lp-btn lp-btn-ghost-dark mt-8"
              >
                Try the customer flow
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="lp-chat-wrap">
              <span className="lp-chat-glow" aria-hidden="true" />
              <div className="lp-chat">
                <div className="lp-chat-head">
                  <span className="lp-chat-avatar">AB</span>
                  <div className="flex-1">
                    <p className="lp-chat-name">Ayesha Bakes</p>
                    <p className="lp-chat-status">online</p>
                  </div>
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div className="lp-chat-body">
                  <div className="lp-bubble">
                    Assalam-o-Alaikum, chocolate cake kitne ka hai?
                    <p className="lp-bubble-time">10:18 AM</p>
                  </div>
                  <div className="lp-bubble lp-bubble-mine">
                    Walaikum salam! Yahan se order karein, sab prices likhe
                    hain 👇
                    <span className="lp-bubble-link">
                      dukaandost.app/shops
                    </span>
                    <p className="lp-bubble-time">10:19 AM</p>
                  </div>
                  <div className="lp-bubble">
                    Order #1042 confirm ho gaya. 1 chocolate cake (Rs 2,500),
                    kal deliver hoga. Shukriya!
                    <div className="mt-1.5 flex items-center gap-1 text-[9px] font-bold text-[#3f9a6d]">
                      <BadgeCheck className="h-3 w-3" />
                      Sent from DukaanDost
                    </div>
                  </div>
                  <div className="lp-wa-button">
                    <MessageCircle className="h-3.5 w-3.5" />
                    Send WhatsApp confirmation
                  </div>
                </div>
              </div>
              <div className="lp-no-api">
                <Zap className="h-3 w-3" />
                No API approval
              </div>
            </div>
          </div>
        </section>

        <section id="earnings" className="lp-section">
          <div className="lp-wrap lp-earnings">
            <div>
              <span className="lp-eyebrow lp-eyebrow-light">
                Your money, clear
              </span>
              <h2 className="lp-h2 mt-5">
                Know what you earned{" "}
                <span className="lp-gold-text">this week.</span>
              </h2>
              <p className="lp-body">
                No notebooks. No guessing. A simple dashboard shows weekly
                earnings, order count, average order value, best seller and
                exactly how much is still pending collection.
              </p>

              <div className="lp-mini-grid">
                {[
                  { icon: TrendingUp, label: "Weekly earnings" },
                  { icon: ShoppingBag, label: "Order count" },
                  { icon: Star, label: "Best-selling product" },
                  { icon: Wallet, label: "Pending collection" },
                ].map((item) => (
                  <div key={item.label} className="lp-mini">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </div>
                ))}
              </div>

              <Link
                href="/dashboard"
                className="lp-btn lp-btn-gold mt-8"
              >
                Explore the demo dashboard
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="lp-dash">
              <div className="lp-dash-top">
                <div>
                  <p className="lp-dash-label">Earnings this week</p>
                  <p className="lp-dash-amount">Rs 16,600</p>
                </div>
                <span className="lp-dash-badge">
                  <TrendingUp className="h-3 w-3" />
                  +41%
                </span>
              </div>

              <div className="lp-dash-stats">
                {[
                  { label: "Orders", value: "9" },
                  { label: "Avg. order", value: "Rs 1,844" },
                  { label: "Pending", value: "Rs 7,100" },
                ].map((stat) => (
                  <div key={stat.label} className="lp-dash-stat">
                    <p>{stat.label}</p>
                    <p>{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="lp-dash-panel">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-extrabold text-[#251536]">
                    Weekly earnings
                  </p>
                  <span className="text-[10px] font-bold text-[#8a7b9c]">
                    1 Nov – 7 Nov
                  </span>
                </div>
                <div className="lp-bars" dir="ltr">
                  {[42, 58, 35, 74, 62, 90, 48].map((height, index) => (
                    <div
                      key={index}
                      style={{ height: `${height}%` }}
                      className={`lp-bar ${index === 5 ? "lp-bar-gold" : ""}`}
                    />
                  ))}
                </div>
                <div className="lp-dash-days">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day) => (
                      <span key={day}>{day}</span>
                    ),
                  )}
                </div>
                <div className="lp-best-seller">
                  <span>
                    <Gift className="h-3.5 w-3.5" />
                    Best seller
                  </span>
                  <span>Eid Cookie Box · 5 sold</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="lp-section lp-shops">
          <div className="lp-wrap">
            <div className="lp-section-head">
              <span className="lp-eyebrow lp-eyebrow-light">
                Built for real sellers
              </span>
              <h2 className="lp-h2 mt-5">
                If you sell from home,{" "}
                <span className="lp-gold-text">this is for you.</span>
              </h2>
            </div>

            <div className="lp-category-row">
              {CATEGORIES.map((item) => (
                <span key={item.label} className="lp-category">
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </span>
              ))}
            </div>

            <div className="lp-shop-grid">
              {PERSONAS.map((persona) => (
                <article key={persona.name} className="lp-shop-preview">
                  <div className={`lp-shop-cover ${persona.cover}`}>
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-xl">
                        {persona.emoji}
                      </span>
                      <div>
                        <h3 className="text-sm font-extrabold">
                          {persona.name}
                        </h3>
                        <p className="text-[10px] text-white/65">
                          {persona.owner}
                        </p>
                      </div>
                    </div>
                    <span className="lp-shop-open">Open for orders</span>
                    <div className="lp-mini-products">
                      {persona.products.map((product) => (
                        <div
                          key={product.name}
                          className="lp-mini-product"
                        >
                          <span>{product.emoji}</span>
                          <p>{product.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="lp-shop-info">
                    <h3>{persona.business}</h3>
                    <p>{persona.gives}</p>
                    <div className="lp-shop-story">
                      <p className="lp-story-problem">
                        <strong>Problem:</strong> {persona.problem}
                      </p>
                      <p className="lp-story-gives">
                        <strong>DukaanDost:</strong> {persona.gives}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="lp-shops-cta">
              <Link href="/shops" className="lp-btn lp-btn-ghost-light">
                Explore real shops
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section id="pricing" className="lp-section">
          <div className="lp-wrap">
            <div className="lp-section-head">
              <span className="lp-eyebrow lp-eyebrow-light">Pricing</span>
              <h2 className="lp-h2 mt-5">
                Free to start.{" "}
                <span className="lp-gold-text">
                  Pay only when you grow.
                </span>
              </h2>
              <p className="lp-body">
                Open your shop, list products and take orders without paying
                anything. Upgrade later for unlimited use and extras.
              </p>
            </div>

            <div className="lp-plans">
              <div className="lp-plan lp-plan-free">
                <div className="lp-plan-top">
                  <span className="lp-plan-badge lp-plan-badge-free">
                    Start here
                  </span>
                </div>
                <p className="lp-plan-name">Free</p>
                <p className="lp-price">
                  Rs 0 <span>/ forever</span>
                </p>
                <p className="lp-plan-sub">
                  Everything you need for your first orders.
                </p>
                <ul className="lp-plan-list">
                  {FREE_FEATURES.map((item) => (
                    <li key={item}>
                      <span className="lp-plan-check">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/login?switch=1" className="lp-btn lp-btn-royal">
                  Create my free shop
                </Link>
              </div>

              <div className="lp-plan lp-plan-dark">
                <div className="lp-plan-top">
                  <span className="lp-plan-badge lp-plan-badge-gold">
                    <Sparkles className="h-3 w-3" />
                    Growth
                  </span>
                  <span className="lp-plan-coming">Coming soon</span>
                </div>
                <p className="lp-plan-name text-[#F2B956]">Unlimited</p>
                <p className="lp-price">
                  Rs 499 <span>/ month</span>
                </p>
                <p className="lp-plan-sub">
                  For shops that are growing every week.
                </p>
                <ul className="lp-plan-list">
                  {GROWTH_FEATURES.map((item) => (
                    <li key={item}>
                      <span className="lp-plan-check">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled
                  className="lp-plan-waitlist"
                >
                  Join the waitlist
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="lp-cta-section">
          <div className="lp-wrap">
            <div className="lp-cta">
              <div className="lp-cta-inner">
                <span className="lp-eyebrow">
                  <Sparkles className="h-3.5 w-3.5 text-[#F2B956]" />
                  Your shop is two minutes away
                </span>
                <h2>
                  Stop losing orders in chats.{" "}
                  <span className="text-[#F2B956]">
                    Start your dukaan today.
                  </span>
                </h2>
                <p>
                  Free to start, no card needed, and your customers never have
                  to download an app. Just one link.
                </p>
                <div className="lp-cta-actions">
                  <Link
                    href="/login?switch=1"
                    className="lp-btn lp-btn-gold lp-btn-lg"
                  >
                    Create your shop free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="lp-btn lp-btn-ghost-dark lp-btn-lg"
                  >
                    Sign in to dashboard
                  </Link>
                </div>
                <p className="lp-cta-note">
                  <Globe2 className="h-3.5 w-3.5" />
                  Made in Pakistan, for Pakistan · اردو اور English
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-wrap">
          <div className="lp-footer-grid">
            <div className="lp-footer-brand">
              <Logo light />
              <p>
                Your shop, your orders, your earnings, all in one link. Apni
                dukaan, apni kamai.
              </p>
              <div className="lp-footer-trust">
                <ShieldCheck className="h-3.5 w-3.5" />
                Only you can see customer details
              </div>
            </div>

            <div>
              <h4>Product</h4>
              <div className="lp-footer-links">
                {[
                  { label: "Features", href: "#features" },
                  { label: "How it works", href: "#how" },
                  { label: "Pricing", href: "#pricing" },
                  { label: "Browse shops", href: "/shops" },
                ].map((link) => (
                  <a key={link.label} href={link.href}>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4>For owners</h4>
              <div className="lp-footer-links">
                {[
                  { label: "Create a shop", href: "/login?switch=1" },
                  { label: "Open dashboard", href: "/dashboard" },
                  { label: "Sign in", href: "/login" },
                  { label: "Settings", href: "/dashboard/settings" },
                ].map((link) => (
                  <Link key={link.label} href={link.href}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4>Built for</h4>
              <p className="lp-footer-copy mt-3">
                Small businesses
                <br />
                across Pakistan
              </p>
              <div className="lp-footer-tags">
                <span className="lp-footer-tag">React</span>
                <span className="lp-footer-tag">Tailwind</span>
                <span className="lp-footer-tag">WhatsApp</span>
              </div>
            </div>
          </div>

          <div className="lp-footer-bottom">
            <p>© 2026 DukaanDost. All rights reserved.</p>
            <p>Made with royal purple and sun gold in Karachi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
