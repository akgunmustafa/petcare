"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api, ISTANBUL } from "@/lib/api";

type Ride = {
  id: number;
  status: string;
  price: number;
  driver_name?: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
};

type Gps = { lat: number; lng: number; status: string; progress: number };

export default function TaxiPage() {
  const [ride, setRide] = useState<Ride | null>(null);
  const [gps, setGps] = useState<Gps | null>(null);
  const [loading, setLoading] = useState(false);

  const dropoff = useMemo(() => ({ lat: 40.9881, lng: 29.0244 }), []);

  useEffect(() => {
    api<Ride[]>("/api/taxi/rides").then((rides) => {
      if (rides[0]) setRide(rides[0]);
    });
  }, []);

  async function requestRide() {
    setLoading(true);
    const data = await api<Ride>("/api/taxi/request", {
      method: "POST",
      body: JSON.stringify({
        pet_id: 1,
        pickup_lat: ISTANBUL.lat,
        pickup_lng: ISTANBUL.lng,
        dropoff_lat: dropoff.lat,
        dropoff_lng: dropoff.lng,
      }),
    });
    setRide(data);
    setLoading(false);
  }

  useEffect(() => {
    if (!ride?.id) return;
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${proto}://localhost:8000/ws/taxi/${ride.id}`);
    ws.onmessage = (ev) => setGps(JSON.parse(ev.data));
    return () => ws.close();
  }, [ride?.id]);

  const x = gps ? 12 + gps.progress * 76 : 12;
  const y = gps ? 70 - gps.progress * 40 : 70;

  return (
    <div className="space-y-5">
      <Link href="/" className="tap inline-flex text-sm font-medium text-muted">
        ← Ana sayfa
      </Link>
      <h1 className="font-display text-3xl font-semibold">Pet Taksi</h1>
      <p className="text-muted">Kadıköy → Kadıköy 7/24 Veteriner. Fiyat mesafeye göre hesaplanır.</p>

      {!ride ? (
        <button
          type="button"
          onClick={requestRide}
          disabled={loading}
          className="tap w-full rounded-2xl bg-trust px-4 font-semibold text-white sm:w-auto"
        >
          {loading ? "Hesaplanıyor…" : "Taksi çağır"}
        </button>
      ) : (
        <div className="rounded-2xl border border-line bg-paper p-4">
          <p className="font-medium">
            {ride.driver_name || "Sürücü"} · {ride.price} ₺ · {gps?.status || ride.status}
          </p>
          <p className="text-sm text-muted">
            Konum: {gps ? `${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)}` : "bağlanıyor…"}
          </p>
        </div>
      )}

      <div className="relative h-64 overflow-hidden rounded-3xl border border-line bg-[#d7ead8]" aria-label="Canlı harita">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <circle cx="14" cy="72" r="4" fill="#0E5C4B" />
          <circle cx="88" cy="28" r="4" fill="#B42318" />
          <text x="8" y="84" fontSize="4" fill="#1B1510">
            Alma
          </text>
          <text x="72" y="22" fontSize="4" fill="#1B1510">
            Klinik
          </text>
          {ride ? <circle cx={x} cy={y} r="3.5" fill="#C45C26" /> : null}
        </svg>
      </div>
    </div>
  );
}
