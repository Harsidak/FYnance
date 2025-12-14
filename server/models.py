from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from datetime import datetime, date
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.now)
    current_streak = Column(Integer, default=0)
    last_login_date = Column(Date, nullable=True)
    total_xp = Column(Integer, default=0)
    hourly_wage = Column(Float, default=0.0)

    spendings = relationship("Spending", back_populates="user")
    moods = relationship("Mood", back_populates="user")
    goals = relationship("Goal", back_populates="user")
    subscriptions = relationship("Subscription", back_populates="user")

class Spending(Base):
    __tablename__ = "spending"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float)
    category = Column(String)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    
    # We store date specifically for easy daily tracking independent of exact timestamp if needed
    date = Column(Date, default=date.today)

    user = relationship("User", back_populates="spendings")

class Mood(Base):
    __tablename__ = "mood"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    score = Column(Integer) # 1-10
    note = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    date = Column(Date, default=date.today)

    user = relationship("User", back_populates="moods")

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    target_amount = Column(Float)
    current_amount = Column(Float, default=0.0)
    deadline = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    user = relationship("User", back_populates="goals")

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    cost = Column(Float)
    billing_cycle = Column(String) # "Monthly", "Yearly"
    next_due_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    user = relationship("User", back_populates="subscriptions")
