"use client";

import { useState } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import { apiUrl } from "@/lib/api";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(apiUrl("/api/messages"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
      setError((err as Error).message);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-crust/15 bg-cream/50 px-4 py-3 text-sm text-crust-deep outline-none transition focus:border-crust focus:ring-2 focus:ring-honey/40";

  if (status === "success") {
    return (
      <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle2 size={40} className="mx-auto text-green-600" />
        <h3 className="mt-3 font-display text-xl font-bold text-green-800">Message sent!</h3>
        <p className="mt-1 text-green-700">
          Thanks for reaching out — we&apos;ll be in touch within one business day.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-4 rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-crust-deep">Name *</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputCls}
            placeholder="Your full name"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-crust-deep">Email *</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputCls}
            placeholder="you@example.com"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-crust-deep">Subject *</label>
        <input
          required
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className={inputCls}
          placeholder="e.g. Wedding cake enquiry"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-crust-deep">Message *</label>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={inputCls}
          placeholder="Tell us what you need…"
        />
      </div>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center gap-2 rounded-full bg-crust px-7 py-3 text-sm font-semibold text-white transition hover:bg-crust-dark disabled:opacity-60"
      >
        {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {status === "loading" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
