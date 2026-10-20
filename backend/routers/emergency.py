from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from db import get_session
from geo import haversine_km, taxi_price
from models import EmergencyTriggerIn, Pet, TaxiRide, User

router = APIRouter(prefix="/api/emergency", tags=["emergency"])


@router.post("/trigger")
def trigger(payload: EmergencyTriggerIn, session: Session = Depends(get_session)):
    pet = session.get(Pet, payload.pet_id)
    if not pet:
        raise HTTPException(404, "Pet not found")

    vets = session.exec(
        select(User).where(User.role == "vet", User.is_open == True)  # noqa: E712
    ).all()
    if not vets:
        raise HTTPException(404, "No open vet")

    nearest_vet = min(
        vets, key=lambda v: haversine_km(payload.lat, payload.lng, v.lat, v.lng)
    )
    vet_km = haversine_km(payload.lat, payload.lng, nearest_vet.lat, nearest_vet.lng)

    drivers = session.exec(select(User).where(User.role == "driver")).all()
    nearest_driver = min(
        drivers, key=lambda d: haversine_km(payload.lat, payload.lng, d.lat, d.lng)
    ) if drivers else None

    ride = TaxiRide(
        pet_id=pet.id,
        driver_id=nearest_driver.id if nearest_driver else None,
        pickup_lat=payload.lat,
        pickup_lng=payload.lng,
        dropoff_lat=nearest_vet.lat,
        dropoff_lng=nearest_vet.lng,
        status="dispatched",
        price=taxi_price(vet_km),
        driver_lat=nearest_driver.lat if nearest_driver else payload.lat,
        driver_lng=nearest_driver.lng if nearest_driver else payload.lng,
    )
    session.add(ride)
    session.commit()
    session.refresh(ride)

    return {
        "vet": {
            "id": nearest_vet.id,
            "name": nearest_vet.name,
            "clinic_name": nearest_vet.clinic_name,
            "phone": nearest_vet.phone,
            "is_verified": nearest_vet.is_verified,
            "lat": nearest_vet.lat,
            "lng": nearest_vet.lng,
            "distance_km": round(vet_km, 2),
        },
        "taxi": {
            "ride_id": ride.id,
            "status": ride.status,
            "price": ride.price,
            "driver_name": nearest_driver.name if nearest_driver else None,
            "driver_phone": nearest_driver.phone if nearest_driver else None,
        },
        "pet": {"id": pet.id, "name": pet.name, "species": pet.species},
    }
