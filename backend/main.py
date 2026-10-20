from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from db import engine, get_session, init_db
from models import Pet, User
from routers import boarding, emergency, supplies, taxi, vet
from seed import seed_if_empty

app = FastAPI(title="PetCare API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(emergency.router)
app.include_router(vet.router)
app.include_router(taxi.router)
app.include_router(taxi.ws_router)
app.include_router(boarding.router)
app.include_router(supplies.router)


@app.on_event("startup")
def on_startup():
    init_db()
    with Session(engine) as session:
        seed_if_empty(session)


@app.get("/api/health")
def health():
    return {"ok": True}


@app.get("/api/profile")
def profile(session: Session = Depends(get_session)):
    owner = session.exec(select(User).where(User.role == "owner")).first()
    pets = session.exec(select(Pet).where(Pet.owner_id == owner.id)).all() if owner else []
    return {"owner": owner, "pets": pets}
