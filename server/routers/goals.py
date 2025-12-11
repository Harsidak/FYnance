from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Goal, User
from schemas import Goal as GoalSchema, GoalCreate
from .dependencies import get_current_user

router = APIRouter(
    prefix="/goals",
    tags=["goals"],
)

@router.post("", response_model=GoalSchema)
def create_goal(goal: GoalCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    data = goal.model_dump()
    # Only filter if we want defaults. Goal model has 'current_amount' default 0.0 in SQLAlchemy, 
    # but Pydantic schema also has default 0.0, so it's passed.
    # 'deadline' is nullable in DB and Optional in Pydantic. If we pass None, it saves NULL, which is desired if not set.
    # But if we want it to be empty, that's fine.
    # However, just safely filtering None for optional fields where we might rely on DB default is safer practice if we change logical defaults.
    # For now, let's keep Goal as is or strictly for consistent style:
    data = {k: v for k, v in data.items() if v is not None}
    
    db_goal = Goal(**data, user_id=current_user.id)
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@router.get("", response_model=List[GoalSchema])
def read_goals(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).offset(skip).limit(limit).all()
    return goals

@router.put("/{goal_id}", response_model=GoalSchema)
def update_goal(goal_id: int, amount_added: float, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not db_goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    db_goal.current_amount += amount_added
    db.commit()
    db.refresh(db_goal)
    
    # 20 XP for updating a goal
    current_user.total_xp += 20
    db.commit()
    
    return db_goal
