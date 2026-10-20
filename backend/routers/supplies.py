from typing import Optional

from fastapi import APIRouter, Depends
from sqlmodel import Session, col, select

from db import get_session
from models import CommunityAd, User

router = APIRouter(prefix="/api/supplies", tags=["supplies"])


@router.get("/ads")
def list_ads(category: Optional[str] = None, session: Session = Depends(get_session)):
    q = select(CommunityAd)
    if category:
        q = q.where(CommunityAd.category == category)
    ads = session.exec(q.order_by(col(CommunityAd.id).desc())).all()
    out = []
    for ad in ads:
        user = session.get(User, ad.user_id)
        out.append(
            {
                **ad.model_dump(),
                "user_name": user.name if user else None,
                "user_verified": bool(user and user.is_verified),
            }
        )
    return out
