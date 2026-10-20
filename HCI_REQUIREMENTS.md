# HCI Principles & Project Scope

## 1. Applied HCI Rules in UI
- **Emergency Mode (Fitts's Law):** Sticky header, high-contrast red `ACİL NÖBETÇİ VET & AMBULANS` button. One click summons clinic + pet ambulance.
- **Cognitive Load (Miller's Law):** Five tabs — Otel & Bakıcı, Veterinere Sor, Pet Taksi, İhtiyaç & İlan, Dijital Karne.
- **Trust & Transparency:** Diploma/kimlik onaylı rozetler, dijital aşı karnesi, “Güvenli Havuz” escrow notice.
- **WCAG 2.1 AA:** Readable contrast, labeled inputs, large tap targets on primary actions.

## 2. Cross-Module Synergy
On boarding, a single checkbox:
`🚐 Evden Alıp Bırakacak Pet Taksi Ekle (+350 TL)`
creates a `BoardingBooking` and auto-inserts a `TaxiRide`. Vaccine card is shown as the active pet profile.
