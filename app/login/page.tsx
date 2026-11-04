"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Lock,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
} from "lucide-react";
import { Logo } from "@/components/ui";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [value, setValue] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!value.trim() || password.length < 4) {
      setError("Enter your details to continue. Demo mode accepts anything.");
      return;
    }
    setError("");
    router.push("/dashboard");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden bg-royal-radial p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-gold-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-[0.06]" />

        <div className="relative">
          <Link href="/">
            <Logo light />
          </Link>
          <span className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-gold-200">
            <Sparkles className="h-3.5 w-3.5" />
            Apni dukaan, apni kamai
          </span>
          <h1 className="mt-4 max-w-md text-4xl font-extrabold leading-[1.1] tracking-tight">
            Welcome back to your{" "}
            <span className="text-gold-300">dukaan</span>.
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
            Orders, payments and earnings — all waiting for you in one calm
            dashboard.
          </p>

          <div className="mt-8 space-y-3">
            {[
              "Every order saved with customer details",
              "See who has paid and who still owes",
              "Confirm orders on WhatsApp in one tap",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-gold-300/20 text-gold-300">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm font-semibold text-white/85">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wide text-gold-200">
              <TrendingUp className="h-3.5 w-3.5" />
              This week
            </p>
            <p className="mt-1 text-2xl font-extrabold">Rs 16,600</p>
            <p className="text-[11px] text-white/60">+41% vs last week</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wide text-gold-200">
              <MessageCircle className="h-3.5 w-3.5" />
              Confirmed
            </p>
            <p className="mt-1 text-2xl font-extrabold">#1048</p>
            <p className="text-[11px] text-white/60">Sent on WhatsApp</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col bg-[#faf7ff]">
        <div className="flex items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="lg:hidden">
            <Logo />
          </Link>
          <Link
            href="/"
            className="ml-auto text-xs font-extrabold text-ink-muted transition hover:text-royal-700"
          >
            Back to home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-10 sm:px-8">
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-extrabold tracking-tight text-ink">
              Sign in
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Use your email or phone number to open your dashboard.
            </p>

            <div className="mt-6 inline-flex w-full rounded-full border border-royal-100 bg-white p-1">
              {(
                [
                  { id: "email", label: "Email", icon: Mail },
                  { id: "phone", label: "Phone", icon: Phone },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setMode(tab.id);
                    setValue("");
                    setError("");
                  }}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-extrabold transition",
                    mode === tab.id
                      ? "bg-royal-700 text-white shadow-sm"
                      : "text-ink-muted hover:text-royal-800",
                  )}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="mt-4 space-y-3.5">
              <div>
                <label className="label" htmlFor="login-id">
                  {mode === "email" ? "Email address" : "Phone number"}
                </label>
                <div className="relative">
                  {mode === "email" ? (
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                  ) : (
                    <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                  )}
                  <input
                    id="login-id"
                    type={mode === "email" ? "email" : "tel"}
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder={
                      mode === "email"
                        ? "ayesha@example.com"
                        : "0300 1234567"
                    }
                    className="input pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="login-password">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="input pl-10"
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
                  {error}
                </p>
              )}

              <button type="submit" className="btn-primary w-full py-3">
                Open my dashboard
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="my-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-royal-100" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-ink-muted">
                or
              </span>
              <span className="h-px flex-1 bg-royal-100" />
            </div>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="btn-ghost w-full py-3"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-royal-700 text-[10px] font-extrabold text-white">
                G
              </span>
              Continue with Google
            </button>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-ink-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Demo mode: any details will work
            </div>

            <div className="mt-6 rounded-2xl border border-royal-100 bg-white p-4">
              <p className="flex items-center gap-1.5 text-xs font-extrabold text-ink">
                <Store className="h-4 w-4 text-royal-700" />
                New to DukaanDost?
              </p>
              <p className="mt-1 text-[11px] text-ink-muted">
                Create your shop link in about two minutes.
              </p>
              <Link
                href="/onboarding"
                className="mt-2 flex items-center gap-1 text-xs font-extrabold text-royal-700 hover:underline"
              >
                Set up my shop
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
