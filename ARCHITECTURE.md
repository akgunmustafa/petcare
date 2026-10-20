# PetCare Platform - Technical Architecture

## 1. Tech Stack (Web + Future Mobile Ready)
- **Backend:** Python 3.11+ & **FastAPI** (REST + WebSockets for live taxi tracking)
- **Database & ORM:** **PostgreSQL** (+ PostGIS for location) & **SQLModel** (Pydantic + SQLAlchemy combined = 50% less code)
- **Frontend (Web):** **Next.js (App Router)** + Tailwind CSS + Lucide Icons (Mobile-first PWA ready)
- **Future Mobile:** React Native (Expo) — shares TypeScript types & API logic with Next.js.

## 2. Monorepo Folder Structure

```text
petcare-app/
├── .cursor/rules/karpathy-guidelines.mdc
├── backend/
│   ├── main.py              # FastAPI app entry, CORS, router mounts
│   ├── db.py                # Database engine & session dependency
│   ├── models.py            # All SQLModel tables & schemas in one place initially
│   └── routers/
│       ├── emergency.py     # One-click nearest vet + ambulance trigger
│       ├── vet.py           # Q&A, clinic appointments, tele-vet
│       ├── taxi.py          # Pet taxi request, price calc, WebSocket GPS
│       ├── boarding.py      # Pet hotels & individual sitters (Airbnb model)
│       └── supplies.py      # Pet needs & solidarity/adoption board
├── frontend/
│   ├── src/app/
│   │   ├── page.tsx         # Dashboard (HCI optimized + Emergency CTA)
│   │   ├── emergency/       # 1-Click panic flow
│   │   ├── vet/             # Q&A & Appointments
│   │   ├── taxi/            # Map + Ride request
│   │   ├── boarding/        # Hotel & Sitter listing/booking
│   │   ├── supplies/        # Shop & Solidarity ads
│   │   └── profile/         # Digital Pet Vaccine Card
│   └── src/components/      # Shared UI (Navbar, EmergencyBanner, PetCard)
└── docker-compose.yml       # Postgres + Backend + Frontend
```

## 3. Core Database Schema (SQLModel Summary)
- **User:** id, name, phone, role (owner | vet | driver | sitter | hotel_admin), is_verified, lat, lng
- **Pet:** id, owner_id, name, species, breed, weight_kg, vaccines_json, medical_notes
- **VetQuestion:** id, pet_id, title, media_url, vet_answer, is_resolved
- **TaxiRide:** id, pet_id, driver_id, pickup_lat_lng, dropoff_lat_lng, status, price
- **BoardingListing:** id, host_id, type (hotel | home_sitter), price_per_night, features_json (no_other_pets, garden, cam_24_7), rating
- **BoardingBooking:** id, listing_id, pet_id, start_date, end_date, include_pet_taxi (bool), status, daily_logs_json
- **CommunityAd:** id, user_id, category (blood | lost | adoption | food_support), description, location

## 4. API Endpoints (MVP Scope)
- `POST /api/emergency/trigger` → Returns nearest open vet + dispatches nearest pet taxi.
- `GET  /api/boarding/listings` → Filter by type, date, no_other_pets, location.
- `POST /api/boarding/book` → Creates reservation (+ auto triggers TaxiRide if include_pet_taxi=True).
- `GET  /api/vet/questions` → Lists Q&A with verified vet badges on top.
- `WS   /ws/taxi/{ride_id}` → Real-time GPS coordinates stream.

## 5. Run
```bash
docker compose up --build
```
Web: http://localhost:3000 · API: http://localhost:8000/docs
