"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not create account");
      return;
    }
    router.push("/account");
    router.refresh();
  }

  return (
    <div className="container-nvl max-w-md py-16">
      <h1 className="serif text-5xl">Create account</h1>
      <p className="mt-2 text-sm text-muted">Use a 10-digit Indian mobile. Password needs upper, lower and a number.</p>
      <form onSubmit={submit} className="mt-8 space-y-3">
        <input className="input" placeholder="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input" type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="input" placeholder="Mobile" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className="input" type="password" placeholder="Password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? "Creating…" : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </div>
  );
}
