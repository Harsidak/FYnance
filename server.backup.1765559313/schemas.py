from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime, date

# --- User ---
class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: Optional[Any]
    current_streak: int
    total_xp: int
    hourly_wage: Optional[float] = 0.0

    class Config:
        from_attributes = True

# --- Spending ---
class SpendingBase(BaseModel):
    amount: float
    category: str
    description: Optional[str] = None
    date: Optional[Any] = None

class SpendingCreate(SpendingBase):
    pass

class Spending(BaseModel):
    id: int
    amount: float
    category: str
    description: Optional[str] = None
    date: Optional[Any] = None
    user_id: int
    created_at: Optional[Any]

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True

# --- Mood ---
class MoodBase(BaseModel):
    score: int
    note: Optional[str] = None
    date: Optional[Any] = None

class MoodCreate(MoodBase):
    pass

class Mood(MoodBase):
    id: int
    user_id: int
    created_at: Optional[Any]
    date: Optional[Any]

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True

# --- Goal ---
class GoalBase(BaseModel):
    name: str
    target_amount: float
    current_amount: Optional[float] = 0.0
    deadline: Optional[Any] = None

class GoalCreate(GoalBase):
    pass

class Goal(GoalBase):
    id: int
    user_id: int
    created_at: Optional[Any]
    deadline: Optional[Any]

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True

# --- Auth ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# --- Subscription ---
class SubscriptionBase(BaseModel):
    name: str
    cost: float
    billing_cycle: str
    next_due_date: Optional[Any] = None

class SubscriptionCreate(SubscriptionBase):
    pass

class Subscription(SubscriptionBase):
    id: int
    user_id: int
    created_at: Optional[Any]

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True
