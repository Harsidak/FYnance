from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from server.database import get_db
from server.models import User
from server.schemas import User as UserSchema
from .dependencies import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

@router.get("/me", response_model=UserSchema)
def read_user_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me/wage")
def update_wage(wage: float, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    current_user.hourly_wage = wage
    db.commit()
    return {"message": "Hourly wage updated", "hourly_wage": wage}
