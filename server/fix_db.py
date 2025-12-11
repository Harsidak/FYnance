import sqlite3

def fix_db():
    conn = sqlite3.connect('fynance.db')
    cursor = conn.cursor()
    
    # Check if hourly_wage exists
    try:
        cursor.execute("SELECT hourly_wage FROM users LIMIT 1")
        print("hourly_wage column already exists.")
    except sqlite3.OperationalError:
        print("hourly_wage column missing. Adding it...")
        # Check if users table exists first (sanity check)
        try:
           cursor.execute("SELECT 1 FROM users LIMIT 1")
           cursor.execute("ALTER TABLE users ADD COLUMN hourly_wage FLOAT DEFAULT 0.0")
           conn.commit()
           print("Added hourly_wage column.")
        except sqlite3.OperationalError:
           print("Table 'users' does not exist! Something is wrong.")

    # Check subscriptions table
    try:
        cursor.execute("SELECT 1 FROM subscriptions LIMIT 1")
        print("subscriptions table exists.")
    except sqlite3.OperationalError:
        print("subscriptions table MISSING!")

    conn.close()

if __name__ == "__main__":
    fix_db()
