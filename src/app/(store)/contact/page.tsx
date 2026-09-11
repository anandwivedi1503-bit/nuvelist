"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || "Could not send");
    else setDone(true);
  }

  return (
    <div className="container-nvl max-w-xl py-14">
      <h1 className="serif text-5xl">Contact</h1>
      <p className="mt-3 text-sm text-muted">
        Care, orders and clinical questions. Messages land in the Nuvelist CRM for the team to
        reply.
      </p>
      {done ? (
        <p className="mt-8 text-teal">Received. We will write back to your email.</p>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-3">
          <input className="input" placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder="Mobile (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="input" placeholder="Subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <textarea className="input min-h-32" placeholder="Message" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button className="btn btn-primary">Send</button>
        </form>
      )}
    </div>
  );
}
