from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import User
from auth import get_password_hash, verify_password

SQLALCHEMY_DATABASE_URL = "sqlite:///./fynance.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

# 1. Create or Get 'admin'
username = "admin"
password = "password123"

print(f"--- Debugging Auth for {username} ---")

user = db.query(User).filter(User.username == username).first()
if not user:
    print("User not found. Creating...")
    hashed = get_password_hash(password)
    user = User(username=username, email="admin@test.com", hashed_password=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)
    print(f"User created: ID {user.id}")
else:
    print(f"User found: ID {user.id}")
    # Force reset to ensure we know the password
    user.hashed_password = get_password_hash(password)
    db.commit()
    print("Password forced reset to 'password123'")

# 2. Verify
print("Verifying password...")
if verify_password(password, user.hashed_password):
    print("✅ SUCCESS: verify_password returned True.")
else:
    print("❌ FAILURE: verify_password returned False.")
    
# 3. Double Check Hash
print(f"Stored Hash: {user.hashed_password}")
