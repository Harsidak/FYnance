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
    if user_update.primary_income is not None:
        current_user.primary_income = user_update.primary_income
    if user_update.secondary_income is not None:
        current_user.secondary_income = user_update.secondary_income
    if user_update.income_stability is not None:
        current_user.income_stability = user_update.income_stability
    if user_update.emergency_fund is not None:
        current_user.emergency_fund = user_update.emergency_fund
    if user_update.investments is not None:
        current_user.investments = user_update.investments
    if user_update.savings_balance is not None:
        current_user.savings_balance = user_update.savings_balance
    if user_update.financial_context is not None:
        current_user.financial_context = user_update.financial_context
        
    db.commit()
    db.refresh(current_user)
    return current_user

# @router.put("/me/wage") - DEPRECATED
# def update_wage(...)
