import asyncio

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlmodel import Session, col, select

from db import engine, get_session
from geo import haversine_km, taxi_price
from models import TaxiRequestIn, TaxiRide, User

router = APIRouter(prefix="/api/taxi", tags=["taxi"])
ws_router = APIRouter()


def _nearest_driver(session: Session, lat: float, lng: float) -> User | None:
    drivers = session.exec(select(User).where(User.role == "driver")).all()
    if not drivers:
        return None
    return min(drivers, key=lambda d: haversine_km(lat, lng, d.lat, d.lng))


@router.post("/request")
def request_ride(payload: TaxiRequestIn, session: Session = Depends(get_session)):
    km = haversine_km(
        payload.pickup_lat, payload.pickup_lng, payload.dropoff_lat, payload.dropoff_lng
    )
    driver = _nearest_driver(session, payload.pickup_lat, payload.pickup_lng)
    ride = TaxiRide(
        pet_id=payload.pet_id,
        driver_id=driver.id if driver else None,
        pickup_lat=payload.pickup_lat,
        pickup_lng=payload.pickup_lng,
        dropoff_lat=payload.dropoff_lat,
        dropoff_lng=payload.dropoff_lng,
        status="dispatched",
        price=taxi_price(km),
        driver_lat=driver.lat if driver else payload.pickup_lat,
        driver_lng=driver.lng if driver else payload.pickup_lng,
    )
    session.add(ride)
    session.commit()
    session.refresh(ride)
    return {
        **ride.model_dump(),
        "driver_name": driver.name if driver else None,
        "distance_km": round(km, 2),
    }


@router.get("/rides")
def list_rides(session: Session = Depends(get_session)):
    return session.exec(select(TaxiRide).order_by(col(TaxiRide.id).desc())).all()


@router.get("/rides/{ride_id}")
def get_ride(ride_id: int, session: Session = Depends(get_session)):
    ride = session.get(TaxiRide, ride_id)
    if not ride:
        raise HTTPException(404, "Ride not found")
    driver = session.get(User, ride.driver_id) if ride.driver_id else None
    return {**ride.model_dump(), "driver_name": driver.name if driver else None}


@ws_router.websocket("/ws/taxi/{ride_id}")
async def taxi_gps(websocket: WebSocket, ride_id: int):
    await websocket.accept()
    try:
        with Session(engine) as session:
            ride = session.get(TaxiRide, ride_id)
            if not ride:
                await websocket.send_json({"error": "Ride not found"})
                await websocket.close()
                return
            start_lat = ride.pickup_lat
            start_lng = ride.pickup_lng
            steps = 20
            for i in range(steps + 1):
                t = i / steps
                lat = start_lat + (ride.dropoff_lat - start_lat) * t
                lng = start_lng + (ride.dropoff_lng - start_lng) * t
                status = "en_route" if i < steps else "arrived"
                ride.driver_lat = lat
                ride.driver_lng = lng
                ride.status = status
                session.add(ride)
                session.commit()
                await websocket.send_json(
                    {
                        "ride_id": ride_id,
                        "lat": round(lat, 6),
                        "lng": round(lng, 6),
                        "status": status,
                        "progress": round(t, 2),
                    }
                )
                await asyncio.sleep(1)
    except WebSocketDisconnect:
        return
