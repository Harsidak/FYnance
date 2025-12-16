import sqlite3

def migrate():
    conn = sqlite3.connect('server/fynance.db')
    cursor = conn.cursor()
    
    # Columns to add
    columns = [
        ("primary_income", "FLOAT DEFAULT 0.0"),
        ("secondary_income", "FLOAT DEFAULT 0.0"),
        ("income_stability", "VARCHAR DEFAULT 'fixed'"),
        ("emergency_fund", "FLOAT DEFAULT 0.0"),
        ("investments", "FLOAT DEFAULT 0.0"),
        ("savings_balance", "FLOAT DEFAULT 0.0"),
        ("financial_context", "VARCHAR")
    ]
    
    for col, dtype in columns:
        try:
            print(f"Adding column {col}...")
            cursor.execute(f"ALTER TABLE users ADD COLUMN {col} {dtype}")
            print(f"Added {col}.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print(f"Column {col} already exists. Skipping.")
            else:
                print(f"Error adding {col}: {e}")
                
    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
