from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import User as UserSchema, UserUpdate
from .dependencies import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

@router.get("/me", response_model=UserSchema)
def read_user_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me/profile", response_model=UserSchema)
def update_profile(user_update: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if user_update.monthly_income is not None:
        current_user.monthly_income = user_update.monthly_income
    if user_update.savings_balance is not None:
        current_user.savings_balance = user_update.savings_balance
    if user_update.financial_context is not None:
        current_user.financial_context = user_update.financial_context
    if user_update.hourly_wage is not None:
        current_user.hourly_wage = user_update.hourly_wage
        
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/me/wage")
def update_wage(wage: float, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    current_user.hourly_wage = wage
    db.commit()
    return {"message": "Hourly wage updated", "hourly_wage": wage}
