
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker
import sys
import os

# Add server to path
sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), 'server'))

try:
    from server.models import User
    from server.database import Base
except ImportError:
    # Try local import if running from inside server dir
    from models import User
    from database import Base

DATABASE_URL = "sqlite:///server/fynance.db"
# check if db exists
if not os.path.exists("server/fynance.db") and os.path.exists("fynance.db"):
    DATABASE_URL = "sqlite:///fynance.db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
session = SessionLocal()

print(f"Checking DB at: {DATABASE_URL}")

try:
    users = session.query(User).all()
    print(f"Total Users: {len(users)}")
    for user in users:
        print(f"ID: {user.id}, Username: {user.username}, Email: {user.email}")
except Exception as e:
    print(f"Error querying users: {e}")
