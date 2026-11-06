"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Store,
  User,
} from "lucide-react";
import { Logo } from "@/components/ui";
import { getSupabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [next, setNext] = useState("/dashboard");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "signup") setMode("signup");
    const target = params.get("next");
    if (target && target.startsWith("/")) setNext(target);
    if (params.get("error") === "confirmation") {
      setError(
        "That confirmation link is invalid or expired. Try signing in, or sign up again.",
      );
    }
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (mode === "signup" && fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    if (mode === "signup" && password.length < 6) {
      setError("Use a password with at least 6 characters.");
      return;
    }
    if (mode === "signup" && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const supabase = getSupabase();
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
        router.push(next);
        router.refresh();
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
        },
      });
      if (signUpError) throw signUpError;
      if (data.session) {
        router.push("/onboarding");
        router.refresh();
      } else {
        setSent(true);
      }
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Something went wrong.";
      setError(
        message.includes("rate limit")
          ? "Too many emails sent. Please wait a few minutes and try again."
          : message,
      );
    } finally {
      setBusy(false);
    }
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
            Your <span className="text-gold-300">dukaan</span> is ready when
            you are.
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
            One calm dashboard for your shop link, orders, customers and
            pending payments.
          </p>

          <div className="mt-8 space-y-3">
            {[
              "A shareable shop link for every device",
              "Orders saved with customer details",
              "Payments stay clear: paid or pending",
              "Your own Easypaisa, JazzCash or bank details",
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
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-gold-200">
              Your shop
            </p>
            <p className="mt-1 text-lg font-extrabold">One link</p>
            <p className="text-[11px] text-white/60">
              Share on WhatsApp, Instagram or a business card.
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-gold-200">
              Your data
            </p>
            <p className="mt-1 text-lg font-extrabold">Private by default</p>
            <p className="text-[11px] text-white/60">
              Only you can see orders and payment status.
            </p>
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
            {sent ? (
              <div className="rounded-3xl border border-royal-100 bg-white p-6 text-center shadow-card">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-royal-50 text-royal-700">
                  <Mail className="h-6 w-6" />
                </span>
                <h2 className="mt-4 text-xl font-extrabold text-ink">
                  Check your email
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  We sent a confirmation link to{" "}
                  <span className="font-bold text-ink">{email}</span>. Open it
                  to activate your account, then come back and sign in.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setMode("signin");
                    setPassword("");
                    setConfirm("");
                  }}
                  className="btn-primary mt-5 w-full py-3"
                >
                  I have confirmed my email
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-extrabold tracking-tight text-ink">
                  {mode === "signin" ? "Sign in" : "Create your account"}
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  {mode === "signin"
                    ? "Welcome back. Open your dashboard in one tap."
                    : "Create an account first, then set up your shop in two minutes."}
                </p>

                <div className="mt-6 inline-flex w-full rounded-full border border-royal-100 bg-white p-1">
                  {(
                    [
                      { id: "signin", label: "Sign in" },
                      { id: "signup", label: "Create account" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setMode(tab.id);
                        setError("");
                      }}
                      className={cn(
                        "flex-1 rounded-full px-3 py-2 text-xs font-extrabold transition",
                        mode === tab.id
                          ? "bg-royal-700 text-white shadow-sm"
                          : "text-ink-muted hover:text-royal-800",
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <form onSubmit={submit} className="mt-4 space-y-3.5">
                  {mode === "signup" && (
                    <div>
                      <label className="label" htmlFor="login-name">
                        Full name
                      </label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                        <input
                          id="login-name"
                          value={fullName}
                          onChange={(event) => setFullName(event.target.value)}
                          placeholder="Ayesha Khan"
                          className="input pl-10"
                          autoComplete="name"
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="label" htmlFor="login-email">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                      <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        className="input pl-10"
                        autoComplete="email"
                        dir="ltr"
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
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="••••••••"
                        className="input pl-10 pr-10"
                        autoComplete={
                          mode === "signin"
                            ? "current-password"
                            : "new-password"
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted transition hover:text-royal-700"
                        aria-label="Toggle password"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  {mode === "signup" && (
                    <div>
                      <label className="label" htmlFor="login-confirm">
                        Confirm password
                      </label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                        <input
                          id="login-confirm"
                          type={showPassword ? "text" : "password"}
                          value={confirm}
                          onChange={(event) => setConfirm(event.target.value)}
                          placeholder="••••••••"
                          className="input pl-10"
                          autoComplete="new-password"
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={busy}
                    className="btn-primary w-full py-3 disabled:opacity-60"
                  >
                    {busy
                      ? "Please wait…"
                      : mode === "signin"
                        ? "Open my dashboard"
                        : "Create my account"}
                    {!busy && <ArrowRight className="h-4 w-4" />}
                  </button>
                </form>

                <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-ink-muted">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  Email confirmation keeps your shop secure.
                </div>

                <div className="mt-6 rounded-2xl border border-royal-100 bg-white p-4">
                  <p className="flex items-center gap-1.5 text-xs font-extrabold text-ink">
                    <Store className="h-4 w-4 text-royal-700" />
                    {mode === "signin"
                      ? "New to DukaanDost?"
                      : "Already have an account?"}
                  </p>
                  <p className="mt-1 text-[11px] text-ink-muted">
                    {mode === "signin"
                      ? "Create your account and open your shop link in minutes."
                      : "Sign in to open your dashboard."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === "signin" ? "signup" : "signin");
                      setError("");
                    }}
                    className="mt-2 flex items-center gap-1 text-xs font-extrabold text-royal-700 hover:underline"
                  >
                    {mode === "signin" ? "Create account" : "Sign in"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
