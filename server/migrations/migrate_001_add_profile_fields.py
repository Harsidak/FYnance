
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "fynance.db")

def migrate():
    print(f"Migrating database at {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check if columns exist
        cursor.execute("PRAGMA table_info(users)")
        columns = [info[1] for info in cursor.fetchall()]
        
        if "monthly_income" not in columns:
            print("Adding monthly_income column...")
            cursor.execute("ALTER TABLE users ADD COLUMN monthly_income FLOAT DEFAULT 0.0")
            
        if "savings_balance" not in columns:
            print("Adding savings_balance column...")
            cursor.execute("ALTER TABLE users ADD COLUMN savings_balance FLOAT DEFAULT 0.0")
            
        if "financial_context" not in columns:
            print("Adding financial_context column...")
            cursor.execute("ALTER TABLE users ADD COLUMN financial_context TEXT")
            
        conn.commit()
        print("Migration successful!")
    except Exception as e:
        print(f"Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
