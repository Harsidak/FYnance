from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from server.database import get_db
from server.models import ImpulseItem, User, Spending
from server.schemas import ImpulseItem as ImpulseSchema, ImpulseCreate
from .dependencies import get_current_user

router = APIRouter(
    prefix="/impulse",
    tags=["impulse"],
)

@router.post("/", response_model=ImpulseSchema)
def create_impulse_item(item: ImpulseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Unlock in 24 hours
    unlock_time = datetime.now() + timedelta(hours=24)
    
    db_item = ImpulseItem(
        **item.model_dump(),
        user_id=current_user.id,
        status="LOCKED",
        unlock_date=unlock_time
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/", response_model=List[ImpulseSchema])
def read_impulse_items(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Auto-update status if time passed
    items = db.query(ImpulseItem).filter(ImpulseItem.user_id == current_user.id).all()
    now = datetime.now()
    updated = False
    
    for item in items:
        if item.status == "LOCKED" and item.unlock_date and now >= item.unlock_date:
            item.status = "UNLOCKED"
            updated = True
    
    if updated:
        db.commit()
        
    return items

@router.post("/{item_id}/buy")
def buy_impulse_item(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(ImpulseItem).filter(ImpulseItem.id == item_id, ImpulseItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if item.status != "UNLOCKED":
        raise HTTPException(status_code=400, detail="Item is not unlocked yet")
        
    # Move to spending
    db_spending = Spending(
        amount=item.cost,
        category="Impulse Buy",
        description=f"Bought from Impulse Jail: {item.name}",
        user_id=current_user.id,
        date=datetime.now().date()
    )
    db.add(db_spending)
    
    item.status = "BOUGHT"
    db.commit()
    return {"message": "Item bought and moved to spending"}

@router.post("/{item_id}/resist")
def resist_impulse_item(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(ImpulseItem).filter(ImpulseItem.id == item_id, ImpulseItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    if item.status != "UNLOCKED":
        raise HTTPException(status_code=400, detail="Item is not unlocked yet")
        
    item.status = "ARCHIVED"
    
    # Reward XP
    current_user.total_xp += 50
    db.commit()
    return {"message": "Item resisted. +50 XP!"}
