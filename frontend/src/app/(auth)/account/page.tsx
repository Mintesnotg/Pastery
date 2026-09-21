"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Cookie,
  Eye,
  EyeOff,
  Grid2X2,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import { apiUrl } from "@/lib/api";

const BROWN = "#734F32";
const PEACH = "#FDEBDD";
const CREAM = "#FFF8F3";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-zA-Z]/, "Password must contain at least one letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(/[^a-zA-Z\d]/, "Password must contain at least one special character");

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Enter a valid email"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type Tab = "login" | "register";
type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

const emptyLogin: LoginForm = { email: "", password: "" };
const emptyRegister: RegisterForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const REMEMBER_KEY = "hob.account.rememberEmail";

function redirectAfterAuth() {
  return "/dashboard";
}

function PasswordField({
  id,
  label,
  rightSlot,
  value,
  error,
  show,
  onToggleShow,
  onChange,
  onBlur,
  autoComplete,
  leadingIcon,
}: {
  id: string;
  label: string;
  rightSlot?: ReactNode;
  value: string;
  error?: string;
  show: boolean;
  onToggleShow: () => void;
  onChange: (value: string) => void;
  onBlur: () => void;
  autoComplete: string;
  leadingIcon?: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-[#3F2A18]">
          {label}
        </label>
        {rightSlot}
      </div>
      <div className="relative">
        {leadingIcon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#734F32]/55">
            {leadingIcon}
          </span>
        )}
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          autoComplete={autoComplete}
          className={`w-full rounded-2xl border bg-white py-3.5 pr-12 outline-none transition focus:ring-2 ${
            leadingIcon ? "pl-11" : "pl-4"
          } ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-200"
              : "border-[#E6D9CB] focus:border-[#734F32] focus:ring-[#734F32]/15"
          }`}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#734F32]/60 hover:text-[#734F32]"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && (
        <p className="mt-1.5 flex items-start gap-1.5 text-sm text-red-600">
          <span aria-hidden>!</span>
          {error}
        </p>
      )}
    </div>
  );
}

function LeftHeroPanel() {
  return (
    <aside className="relative h-[280px] shrink-0 overflow-hidden lg:sticky lg:top-0 lg:h-screen lg:self-start">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/account-hero.jpg"
        alt="Fresh croissants in the bakery"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25 lg:bg-gradient-to-r lg:from-black/75 lg:via-black/40 lg:to-black/20"
        aria-hidden
      />
      <div className="relative z-10 flex h-full flex-col justify-end px-6 py-10 sm:px-10 lg:px-12 lg:py-16">
        <p className="inline-flex w-fit items-center gap-2 rounded-full bg-[#5C4030]/55 px-3.5 py-1.5 text-xs font-medium tracking-wide text-[#E8D5B7] backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[#D4A84B]" aria-hidden />
          Morning Hearth Sourdough Batch No. 42
        </p>
        <h1 className="mt-6 max-w-md font-display text-4xl leading-[1.1] font-semibold text-white sm:text-5xl lg:text-[3.25rem]">
          Welcome back
          <span className="block">to the bakery.</span>
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#E8D5B7] sm:text-base">
          Fresh flour, slow ferments, and warm mornings since 2010.
        </p>
        <div className="mt-8 flex flex-col gap-2.5">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#5C4030]/55 px-3.5 py-2 text-xs font-medium text-[#E8D5B7] backdrop-blur-sm sm:text-sm">
            <Grid2X2 size={14} className="text-[#D4A84B]" />
            Stone-milled heritage wheat
          </span>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#5C4030]/55 px-3.5 py-2 text-xs font-medium text-[#E8D5B7] backdrop-blur-sm sm:text-sm">
            <Clock3 size={14} className="text-[#D4A84B]" />
            36-hour wild yeast fermentation
          </span>
        </div>
      </div>
    </aside>
  );
}

function AccountPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab: Tab = searchParams.get("tab") === "register" ? "register" : "login";

  const [tab, setTab] = useState<Tab>(initialTab);
  const [loginForm, setLoginForm] = useState<LoginForm>(emptyLogin);
  const [registerForm, setRegisterForm] = useState<RegisterForm>(emptyRegister);
  const [loginErrors, setLoginErrors] = useState<Partial<Record<keyof LoginForm, string>>>({});
  const [registerErrors, setRegisterErrors] = useState<Partial<Record<keyof RegisterForm, string>>>({});
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) {
        setLoginForm((f) => ({ ...f, email: saved }));
        setRememberMe(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const fieldClass = (hasError: boolean, withIcon = false) =>
    `w-full rounded-2xl border bg-white py-3.5 outline-none transition focus:ring-2 ${
      withIcon ? "pl-11 pr-4" : "px-4"
    } ${
      hasError
        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
        : "border-[#E6D9CB] focus:border-[#734F32] focus:ring-[#734F32]/15"
    }`;

  const validateLoginField = (field: keyof LoginForm, next: LoginForm) => {
    const result = loginSchema.safeParse(next);
    if (result.success) {
      setLoginErrors((prev) => ({ ...prev, [field]: undefined }));
      return;
    }
    const issue = result.error.issues.find((i) => i.path[0] === field);
    setLoginErrors((prev) => ({ ...prev, [field]: issue?.message }));
  };

  const validateRegisterField = (field: keyof RegisterForm, next: RegisterForm) => {
    const result = registerSchema.safeParse(next);
    if (result.success) {
      setRegisterErrors({});
      return;
    }
    const issue = result.error.issues.find((i) => i.path[0] === field);
    if (field === "password" || field === "confirmPassword") {
      const confirmIssue = result.error.issues.find((i) => i.path[0] === "confirmPassword");
      setRegisterErrors((prev) => ({
        ...prev,
        [field]: issue?.message,
        confirmPassword: confirmIssue?.message,
      }));
      return;
    }
    setRegisterErrors((prev) => ({ ...prev, [field]: issue?.message }));
  };

  const switchTab = (next: Tab) => {
    setTab(next);
    setApiError("");
    setSuccessMessage("");
  };

  const performLogin = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const res = await fetch(apiUrl("/api/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: normalizedEmail, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        (data as { error?: string; message?: string }).error ||
          (data as { message?: string }).message ||
          "Incorrect email or password. Please try again.",
      );
    }
    router.replace(redirectAfterAuth());
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    setSuccessMessage("");
    const parsed = loginSchema.safeParse(loginForm);
    if (!parsed.success) {
      const errors: Partial<Record<keyof LoginForm, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof LoginForm;
        if (!errors[key]) errors[key] = issue.message;
      }
      setLoginErrors(errors);
      return;
    }
    setLoading(true);
    try {
      const email = parsed.data.email.trim().toLowerCase();
      try {
        if (rememberMe) localStorage.setItem(REMEMBER_KEY, email);
        else localStorage.removeItem(REMEMBER_KEY);
      } catch {
        /* ignore */
      }
      await performLogin(email, parsed.data.password);
    } catch (err) {
      setApiError((err as Error).message);
      setLoginErrors((prev) => ({ ...prev, password: (err as Error).message }));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    setSuccessMessage("");
    const parsed = registerSchema.safeParse(registerForm);
    if (!parsed.success) {
      const errors: Partial<Record<keyof RegisterForm, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof RegisterForm;
        if (!errors[key]) errors[key] = issue.message;
      }
      setRegisterErrors(errors);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/users"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          email: parsed.data.email,
          password: parsed.data.password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error || "Registration failed");
      }
      setSuccessMessage("Account created. Signing you in…");
      await performLogin(parsed.data.email, parsed.data.password);
    } catch (err) {
      setApiError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:items-start">
      <LeftHeroPanel />

      <section
        className="relative flex min-h-screen flex-col px-5 py-8 sm:px-10 lg:px-14 lg:py-10"
        style={{ backgroundColor: CREAM }}
      >
        <Link
          href="/"
          className="mb-8 inline-flex w-fit items-center gap-2 text-sm font-medium transition hover:opacity-80"
          style={{ color: BROWN }}
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <div className="rounded-[2rem] border border-[#EFE4D8] bg-white p-6 shadow-[0_18px_50px_rgba(63,42,24,0.08)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase" style={{ color: BROWN }}>
                  Bakery Account
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold text-[#3F2A18] sm:text-4xl">
                  {tab === "login" ? "Sign In" : "Create Account"}
                </h2>
              </div>
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: PEACH, color: BROWN }}
                aria-hidden
              >
                <Cookie size={22} />
              </span>
            </div>

            <div
              className="mt-6 grid grid-cols-2 rounded-full p-1"
              style={{ backgroundColor: PEACH }}
              role="tablist"
              aria-label="Account forms"
            >
              <button
                type="button"
                role="tab"
                aria-selected={tab === "login"}
                onClick={() => switchTab("login")}
                className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                  tab === "login" ? "text-white shadow-sm" : "text-[#734F32]"
                }`}
                style={tab === "login" ? { backgroundColor: BROWN } : undefined}
              >
                Sign In
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "register"}
                onClick={() => switchTab("register")}
                className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                  tab === "register" ? "text-white shadow-sm" : "text-[#734F32]"
                }`}
                style={tab === "register" ? { backgroundColor: BROWN } : undefined}
              >
                Create Account
              </button>
            </div>

            <div className="mt-6 grid">
              <form
                onSubmit={handleLogin}
                className={`col-start-1 row-start-1 space-y-4 self-center ${
                  tab === "login" ? "" : "invisible pointer-events-none"
                }`}
                noValidate
                aria-hidden={tab !== "login"}
                inert={tab !== "login" ? true : undefined}
              >
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <label htmlFor="login-email" className="text-sm font-medium text-[#3F2A18]">
                      Email address
                    </label>
                    <span className="text-xs text-[#9A8573]">Member ID</span>
                  </div>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#734F32]/55"
                    />
                    <input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      value={loginForm.email}
                      onChange={(e) => {
                        const next = { ...loginForm, email: e.target.value };
                        setLoginForm(next);
                        validateLoginField("email", next);
                      }}
                      onBlur={() => validateLoginField("email", loginForm)}
                      className={fieldClass(Boolean(loginErrors.email), true)}
                      placeholder="you@example.com"
                    />
                  </div>
                  {loginErrors.email && <p className="mt-1.5 text-sm text-red-600">{loginErrors.email}</p>}
                </div>

                <PasswordField
                  id="login-password"
                  label="Password"
                  leadingIcon={<Lock size={16} />}
                  rightSlot={
                    <button
                      type="button"
                      className="text-xs font-medium hover:underline"
                      style={{ color: BROWN }}
                      onClick={() => setApiError("Password reset is not available yet.")}
                    >
                      Forgot password?
                    </button>
                  }
                  value={loginForm.password}
                  error={loginErrors.password || (apiError && tab === "login" ? apiError : undefined)}
                  show={showLoginPassword}
                  onToggleShow={() => setShowLoginPassword((v) => !v)}
                  autoComplete="current-password"
                  onChange={(password) => {
                    const next = { ...loginForm, password };
                    setLoginForm(next);
                    setApiError("");
                    validateLoginField("password", next);
                  }}
                  onBlur={() => validateLoginField("password", loginForm)}
                />

                <div className="flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-2 text-sm text-[#3F2A18]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-[#E6D9CB]"
                      style={{ accentColor: BROWN }}
                    />
                    Remember me
                  </label>
                </div>

                {successMessage && tab === "login" && (
                  <p className="text-sm text-green-700">{successMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
                  style={{ backgroundColor: BROWN }}
                >
                  {loading && tab === "login" && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading && tab === "login" ? "Signing in…" : "Sign In"}
                  {!(loading && tab === "login") && <ArrowRight size={16} />}
                </button>
              </form>

              <form
                onSubmit={handleRegister}
                className={`col-start-1 row-start-1 space-y-4 ${
                  tab === "register" ? "" : "invisible pointer-events-none"
                }`}
                noValidate
                aria-hidden={tab !== "register"}
                inert={tab !== "register" ? true : undefined}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="reg-first" className="mb-1.5 block text-sm font-medium text-[#3F2A18]">
                      First name
                    </label>
                    <input
                      id="reg-first"
                      type="text"
                      autoComplete="given-name"
                      value={registerForm.firstName}
                      onChange={(e) => {
                        const next = { ...registerForm, firstName: e.target.value };
                        setRegisterForm(next);
                        validateRegisterField("firstName", next);
                      }}
                      onBlur={() => validateRegisterField("firstName", registerForm)}
                      className={fieldClass(Boolean(registerErrors.firstName))}
                    />
                    {registerErrors.firstName && (
                      <p className="mt-1.5 text-sm text-red-600">{registerErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="reg-last" className="mb-1.5 block text-sm font-medium text-[#3F2A18]">
                      Last name
                    </label>
                    <input
                      id="reg-last"
                      type="text"
                      autoComplete="family-name"
                      value={registerForm.lastName}
                      onChange={(e) => {
                        const next = { ...registerForm, lastName: e.target.value };
                        setRegisterForm(next);
                        validateRegisterField("lastName", next);
                      }}
                      onBlur={() => validateRegisterField("lastName", registerForm)}
                      className={fieldClass(Boolean(registerErrors.lastName))}
                    />
                    {registerErrors.lastName && (
                      <p className="mt-1.5 text-sm text-red-600">{registerErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-[#3F2A18]">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#734F32]/55"
                    />
                    <input
                      id="reg-email"
                      type="email"
                      autoComplete="email"
                      value={registerForm.email}
                      onChange={(e) => {
                        const next = { ...registerForm, email: e.target.value };
                        setRegisterForm(next);
                        validateRegisterField("email", next);
                      }}
                      onBlur={() => validateRegisterField("email", registerForm)}
                      className={fieldClass(Boolean(registerErrors.email), true)}
                    />
                  </div>
                  {registerErrors.email && (
                    <p className="mt-1.5 text-sm text-red-600">{registerErrors.email}</p>
                  )}
                </div>

                <PasswordField
                  id="reg-password"
                  label="Password"
                  leadingIcon={<Lock size={16} />}
                  value={registerForm.password}
                  error={registerErrors.password}
                  show={showRegisterPassword}
                  onToggleShow={() => setShowRegisterPassword((v) => !v)}
                  autoComplete="new-password"
                  onChange={(password) => {
                    const next = { ...registerForm, password };
                    setRegisterForm(next);
                    validateRegisterField("password", next);
                  }}
                  onBlur={() => validateRegisterField("password", registerForm)}
                />

                <PasswordField
                  id="reg-confirm"
                  label="Confirm Password"
                  leadingIcon={<Lock size={16} />}
                  value={registerForm.confirmPassword}
                  error={registerErrors.confirmPassword}
                  show={showConfirmPassword}
                  onToggleShow={() => setShowConfirmPassword((v) => !v)}
                  autoComplete="new-password"
                  onChange={(confirmPassword) => {
                    const next = { ...registerForm, confirmPassword };
                    setRegisterForm(next);
                    validateRegisterField("confirmPassword", next);
                  }}
                  onBlur={() => validateRegisterField("confirmPassword", registerForm)}
                />

                {apiError && tab === "register" && (
                  <p className="text-sm text-red-600">{apiError}</p>
                )}
                {successMessage && tab === "register" && (
                  <p className="text-sm text-green-700">{successMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
                  style={{ backgroundColor: BROWN }}
                >
                  {loading && tab === "register" && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading && tab === "register" ? "Creating account…" : "Create account"}
                  {!(loading && tab === "register") && <ArrowRight size={16} />}
                </button>
              </form>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-[#9A8573]">
            © {new Date().getFullYear()} House of Bread London
          </p>
        </div>
      </section>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-[#734F32]/70" style={{ backgroundColor: CREAM }}>
          Loading…
        </div>
      }
    >
      <AccountPageInner />
    </Suspense>
  );
}
