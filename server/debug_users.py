from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SQLALCHEMY_DATABASE_URL = "sqlite:///./fynance.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

users = db.query(User).all()
print(f"Total Users: {len(users)}")
for u in users:
    print(f"ID: {u.id}, Username: '{u.username}', Email: '{u.email}'")

# Reset first user
if users:
    u = users[0]
    u.hashed_password = pwd_context.hash("password123")
    db.commit()
    print(f"RESET SUCCESS: Password for user '{u.username}' (ID: {u.id}) set to 'password123'")
