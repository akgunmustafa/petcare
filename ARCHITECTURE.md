# PetCare Connect - Technical Architecture

## 1. Tech Stack
- **Backend:** Python 3.11+ & FastAPI
- **Database & ORM:** SQLite + SQLModel
- **Frontend:** Next.js (App Router) + Tailwind CSS — tek sayfa dashboard

## 2. Folder Structure

```text
pet-web-app/
├── backend/
│   ├── main.py              # App, CORS, seed, all API routes
│   ├── models.py            # Pet, VetQuestion, TaxiRide, Boarding*, CommunityItem
│   └── requirements.txt
├── frontend/
│   └── src/app/
│       ├── layout.tsx
│       └── page.tsx         # 5 sekme + acil CTA (HCI)
└── docker-compose.yml
```

## 3. Schema
- **Pet:** name, species, breed, age, weight_kg, vaccines, medical_notes
- **VetQuestion:** pet_name, question, vet_name, vet_answer, is_urgent
- **TaxiRide:** pet_id, pickup, dropoff, distance_km, price, status
- **BoardingListing:** title, host_type, district, price_per_night, rating, no_other_pets, has_garden, cam_24_7, verified
- **BoardingBooking:** listing_id, pet_id, nights, include_pet_taxi, total_price, status
- **CommunityItem:** category, title, location, contact

## 4. API
- `GET  /api/dashboard` — pets, questions, rides, listings, bookings, community
- `POST /api/emergency?pet_id=1` — nöbetçi klinik + pet ambulans (TaxiRide)
- `POST /api/vet/questions` — uzman havuzuna soru
- `POST /api/taxi/call` — fiyat: `120 + km * 35`
- `POST /api/boarding/book` — rezervasyon; `include_pet_taxi` ise otomatik TaxiRide

## 5. Run
```bash
cd backend && uvicorn main:app --reload --port 8000
cd frontend && npm run dev
```
Web: http://localhost:3000 · API: http://localhost:8000/docs
