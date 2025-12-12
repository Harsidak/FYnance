from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from server.database import get_db
from server.models import Spending, User
from server.schemas import Spending as SpendingSchema, SpendingCreate
from .dependencies import get_current_user
import httpx

async def trigger_ai_analysis(amount: float, category: str, timestamp: str, user_id: int):
    # Prepare payload matching AI Engine's BehaviourInput
    payload = {
        "user_id": user_id,
        "transactions": [
            {
                "amount": amount,
                "category": category,
                "timestamp": timestamp
            }
        ],
        "mood_logs": [] # Extend later to fetch recent moods
    }
    
    # Fire and forget (or log result)
    async with httpx.AsyncClient() as client:
        try:
            # We don't need to await the response for the user request, 
            # but inside this background task we await the call.
            await client.post("http://localhost:8001/predict/behaviour", json=payload)
        except Exception as e:
            print(f"AI Trigger Failed: {e}")

router = APIRouter(
    prefix="/spending",
    tags=["spending"],
)

@router.post("", response_model=SpendingSchema)
def create_spending(
    spending: SpendingCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    try:
        data = spending.model_dump()
        
        # Explicitly handle date default
        if isinstance(data.get("date"), str):
            from datetime import date
            data["date"] = date.fromisoformat(data["date"])
        elif data.get("date") is None:
            from datetime import date
            data["date"] = date.today()
        
        # Remove any other None values just in case
        data = {k: v for k, v in data.items() if v is not None}
        
        db_spending = Spending(**data, user_id=current_user.id)
        db.add(db_spending)
        db.commit()
        db.refresh(db_spending)
        
        # Update XP logic (Example: 10 XP per entry)
        current_user.total_xp += 10
        db.commit()

        # Trigger AI Analysis in Background
        background_tasks.add_task(trigger_ai_analysis, db_spending.amount, db_spending.category, str(db_spending.date), current_user.id)
        
        return db_spending
    except Exception as e:
        import traceback
        with open("debug_err.txt", "a") as f:
            f.write(f"Error in create_spending: {str(e)}\n")
            f.write(traceback.format_exc())
            f.write("\n")
        raise HTTPException(status_code=500, detail=f"Failed to create spending: {str(e)}")

@router.get("", response_model=List[SpendingSchema])
def read_spending(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        spendings = db.query(Spending).filter(Spending.user_id == current_user.id).order_by(Spending.date.desc()).offset(skip).limit(limit).all()
        return spendings
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch spending: {str(e)}")
