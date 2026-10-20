"use client";
import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:8000/api";

export default function PetCareHCIDashboard() {
  const [activeTab, setActiveTab] = useState<"vet" | "taxi" | "boarding" | "community" | "profile">("boarding");
  const [data, setData] = useState<any>({
    pets: [{ id: 1, name: "Tarçın", species: "Köpek", breed: "Golden Retriever", age: 3, weight_kg: 28.5, vaccines: "Kuduz: Tam | Karma: Tam | Parazit: Güncel", medical_notes: "Tavuk alerjisi var. Uysal." }],
    questions: [
      { id: 1, pet_name: "Tarçın", question: "Sol kulağını sürekli kaşıyor ve kızarıklık var.", vet_name: "Uzm. Vet. Selin Demir", vet_answer: "Enfeksiyon başlangıcı olabilir. Yakalık takın, yarın kliniğe bekleriz.", is_urgent: false }
    ],
    rides: [],
    listings: [
      { id: 1, title: "Zeynep H. - Ev Ortamında Bakıcı", host_type: "Bireysel Bakıcı", district: "Kadıköy", price_per_night: 650, rating: 4.9, no_other_pets: true, has_garden: false, cam_24_7: true },
      { id: 2, title: "PatiPalace VIP Pet Otel", host_type: "Kurumsal Otel", district: "Sarıyer", price_per_night: 1100, rating: 4.8, no_other_pets: false, has_garden: true, cam_24_7: true },
      { id: 3, title: "Emre B. - Bahçeli Müstakil Ev Sahibi", host_type: "Bireysel Bakıcı", district: "Çankaya", price_per_night: 750, rating: 4.7, no_other_pets: true, has_garden: true, cam_24_7: false }
    ],
    bookings: [],
    community: [
      { id: 1, category: "Acil Kan", title: "25kg üstü sağlıklı köpekten acil kan aranıyor!", location: "Çankaya / Ankara", contact: "0532 000 11 22" },
      { id: 2, category: "İhtiyaç/Mama", title: "Medikal Yakalık & Antiseptik Bakım Seti", location: "Hızlı Kurye (45 dk)", contact: "450 TL" }
    ]
  });

  // UI Durumları (States)
  const [emergencyAlert, setEmergencyAlert] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [onlyNoOtherPets, setOnlyNoOtherPets] = useState<boolean>(false);
  const [nights, setNights] = useState<number>(3);
  const [includeTaxi, setIncludeTaxi] = useState<boolean>(true);
  const [newQuestion, setNewQuestion] = useState<string>("");
  const [pickup, setPickup] = useState<string>("Ev Adresim (Kadıköy)");
  const [dropoff, setDropoff] = useState<string>("Acıbadem Veteriner Kliniği");
  const [distance, setDistance] = useState<number>(6.5);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/dashboard`);
      if (res.ok) setData(await res.json());
    } catch {
      // Backend çalışmıyorsa yerleşik demo verileriyle kesintisiz devam eder
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 1. ACİL DURUM TETİKLEYİCİ (Fitts Yasası: Tek Tıkla Klinik + Ambulans)
  const handleEmergency = async () => {
    try {
      const res = await fetch(`${API_URL}/emergency?pet_id=1`, { method: "POST" });
      if (res.ok) {
        const result = await res.json();
        setEmergencyAlert(result);
        fetchData();
        return;
      }
    } catch {}
    setEmergencyAlert({
      message: "Nöbetçi klinik bilgilendirildi. Pet Ambulans konumunuza yönlendirildi!",
      clinic: "PatiLife 7/24 Acil Veteriner Polikliniği (2.1 km)",
      eta_minutes: 4
    });
  };

  // 2. KONAKLAMA + PET TAKSİ ÇAPRAZ REZERVASYON
  const handleBookBoarding = async (listing: any) => {
    const taxiFee = includeTaxi ? 350 : 0;
    const total = listing.price_per_night * nights + taxiFee;
    try {
      const res = await fetch(`${API_URL}/boarding/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listing.id,
          pet_id: 1,
          nights,
          include_pet_taxi: includeTaxi,
          total_price: total
        })
      });
      if (res.ok) {
        fetchData();
        alert(`Rezervasyon Onaylandı! Toplam: ${total} TL (Güvenli Havuzda). ${includeTaxi ? "Pet Taksi transferiniz de otomatik planlandı." : ""}`);
        return;
      }
    } catch {}
    setData((prev: any) => ({
      ...prev,
      bookings: [{ id: Date.now(), listing_id: listing.id, nights, include_pet_taxi: includeTaxi, total_price: total, status: "Onaylandı (Güvenli Havuzda)" }, ...prev.bookings],
      rides: includeTaxi ? [{ id: Date.now(), pickup: "Ev Adresim", dropoff: listing.title, distance_km: 8.5, price: 350, status: "Konaklama Transferi Planlandı" }, ...prev.rides] : prev.rides
    }));
  };

  // 3. VETERİNERE SORU SORMA
  const handleAskVet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    const payload = { pet_name: "Tarçın", question: newQuestion, is_urgent: false };
    try {
      const res = await fetch(`${API_URL}/vet/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setNewQuestion("");
        fetchData();
        return;
      }
    } catch {}
    setData((prev: any) => ({
      ...prev,
      questions: [{ id: Date.now(), ...payload, vet_name: "Nöbetçi Uzman", vet_answer: "Sorunuz uzman havuzuna iletildi (Ort. 10 dk)." }, ...prev.questions]
    }));
    setNewQuestion("");
  };

  // 4. ANLIK PET TAKSİ ÇAĞIRMA
  const handleCallTaxi = async (e: React.FormEvent) => {
    e.preventDefault();
    const calcPrice = Math.round(120 + distance * 35);
    try {
      const res = await fetch(`${API_URL}/taxi/call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pet_id: 1, pickup, dropoff, distance_km: distance, price: calcPrice })
      });
      if (res.ok) {
        fetchData();
        return;
      }
    } catch {}
    setData((prev: any) => ({
      ...prev,
      rides: [{ id: Date.now(), pickup, dropoff, distance_km: distance, price: calcPrice, status: "Araç Yolda (Canlı GPS Aktif)" }, ...prev.rides]
    }));
  };

  const filteredListings = data.listings.filter((item: any) => {
    if (filterType !== "ALL" && item.host_type !== filterType) return false;
    if (onlyNoOtherPets && !item.no_other_pets) return false;
    return true;
  });

  const activePet = data.pets[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      {/* ÜST BAR & FITTS YASASI ACİL DURUM BUTONU */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐾</span>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">PetCare Connect</h1>
              <p className="text-xs text-slate-500">Veteriner • Pet Taksi • Otel & Bakıcı • Dayanışma</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-medium text-emerald-800">
              <span>🐕 Aktif Profil: <strong>{activePet?.name}</strong> (Aşılar Tam)</span>
            </div>
            <button
              onClick={handleEmergency}
              className="bg-red-600 hover:bg-red-700 active:scale-95 transition text-white font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 text-sm cursor-pointer"
            >
              <span>🚨</span> ACİL NÖBETÇİ VET & AMBULANS
            </button>
          </div>
        </div>
      </header>

      {/* ACİL DURUM AKTİF BİLDİRİM KUTUSU */}
      {emergencyAlert && (
        <div className="max-w-5xl mx-auto mt-4 px-4">
          <div className="bg-red-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg">🚑 {emergencyAlert.message}</h2>
              <p className="text-sm text-red-100 mt-0.5">
                Hedef Klinik: <strong>{emergencyAlert.clinic}</strong> • Tahmini Varış: <strong>{emergencyAlert.eta_minutes} Dakika</strong> • Dijital Aşı Karnesi kliniğe iletildi.
              </p>
            </div>
            <button onClick={() => setEmergencyAlert(null)} className="bg-red-800 hover:bg-red-900 px-3 py-1.5 rounded-lg text-xs font-semibold">
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* ANA MODÜL SEKMELERİ (Miller Yasası: 5 Net Kategori) */}
      <main className="max-w-5xl mx-auto px-4 mt-6">
        <nav className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-200/70 p-1.5 rounded-2xl mb-6">
          {[
            { id: "boarding", icon: "🏨", label: "Otel & Bakıcı" },
            { id: "vet", icon: "🩺", label: "Veterinere Sor" },
            { id: "taxi", icon: "🚐", label: "Pet Taksi" },
            { id: "community", icon: "🛍️", label: "İhtiyaç & İlan" },
            { id: "profile", icon: "🪪", label: "Dijital Karne" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* MODÜL 1: KONAKLAMA & BAKICI (PET OTEL & EV SAHİPLİĞİ) */}
        {activeTab === "boarding" && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-slate-300 rounded-xl px-3 py-2 text-sm font-medium bg-slate-50"
                >
                  <option value="ALL">Tüm Konaklamalar (Otel + Bakıcı)</option>
                  <option value="Bireysel Bakıcı">🏠 Sadece Bireysel Ev Sahipleri</option>
                  <option value="Kurumsal Otel">🏨 Sadece Kurumsal Pet Otelleri</option>
                </select>

                <label className="flex items-center gap-2 text-sm font-medium bg-slate-100 px-3 py-2 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyNoOtherPets}
                    onChange={(e) => setOnlyNoOtherPets(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  Evde Başka Hayvan Olmasın
                </label>
              </div>

              {/* ÇAPRAZ MODÜL ENTEGRASYON KONTROLÜ */}
              <div className="flex flex-wrap items-center gap-4 bg-indigo-50 border border-indigo-100 px-4 py-2.5 rounded-xl">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-indigo-950">Gece Sayısı:</span>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={nights}
                    onChange={(e) => setNights(Number(e.target.value) || 1)}
                    className="w-16 border border-indigo-300 rounded-lg px-2 py-1 text-center font-bold bg-white"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold text-indigo-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeTaxi}
                    onChange={(e) => setIncludeTaxi(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600"
                  />
                  🚐 Evden Alıp Bırakacak Pet Taksi Ekle (+350 TL)
                </label>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {filteredListings.map((item: any) => {
                const totalPrice = item.price_per_night * nights + (includeTaxi ? 350 : 0);
                return (
                  <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.host_type === "Kurumsal Otel" ? "bg-purple-100 text-purple-800" : "bg-amber-100 text-amber-800"}`}>
                          {item.host_type}
                        </span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                          ✓ Kimlik & Ruhsat Onaylı
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-slate-900 mt-2">{item.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">📍 {item.district} • ⭐ {item.rating} Puan</p>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {item.no_other_pets && <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md">🐾 Başka Hayvan Yok</span>}
                        {item.has_garden && <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md">🌳 Bahçeli Alan</span>}
                        {item.cam_24_7 && <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md">📹 7/24 Canlı Kamera</span>}
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <div className="flex items-baseline justify-between mb-3">
                        <span className="text-xs text-slate-500">Gecelik {item.price_per_night} TL</span>
                        <span className="text-lg font-extrabold text-slate-900">Toplam: {totalPrice} TL</span>
                      </div>
                      <button
                        onClick={() => handleBookBoarding(item)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-sm transition cursor-pointer"
                      >
                        Güvenli Havuz ile Rezerve Et
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {data.bookings.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <h4 className="font-bold text-sm text-emerald-950 mb-2">✅ Aktif Konaklama Rezervasyonlarım</h4>
                <div className="space-y-2">
                  {data.bookings.map((b: any) => (
                    <div key={b.id} className="bg-white p-3 rounded-xl text-xs flex items-center justify-between border border-emerald-100">
                      <span><strong>{b.nights} Gece Konaklama</strong> ({b.include_pet_taxi ? "🚐 Pet Taksi Transfer Dahil" : "Bireysel Teslim"})</span>
                      <span className="font-bold text-emerald-700">{b.total_price} TL • {b.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODÜL 2: VETERİNER SORU-CEVAP & DANIŞMANLIK */}
        {activeTab === "vet" && (
          <div className="grid md:grid-cols-3 gap-6">
            <form onSubmit={handleAskVet} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 h-fit">
              <h3 className="font-bold text-base">🩺 Uzman Veterinere Soru Sor</h3>
              <p className="text-xs text-slate-500">
                <strong>{activePet?.name}</strong> adlı dostunuzun dijital aşı karnesi sorunuzla birlikte uzman hekime otomatik iletilir.
              </p>
              <textarea
                rows={4}
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Belirtileri detaylıca yazın (Örn: İştahsızlık, kızarıklık, öksürük...)"
                className="w-full border border-slate-300 rounded-xl p-3 text-sm"
              />
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-sm cursor-pointer">
                Soruyu Gönder
              </button>
            </form>

            <div className="md:col-span-2 space-y-4">
              {data.questions.map((q: any) => (
                <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold bg-slate-100 px-2.5 py-1 rounded-full">🐾 Hasta: {q.pet_name}</span>
                    {q.is_urgent && <span className="text-xs font-bold bg-red-100 text-red-700 px-2.5 py-1 rounded-full">Acil Belirti</span>}
                  </div>
                  <p className="font-semibold text-slate-900 text-sm mb-3">“{q.question}”</p>
                  <div className="bg-indigo-50/70 border border-indigo-100 p-3.5 rounded-xl">
                    <div className="text-xs font-bold text-indigo-900 mb-1">✓ {q.vet_name} (Diploma Onaylı)</div>
                    <p className="text-xs text-slate-700 leading-relaxed">{q.vet_answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODÜL 3: HAYVAN NAKİL (PET TAKSİ) */}
        {activeTab === "taxi" && (
          <div className="grid md:grid-cols-3 gap-6">
            <form onSubmit={handleCallTaxi} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-base">🚐 Anlık Pet Taksi Çağır</h3>
              <div>
                <label className="text-xs font-semibold text-slate-600">Alınacak Konum</label>
                <input value={pickup} onChange={(e) => setPickup(e.target.value)} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Varış Noktası (Klinik / Otel)</label>
                <input value={dropoff} onChange={(e) => setDropoff(e.target.value)} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Tahmini Mesafe (km)</label>
                <input type="number" step="0.5" value={distance} onChange={(e) => setDistance(Number(e.target.value) || 1)} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm mt-1" />
              </div>
              <div className="bg-slate-100 p-3 rounded-xl text-sm flex justify-between font-bold">
                <span>Tahmini Ücret:</span>
                <span className="text-indigo-600">{Math.round(120 + distance * 35)} TL</span>
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-sm cursor-pointer">
                Güvenli Nakil Aracı Çağır
              </button>
            </form>

            <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-base mb-4">📍 Aktif ve Planlanan Yolculuklar</h3>
              {data.rides.length === 0 ? (
                <p className="text-sm text-slate-500">Henüz aktif bir nakil talebiniz bulunmuyor.</p>
              ) : (
                <div className="space-y-3">
                  {data.rides.map((r: any) => (
                    <div key={r.id} className="border border-slate-200 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">{r.status}</span>
                        <p className="font-semibold text-sm mt-2">{r.pickup} ➔ {r.dropoff}</p>
                        <p className="text-xs text-slate-500">Mesafe: {r.distance_km} km • Havalandırmalı & Kafesli Araç</p>
                      </div>
                      <div className="text-right font-bold text-slate-900">{r.price} TL</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODÜL 4: İHTİYAÇ & DAYANIŞMA PANOSU */}
        {activeTab === "community" && (
          <div className="grid md:grid-cols-3 gap-4">
            {data.community.map((item: any) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.category === "Acil Kan" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-800"}`}>
                    {item.category}
                  </span>
                  <h4 className="font-bold text-sm mt-3">{item.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">📍 {item.location}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                  <span>{item.contact}</span>
                  <button onClick={() => alert("İletişim / Sipariş ekranı açıldı.")} className="underline cursor-pointer">İncele</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODÜL 5: DİJİTAL PET KARNESİ */}
        {activeTab === "profile" && activePet && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold">🪪 Dijital Sağlık & Aşı Karnesi</h3>
                <p className="text-xs text-slate-500">Rezervasyonlarda bakıcı ve kliniklerle otomatik paylaşılır.</p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">Aşılar Tam</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 p-3 rounded-xl"><span className="text-xs text-slate-500 block">İsim / Tür</span><strong>{activePet.name} ({activePet.species})</strong></div>
              <div className="bg-slate-50 p-3 rounded-xl"><span className="text-xs text-slate-500 block">Irk / Yaş / Kilo</span><strong>{activePet.breed} • {activePet.age} Yaş • {activePet.weight_kg} kg</strong></div>
              <div className="col-span-2 bg-slate-50 p-3 rounded-xl"><span className="text-xs text-slate-500 block">Aşı Takvimi</span><strong>{activePet.vaccines}</strong></div>
              <div className="col-span-2 bg-amber-50 border border-amber-200 p-3 rounded-xl"><span className="text-xs text-amber-800 block">Özel Sağlık ve Bakım Notu</span><strong className="text-amber-950">{activePet.medical_notes}</strong></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}