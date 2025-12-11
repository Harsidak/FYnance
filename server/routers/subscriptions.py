from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Subscription, User
from schemas import Subscription as SubscriptionSchema, SubscriptionCreate
from .dependencies import get_current_user

router = APIRouter(
    prefix="/subscriptions",
    tags=["subscriptions"],
)

@router.post("", response_model=SubscriptionSchema)
def create_subscription(sub: SubscriptionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_sub = Subscription(**sub.model_dump(), user_id=current_user.id)
    db.add(db_sub)
    db.commit()
    db.refresh(db_sub)
    return db_sub

@router.get("", response_model=List[SubscriptionSchema])
def read_subscriptions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Subscription).filter(Subscription.user_id == current_user.id).all()

@router.delete("/{sub_id}")
def delete_subscription(sub_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sub = db.query(Subscription).filter(Subscription.id == sub_id, Subscription.user_id == current_user.id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    db.delete(sub)
    db.commit()
    return {"message": "Subscription deleted"}
