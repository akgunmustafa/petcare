from datetime import date
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel


class UserRole(str, Enum):
    owner = "owner"
    vet = "vet"
    driver = "driver"
    sitter = "sitter"
    hotel_admin = "hotel_admin"


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    phone: str
    role: str
    is_verified: bool = False
    lat: float = 0.0
    lng: float = 0.0
    is_open: bool = True
    clinic_name: Optional[str] = None


class Pet(SQLModel, table=True):
    __tablename__ = "pets"

    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="users.id")
    name: str
    species: str
    breed: str
    weight_kg: float
    vaccines_json: str = "[]"
    medical_notes: str = ""


class VetQuestion(SQLModel, table=True):
    __tablename__ = "vet_questions"

    id: Optional[int] = Field(default=None, primary_key=True)
    pet_id: int = Field(foreign_key="pets.id")
    title: str
    media_url: Optional[str] = None
    vet_answer: Optional[str] = None
    is_resolved: bool = False
    vet_id: Optional[int] = Field(default=None, foreign_key="users.id")


class TaxiRide(SQLModel, table=True):
    __tablename__ = "taxi_rides"

    id: Optional[int] = Field(default=None, primary_key=True)
    pet_id: int = Field(foreign_key="pets.id")
    driver_id: Optional[int] = Field(default=None, foreign_key="users.id")
    pickup_lat: float
    pickup_lng: float
    dropoff_lat: float
    dropoff_lng: float
    status: str = "requested"
    price: float = 0.0
    driver_lat: Optional[float] = None
    driver_lng: Optional[float] = None


class BoardingListing(SQLModel, table=True):
    __tablename__ = "boarding_listings"

    id: Optional[int] = Field(default=None, primary_key=True)
    host_id: int = Field(foreign_key="users.id")
    name: str
    type: str
    price_per_night: float
    features_json: str = "{}"
    rating: float = 0.0
    lat: float = 0.0
    lng: float = 0.0
    neighborhood: str = ""


class BoardingBooking(SQLModel, table=True):
    __tablename__ = "boarding_bookings"

    id: Optional[int] = Field(default=None, primary_key=True)
    listing_id: int = Field(foreign_key="boarding_listings.id")
    pet_id: int = Field(foreign_key="pets.id")
    start_date: date
    end_date: date
    include_pet_taxi: bool = False
    status: str = "confirmed"
    daily_logs_json: str = "[]"
    taxi_ride_id: Optional[int] = Field(default=None, foreign_key="taxi_rides.id")


class CommunityAd(SQLModel, table=True):
    __tablename__ = "community_ads"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    category: str
    title: str
    description: str
    location: str


class EmergencyTriggerIn(SQLModel):
    pet_id: int = 1
    lat: float
    lng: float


class TaxiRequestIn(SQLModel):
    pet_id: int = 1
    pickup_lat: float
    pickup_lng: float
    dropoff_lat: float
    dropoff_lng: float


class BoardingBookIn(SQLModel):
    listing_id: int
    pet_id: int = 1
    start_date: date
    end_date: date
    include_pet_taxi: bool = False


class VetQuestionIn(SQLModel):
    pet_id: int = 1
    title: str
    media_url: Optional[str] = None
