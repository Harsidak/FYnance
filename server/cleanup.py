from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from server.database import SessionLocal
from server import models

# delete records older than X days
DELETE_AFTER_DAYS = 30

def cleanup_old_data():
    db: Session = SessionLocal()
    try:
        cutoff = datetime.utcnow() - timedelta(days=DELETE_AFTER_DAYS)

        # Example tables (adjust if needed)
        db.query(models.Spending).filter(models.Spending.created_at < cutoff).delete()
        db.query(models.Mood).filter(models.Mood.created_at < cutoff).delete()
        db.query(models.ChatMessage).filter(models.ChatMessage.created_at < cutoff).delete()

        db.commit()
        print("✅ Old data cleaned")
    except Exception as e:
        db.rollback()
        print("❌ Cleanup failed:", e)
    finally:
        db.close()
