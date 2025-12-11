from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Mood, User
from schemas import Mood as MoodSchema, MoodCreate
from .dependencies import get_current_user

router = APIRouter(
    prefix="/mood",
    tags=["mood"],
)

@router.post("", response_model=MoodSchema)
def create_mood(mood: MoodCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    data = mood.model_dump()
    data = {k: v for k, v in data.items() if v is not None}
    
    db_mood = Mood(**data, user_id=current_user.id)
    db.add(db_mood)
    db.commit()
    db.refresh(db_mood)
    
    # Update XP logic (Example: 5 XP per entry)
    current_user.total_xp += 5
    db.commit()
    
    return db_mood

@router.get("", response_model=List[MoodSchema])
def read_moods(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    moods = db.query(Mood).filter(Mood.user_id == current_user.id).order_by(Mood.date.desc()).offset(skip).limit(limit).all()
    return moods
