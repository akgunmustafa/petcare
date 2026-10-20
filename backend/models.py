from typing import Optional
from sqlmodel import SQLModel, Field

class Pet(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    species: str  # "Kedi" | "Köpek"
    breed: str
    age: int
    weight_kg: float
    vaccines: str  # Örn: "Kuduz (Tam), Karma (Tam), İç-Dış Parazit (Güncel)"
    medical_notes: str

class VetQuestion(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    pet_name: str
    question: str
    vet_name: Optional[str] = None
    vet_answer: Optional[str] = None
    is_urgent: bool = False

class TaxiRide(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    pet_id: int
    pickup: str
    dropoff: str
    distance_km: float
    price: float
    status: str = "Araç Yolda"  # "Araç Yolda" | "Tamamlandı" | "Planlandı"

class BoardingListing(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    host_type: str  # "Kurumsal Otel" | "Bireysel Bakıcı"
    district: str
    price_per_night: float
    rating: float
    no_other_pets: bool = False
    has_garden: bool = False
    cam_24_7: bool = False
    verified: bool = True

class BoardingBooking(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    listing_id: int
    pet_id: int
    nights: int
    include_pet_taxi: bool = False
    total_price: float
    status: str = "Onaylandı (Güvenli Havuzda)"

class CommunityItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    category: str  # "Acil Kan" | "Sahiplendirme" | "İhtiyaç/Mama"
    title: str
    location: str
    contact: str