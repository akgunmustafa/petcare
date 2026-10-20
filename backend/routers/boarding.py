import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from db import get_session
from geo import haversine_km, taxi_price
from models import (
    BoardingBookIn,
    BoardingBooking,
    BoardingListing,
    Pet,
    TaxiRide,
    User,
)

router = APIRouter(prefix="/api/boarding", tags=["boarding"])


@router.get("/listings")
def listings(
    type: Optional[str] = None,
    no_other_pets: Optional[bool] = None,
    lat: Optional[float] = Query(default=None),
    lng: Optional[float] = Query(default=None),
    session: Session = Depends(get_session),
):
    rows = session.exec(select(BoardingListing)).all()
    out = []
    for listing in rows:
        if type and listing.type != type:
            continue
        features = json.loads(listing.features_json or "{}")
        if no_other_pets is True and not features.get("no_other_pets"):
            continue
        host = session.get(User, listing.host_id)
        item = {
            **listing.model_dump(),
            "features": features,
            "host_name": host.name if host else None,
            "host_verified": bool(host and host.is_verified),
        }
        if lat is not None and lng is not None:
            item["distance_km"] = round(haversine_km(lat, lng, listing.lat, listing.lng), 2)
        out.append(item)
    if lat is not None and lng is not None:
        out.sort(key=lambda x: x.get("distance_km", 999))
    else:
        out.sort(key=lambda x: -x["rating"])
    return out


@router.post("/book")
def book(payload: BoardingBookIn, session: Session = Depends(get_session)):
    listing = session.get(BoardingListing, payload.listing_id)
    pet = session.get(Pet, payload.pet_id)
    if not listing or not pet:
        raise HTTPException(404, "Listing or pet not found")
    if payload.end_date < payload.start_date:
        raise HTTPException(400, "Invalid dates")

    nights = (payload.end_date - payload.start_date).days or 1
    ride = None
    if payload.include_pet_taxi:
        owner = session.get(User, pet.owner_id)
        km = haversine_km(owner.lat, owner.lng, listing.lat, listing.lng)
        drivers = session.exec(select(User).where(User.role == "driver")).all()
        driver = min(drivers, key=lambda d: haversine_km(owner.lat, owner.lng, d.lat, d.lng)) if drivers else None
        ride = TaxiRide(
            pet_id=pet.id,
            driver_id=driver.id if driver else None,
            pickup_lat=owner.lat,
            pickup_lng=owner.lng,
            dropoff_lat=listing.lat,
            dropoff_lng=listing.lng,
            status="dispatched",
            price=taxi_price(km) * 2,
            driver_lat=driver.lat if driver else owner.lat,
            driver_lng=driver.lng if driver else owner.lng,
        )
        session.add(ride)
        session.commit()
        session.refresh(ride)

    booking = BoardingBooking(
        listing_id=listing.id,
        pet_id=pet.id,
        start_date=payload.start_date,
        end_date=payload.end_date,
        include_pet_taxi=payload.include_pet_taxi,
        status="confirmed",
        taxi_ride_id=ride.id if ride else None,
    )
    session.add(booking)
    session.commit()
    session.refresh(booking)
    return {
        **booking.model_dump(),
        "listing_name": listing.name,
        "nights": nights,
        "stay_total": listing.price_per_night * nights,
        "taxi_ride_id": ride.id if ride else None,
        "taxi_price": ride.price if ride else 0,
        "escrow": True,
    }
