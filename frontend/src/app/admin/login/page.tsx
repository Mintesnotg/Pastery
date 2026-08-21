"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight } from "lucide-react";
import { BreadSlice } from "@/components/BreadSlice";
import { apiUrl } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.replace("/admin");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md rounded-3xl border border-crust/10 bg-white p-8 shadow-xl">
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-warm text-crust">
            <Lock size={26} />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-crust-deep">Staff Portal</h1>
          <p className="mt-1 text-sm text-crust/70">House of Bread London Admin Dashboard</p>
          <BreadSlice className="mx-auto mt-2 h-6 w-16 text-honey" />
        </div>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-crust/70">
              Admin Email
            </label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="admin@houseofbread.local"
              className="mt-1.5 w-full rounded-xl border border-crust/15 bg-cream/50 px-4 py-3 outline-none transition focus:border-crust focus:ring-2 focus:ring-honey/40"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-crust/70">
              Password
            </label>
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Enter admin password"
              className="mt-1.5 w-full rounded-xl border border-crust/15 bg-cream/50 px-4 py-3 outline-none transition focus:border-crust focus:ring-2 focus:ring-honey/40"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-crust py-3 font-semibold text-white transition hover:bg-crust-dark disabled:opacity-60"
          >
            {loading ? "Signing in…" : <>Access Dashboard <ArrowRight size={16} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
