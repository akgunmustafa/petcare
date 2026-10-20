"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Camera, Leaf, PawPrint } from "lucide-react";
import { PetCard } from "@/components/PetCard";
import { api } from "@/lib/api";

type Listing = {
  id: number;
  name: string;
  type: string;
  price_per_night: number;
  rating: number;
  neighborhood: string;
  host_verified: boolean;
  features: { no_other_pets?: boolean; garden?: boolean; cam_24_7?: boolean };
};

type Profile = {
  pets: {
    name: string;
    species: string;
    breed: string;
    weight_kg: number;
    vaccines_json: string;
    medical_notes: string;
  }[];
};

type Booked = {
  id: number;
  listing_name: string;
  nights: number;
  stay_total: number;
  taxi_ride_id: number | null;
  taxi_price: number;
  include_pet_taxi: boolean;
};

export default function BoardingPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [type, setType] = useState("");
  const [noOther, setNoOther] = useState(false);
  const [selected, setSelected] = useState<Listing | null>(null);
  const [includeTaxi, setIncludeTaxi] = useState(true);
  const [start, setStart] = useState("2026-10-25");
  const [end, setEnd] = useState("2026-10-28");
  const [booked, setBooked] = useState<Booked | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  async function load() {
    const q = new URLSearchParams();
    if (type) q.set("type", type);
    if (noOther) q.set("no_other_pets", "true");
    setListings(await api<Listing[]>(`/api/boarding/listings?${q}`));
  }

  useEffect(() => {
    load();
    api<Profile>("/api/profile").then(setProfile);
  }, [type, noOther]);

  async function onBook(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    const data = await api<Booked>("/api/boarding/book", {
      method: "POST",
      body: JSON.stringify({
        listing_id: selected.id,
        pet_id: 1,
        start_date: start,
        end_date: end,
        include_pet_taxi: includeTaxi,
      }),
    });
    setBooked(data);
  }

  const pet = profile?.pets[0];
  const vaccines = pet ? JSON.parse(pet.vaccines_json) : [];

  if (booked) {
    return (
      <div className="space-y-4">
        <Link href="/" className="tap inline-flex text-sm font-medium text-muted">
          ← Ana sayfa
        </Link>
        <h1 className="font-display text-3xl font-semibold">Rezervasyon alındı</h1>
        <p>
          {booked.listing_name} · {booked.nights} gece · {booked.stay_total} ₺
        </p>
        {booked.include_pet_taxi ? (
          <p className="rounded-2xl bg-trust/10 p-3 text-trust">
            Pet taksi gidiş-dönüş sevk edildi ({booked.taxi_price} ₺).{" "}
            <Link href="/taxi" className="font-semibold underline">
              Canlı takip
            </Link>
          </p>
        ) : null}
        <p className="text-sm text-muted">Ödeme emanet (escrow) hesabında tutulur; check-in sonrası serbest bırakılır.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link href="/" className="tap inline-flex text-sm font-medium text-muted">
        ← Ana sayfa
      </Link>
      <h1 className="font-display text-3xl font-semibold">Otel & Bakıcı</h1>

      <div className="flex flex-wrap gap-2">
        <label className="sr-only" htmlFor="tur">
          Tür
        </label>
        <select
          id="tur"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="tap rounded-2xl border border-line bg-paper px-3"
        >
          <option value="">Tümü</option>
          <option value="hotel">Otel</option>
          <option value="home_sitter">Ev bakıcısı</option>
        </select>
        <label className="tap inline-flex items-center gap-2 rounded-2xl border border-line bg-paper px-3">
          <input type="checkbox" checked={noOther} onChange={(e) => setNoOther(e.target.checked)} />
          Başka hayvan yok
        </label>
      </div>

      <ul className="space-y-3">
        {listings.map((l) => (
          <li key={l.id}>
            <button
              type="button"
              onClick={() => setSelected(l)}
              className={`w-full rounded-2xl border p-4 text-left ${
                selected?.id === l.id ? "border-trust bg-trust/5" : "border-line bg-paper"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold">{l.name}</p>
                  <p className="text-sm text-muted">
                    {l.type === "hotel" ? "Otel" : "Ev bakıcısı"} · {l.neighborhood} · {l.rating}★
                  </p>
                </div>
                <p className="font-semibold">{l.price_per_night} ₺</p>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {l.host_verified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-trust/10 px-2 py-1 font-semibold text-trust">
                    <BadgeCheck className="h-3 w-3" />
                    Doğrulanmış
                  </span>
                ) : null}
                {l.features.no_other_pets ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-cream px-2 py-1">
                    <PawPrint className="h-3 w-3" /> tek hayvan
                  </span>
                ) : null}
                {l.features.garden ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-cream px-2 py-1">
                    <Leaf className="h-3 w-3" /> bahçe
                  </span>
                ) : null}
                {l.features.cam_24_7 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-cream px-2 py-1">
                    <Camera className="h-3 w-3" /> 7/24 kam
                  </span>
                ) : null}
              </div>
            </button>
          </li>
        ))}
      </ul>

      {selected && pet ? (
        <form onSubmit={onBook} className="space-y-4 rounded-3xl border border-line bg-paper p-4">
          <h2 className="font-display text-xl font-semibold">Rezervasyon — {selected.name}</h2>
          <PetCard
            compact
            name={pet.name}
            species={pet.species}
            breed={pet.breed}
            weightKg={pet.weight_kg}
            vaccines={vaccines}
            notes={pet.medical_notes}
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-medium">
              Giriş
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="tap mt-1 w-full rounded-xl border border-line px-3"
              />
            </label>
            <label className="text-sm font-medium">
              Çıkış
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="tap mt-1 w-full rounded-xl border border-line px-3"
              />
            </label>
          </div>
          <label className="tap flex items-start gap-3 rounded-2xl bg-cream p-3">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5"
              checked={includeTaxi}
              onChange={(e) => setIncludeTaxi(e.target.checked)}
            />
            <span>
              <span className="block font-semibold">Alış ve bırakış için Pet Taksi ekle</span>
              <span className="text-sm text-muted">Konaklama, taksi ve aşı kartı tek adımda bağlanır.</span>
            </span>
          </label>
          <p className="text-sm text-muted">Ödeme emanet (escrow) hesabında tutulur; check-in sonrası serbest bırakılır.</p>
          <button type="submit" className="tap w-full rounded-2xl bg-trust font-semibold text-white">
            Rezervasyonu onayla
          </button>
        </form>
      ) : null}
    </div>
  );
}
