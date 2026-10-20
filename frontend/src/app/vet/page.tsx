"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { api } from "@/lib/api";

type Question = {
  id: number;
  title: string;
  vet_answer: string | null;
  is_resolved: boolean;
  pet_name: string;
  vet_name: string | null;
  vet_verified: boolean;
};

export default function VetPage() {
  const [items, setItems] = useState<Question[]>([]);
  const [title, setTitle] = useState("");
  const [sending, setSending] = useState(false);

  async function load() {
    setItems(await api<Question[]>("/api/vet/questions"));
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSending(true);
    await api("/api/vet/questions", {
      method: "POST",
      body: JSON.stringify({ pet_id: 1, title }),
    });
    setTitle("");
    setSending(false);
    load();
  }

  return (
    <div className="space-y-5">
      <Link href="/" className="tap inline-flex text-sm font-medium text-muted">
        ← Ana sayfa
      </Link>
      <h1 className="font-display text-3xl font-semibold">Veteriner Soru-Cevap</h1>
      <p className="text-muted">Doğrulanmış veteriner cevapları listenin en üstünde.</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="soru">
          Soru
        </label>
        <input
          id="soru"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Pamuk için sorunuzu yazın"
          className="tap w-full rounded-2xl border border-line bg-paper px-4 text-base"
        />
        <button
          type="submit"
          disabled={sending}
          className="tap rounded-2xl bg-trust px-5 font-semibold text-white"
        >
          Sor
        </button>
      </form>

      <ul className="space-y-3">
        {items.map((q) => (
          <li key={q.id} className="rounded-2xl border border-line bg-paper p-4">
            <div className="flex flex-wrap items-center gap-2">
              {q.vet_verified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-trust/10 px-2 py-1 text-xs font-semibold text-trust">
                  <BadgeCheck className="h-4 w-4" aria-hidden />
                  Doğrulanmış vet
                </span>
              ) : null}
              <span className="text-xs text-muted">{q.pet_name}</span>
            </div>
            <p className="mt-2 font-medium">{q.title}</p>
            {q.vet_answer ? (
              <p className="mt-2 rounded-xl bg-cream px-3 py-2 text-sm">
                <span className="font-semibold">{q.vet_name}: </span>
                {q.vet_answer}
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted">Henüz cevap yok</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
