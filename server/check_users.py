from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import User

SQLALCHEMY_DATABASE_URL = "sqlite:///./fynance.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

users = db.query(User).all()
print(f"Total Users: {len(users)}")
for u in users:
    print(f"ID: {u.id}, Username: {u.username}, Email: {u.email}")
