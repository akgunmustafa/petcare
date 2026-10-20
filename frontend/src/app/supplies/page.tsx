"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { api } from "@/lib/api";

type Ad = {
  id: number;
  category: string;
  title: string;
  description: string;
  location: string;
  user_name: string;
  user_verified: boolean;
};

const cats = [
  { id: "", label: "Tümü" },
  { id: "blood", label: "Kan" },
  { id: "lost", label: "Kayıp" },
  { id: "adoption", label: "Sahiplendirme" },
  { id: "food_support", label: "Mama" },
];

export default function SuppliesPage() {
  const [category, setCategory] = useState("");
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    const q = category ? `?category=${category}` : "";
    api<Ad[]>(`/api/supplies/ads${q}`).then(setAds);
  }, [category]);

  return (
    <div className="space-y-5">
      <Link href="/" className="tap inline-flex text-sm font-medium text-muted">
        ← Ana sayfa
      </Link>
      <h1 className="font-display text-3xl font-semibold">İhtiyaç & Dayanışma</h1>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Kategori">
        {cats.map((c) => (
          <button
            key={c.id || "all"}
            type="button"
            onClick={() => setCategory(c.id)}
            className={`tap rounded-full px-4 text-sm font-semibold ${
              category === c.id ? "bg-ink text-white" : "bg-paper text-ink border border-line"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <ul className="space-y-3">
        {ads.map((ad) => (
          <li key={ad.id} className="rounded-2xl border border-line bg-paper p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-clay">{ad.category}</p>
            <h2 className="mt-1 font-display text-lg font-semibold">{ad.title}</h2>
            <p className="mt-1 text-sm">{ad.description}</p>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
              {ad.location} · {ad.user_name}
              {ad.user_verified ? (
                <span className="inline-flex items-center gap-1 text-trust">
                  <BadgeCheck className="h-4 w-4" /> doğrulanmış
                </span>
              ) : null}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
