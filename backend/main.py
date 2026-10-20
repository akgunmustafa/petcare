from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Session, create_engine, select
from contextlib import asynccontextmanager
from models import (
    Pet, VetQuestion, TaxiRide,
    BoardingListing, BoardingBooking, CommunityItem
)

sqlite_url = "sqlite:///./petcare.db"
engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

def get_session():
    with Session(engine) as session:
        yield session

@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    with Session(engine) as s:
        if not s.exec(select(Pet)).first():
            # 1. Örnek Evcil Hayvan (Dijital Karne)
            s.add(Pet(
                name="Tarçın", species="Köpek", breed="Golden Retriever",
                age=3, weight_kg=28.5,
                vaccines="Kuduz: Tam | Karma: Tam | Parazit: Güncel",
                medical_notes="Tavuk alerjisi var. Uysal."
            ))
            # 2. Örnek Veteriner Soru-Cevap
            s.add_all([
                VetQuestion(
                    pet_name="Tarçın",
                    question="Sol kulağını sürekli kaşıyor ve hafif kızarıklık var, ne yapmalıyım?",
                    vet_name="Uzm. Vet. Hekim Selin Demir",
                    vet_answer="Kulak uyuzu veya enfeksiyon başlangıcı olabilir. Yakalık takıp kaşımasını engelleyin, yarın kliniğe bekleriz.",
                    is_urgent=False
                ),
                VetQuestion(
                    pet_name="Mia (Kedi)",
                    question="Sabahtan beri 3 kez kustu ve su içmiyor.",
                    vet_name="Vet. Hekim Burak Kaya",
                    vet_answer="Su kaybı (dehidrasyon) riski yüksek. Vakit kaybetmeden nöbetçi kliniğe başvurmalısınız.",
                    is_urgent=True
                )
            ])
            # 3. Örnek Konaklama (Pet Otel & Bireysel Bakıcı)
            s.add_all([
                BoardingListing(
                    title="Zeynep H. - Ev Ortamında Kedi & Köpek Bakımı",
                    host_type="Bireysel Bakıcı", district="Kadıköy",
                    price_per_night=650, rating=4.9,
                    no_other_pets=True, has_garden=False, cam_24_7=True
                ),
                BoardingListing(
                    title="PatiPalace VIP Resort & Pet Otel",
                    host_type="Kurumsal Otel", district="Sarıyer",
                    price_per_night=1100, rating=4.8,
                    no_other_pets=False, has_garden=True, cam_24_7=True
                ),
                BoardingListing(
                    title="Emre B. - Bahçeli Müstakil Evde Bakıcı",
                    host_type="Bireysel Bakıcı", district="Çankaya",
                    price_per_night=750, rating=4.7,
                    no_other_pets=True, has_garden=True, cam_24_7=False
                )
            ])
            # 4. Örnek Dayanışma & İhtiyaç İlanları
            s.add_all([
                CommunityItem(
                    category="Acil Kan",
                    title="Ankara Dikmen - 25kg üstü sağlıklı köpekten acil kan aranıyor!",
                    location="Çankaya / Ankara", contact="0532 000 11 22"
                ),
                CommunityItem(
                    category="İhtiyaç/Mama",
                    title="Elizabeth Yakalık & Antiseptik Solüsyon Seti (Kurye ile 45 dk)",
                    location="Tüm Şehir", contact="450 TL - Hemen Sipariş"
                ),
                CommunityItem(
                    category="Sahiplendirme",
                    title="3 Aylık Tekir Yavru - İlk aşıları yapıldı, sıcak yuva arıyor",
                    location="Kadıköy / İstanbul", contact="0544 111 22 33"
                )
            ])
            s.commit()
    yield

app = FastAPI(title="PetCare HCI API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/dashboard")
def get_dashboard_data(s: Session = Depends(get_session)):
    return {
        "pets": s.exec(select(Pet)).all(),
        "questions": s.exec(select(VetQuestion).order_by(VetQuestion.id.desc())).all(),
        "rides": s.exec(select(TaxiRide).order_by(TaxiRide.id.desc())).all(),
        "listings": s.exec(select(BoardingListing)).all(),
        "bookings": s.exec(select(BoardingBooking).order_by(BoardingBooking.id.desc())).all(),
        "community": s.exec(select(CommunityItem)).all(),
    }

@app.post("/api/emergency")
def trigger_emergency(pet_id: int = 1, s: Session = Depends(get_session)):
    ride = TaxiRide(
        pet_id=pet_id,
        pickup="Mevcut Konum (GPS)",
        dropoff="7/24 Acil Nöbetçi Veteriner Kliniği (2.1 km)",
        distance_km=2.1,
        price=250.0,
        status="🚨 ACİL PET AMBULANS YOLDA (4 dk)"
    )
    s.add(ride)
    s.commit()
    s.refresh(ride)
    return {
        "message": "Nöbetçi klinik bilgilendirildi. Pet Ambulans yola çıktı!",
        "clinic": "PatiLife 7/24 Acil Veteriner Polikliniği",
        "eta_minutes": 4,
        "ride": ride
    }

@app.post("/api/vet/questions")
def ask_vet(q: VetQuestion, s: Session = Depends(get_session)):
    q.vet_name = "Nöbetçi Uzman (Yanıt Bekleniyor...)"
    q.vet_answer = "Sorunuz uzman veteriner havuzuna iletildi. Ortalama yanıt süresi: 10 dk."
    s.add(q)
    s.commit()
    s.refresh(q)
    return q

@app.post("/api/taxi/call")
def call_taxi(ride: TaxiRide, s: Session = Depends(get_session)):
    ride.price = round(120 + (ride.distance_km * 35), 2)
    s.add(ride)
    s.commit()
    s.refresh(ride)
    return ride

@app.post("/api/boarding/book")
def book_boarding(booking: BoardingBooking, s: Session = Depends(get_session)):
    listing = s.get(BoardingListing, booking.listing_id)
    if not listing:
        raise HTTPException(404, "İlan bulunamadı")

    taxi_fee = 350.0 if booking.include_pet_taxi else 0.0
    booking.total_price = (listing.price_per_night * booking.nights) + taxi_fee
    s.add(booking)

    # Çapraz Modül Sinerjisi: Konaklamaya Pet Taksi eklendiyse otomatik nakil kaydı oluştur
    if booking.include_pet_taxi:
        auto_ride = TaxiRide(
            pet_id=booking.pet_id,
            pickup="Ev Adresim",
            dropoff=f"{listing.title} ({listing.district})",
            distance_km=8.5,
            price=taxi_fee,
            status="Konaklama Transferi Planlandı"
        )
        s.add(auto_ride)

    s.commit()
    s.refresh(booking)
    return booking