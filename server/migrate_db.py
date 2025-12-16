import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'fynance.db')

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("Checking 'users' table schema...")
    
    # Get existing columns
    cursor.execute("PRAGMA table_info(users)")
    columns = [info[1] for info in cursor.fetchall()]
    
    new_columns = {
        "primary_income": "FLOAT DEFAULT 0.0",
        "secondary_income": "FLOAT DEFAULT 0.0",
        "income_stability": "VARCHAR DEFAULT 'fixed'",
        "emergency_fund": "FLOAT DEFAULT 0.0",
        "investments": "FLOAT DEFAULT 0.0"
    }
    
    for col, definition in new_columns.items():
        if col not in columns:
            print(f"Adding missing column: {col}")
            try:
                cursor.execute(f"ALTER TABLE users ADD COLUMN {col} {definition}")
                print(f"  - Added {col}")
            except Exception as e:
                print(f"  - Failed to add {col}: {e}")
        else:
            print(f"Column '{col}' already exists.")

    conn.commit()
    conn.close()
    print("Migration check complete.")

if __name__ == "__main__":
    migrate()
