from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def get_password_hash(password):
    return pwd_context.hash(password)

SQLALCHEMY_DATABASE_URL = "sqlite:///./fynance.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

username = "testu"
user = db.query(User).filter(User.username == username).first()
if user:
    user.hashed_password = get_password_hash("password123")
    db.commit()
    print(f"Password for {username} reset to 'password123'")
else:
    print(f"User {username} not found")
