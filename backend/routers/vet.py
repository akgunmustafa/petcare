from fastapi import APIRouter, Depends
from sqlmodel import Session, col, select

from db import get_session
from models import Pet, User, VetQuestion, VetQuestionIn

router = APIRouter(prefix="/api/vet", tags=["vet"])


@router.get("/questions")
def list_questions(session: Session = Depends(get_session)):
    questions = session.exec(select(VetQuestion).order_by(col(VetQuestion.id).desc())).all()
    out = []
    for q in questions:
        pet = session.get(Pet, q.pet_id)
        vet = session.get(User, q.vet_id) if q.vet_id else None
        out.append(
            {
                "id": q.id,
                "title": q.title,
                "media_url": q.media_url,
                "vet_answer": q.vet_answer,
                "is_resolved": q.is_resolved,
                "pet_name": pet.name if pet else None,
                "vet_name": vet.name if vet else None,
                "vet_verified": bool(vet and vet.is_verified),
            }
        )
    out.sort(key=lambda x: (not x["vet_verified"], -x["id"]))
    return out


@router.post("/questions")
def create_question(payload: VetQuestionIn, session: Session = Depends(get_session)):
    q = VetQuestion(
        pet_id=payload.pet_id,
        title=payload.title,
        media_url=payload.media_url,
    )
    session.add(q)
    session.commit()
    session.refresh(q)
    return q


@router.get("/clinics")
def list_clinics(session: Session = Depends(get_session)):
    return session.exec(select(User).where(User.role == "vet")).all()
