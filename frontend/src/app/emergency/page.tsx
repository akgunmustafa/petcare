"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Phone } from "lucide-react";
import { api, ISTANBUL } from "@/lib/api";

type Result = {
  vet: {
    name: string;
    clinic_name: string;
    phone: string;
    is_verified: boolean;
    distance_km: number;
  };
  taxi: {
    ride_id: number;
    status: string;
    price: number;
    driver_name: string;
    driver_phone: string;
  };
  pet: { name: string };
};

export default function EmergencyPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  async function summon() {
    setLoading(true);
    setError("");
    try {
      const pos = await new Promise<{ lat: number; lng: number }>((resolve) => {
        if (!navigator.geolocation) return resolve(ISTANBUL);
        navigator.geolocation.getCurrentPosition(
          (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
          () => resolve(ISTANBUL),
          { timeout: 2500 }
        );
      });
      const data = await api<Result>("/api/emergency/trigger", {
        method: "POST",
        body: JSON.stringify({ pet_id: 1, lat: pos.lat, lng: pos.lng }),
      });
      setResult(data);
    } catch {
      setError("Yardım çağrılamadı. Tekrar dene.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <Link href="/" className="tap inline-flex items-center text-sm font-medium text-muted">
        ← Ana sayfa
      </Link>
      <h1 className="font-display text-3xl font-semibold text-emergency">Acil durum</h1>
      <p className="text-muted">
        Konumunla en yakın açık veteriner bulunur ve pet taksi klinik adresine yönlendirilir.
      </p>

      {!result ? (
        <button
          type="button"
          onClick={summon}
          disabled={loading}
          className="tap flex w-full items-center justify-center rounded-3xl bg-emergency py-6 text-2xl font-bold text-white shadow-[0_12px_30px_-12px_rgba(180,35,24,0.7)] disabled:opacity-70"
        >
          {loading ? "Çağrılıyor…" : "Yardım çağır"}
        </button>
      ) : (
        <div className="space-y-4 rounded-3xl border border-line bg-paper p-5">
          <p className="inline-flex items-center gap-2 font-semibold text-trust">
            <CheckCircle2 className="h-5 w-5" aria-hidden />
            Yardım yolda — {result.pet.name}
          </p>
          <div>
            <p className="text-sm text-muted">En yakın açık klinik</p>
            <p className="font-display text-xl font-semibold">{result.vet.clinic_name}</p>
            <p>
              {result.vet.name}
              {result.vet.is_verified ? (
                <span className="ml-2 rounded-full bg-trust/10 px-2 py-0.5 text-xs font-semibold text-trust">
                  Doğrulanmış vet
                </span>
              ) : null}
            </p>
            <p className="text-sm text-muted">{result.vet.distance_km} km</p>
            <a className="tap mt-2 inline-flex items-center gap-2 font-semibold text-emergency" href={`tel:${result.vet.phone}`}>
              <Phone className="h-4 w-4" aria-hidden />
              {result.vet.phone}
            </a>
          </div>
          <div className="rounded-2xl bg-cream p-3">
            <p className="text-sm text-muted">Pet taksi sevk edildi</p>
            <p className="font-medium">
              {result.taxi.driver_name} · {result.taxi.price} ₺ · {result.taxi.status}
            </p>
            <Link href="/taxi" className="tap mt-2 inline-flex font-semibold text-trust">
              Canlı konumu aç →
            </Link>
          </div>
        </div>
      )}
      {error ? <p className="text-emergency">{error}</p> : null}
    </div>
  );
}
