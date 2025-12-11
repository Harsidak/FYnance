
from pydantic import ValidationError
from datetime import date
import sys
import os

# Add server to path
sys.path.append(os.path.join(os.getcwd(), 'server'))

try:
    from schemas import SpendingCreate
    print("Schema imported.")
    
    # Payload simulating frontend
    payload = {
        "amount": 25.0,
        "category": "Food",
        "description": "Lunch",
        "date": "2024-12-11"
    }
    
    print(f"Testing payload: {payload}")
    obj = SpendingCreate(**payload)
    print("Validation Successful!")
    print(obj)

except ImportError:
    print("Could not import schema.")
except ValidationError as e:
    with open("schema_error.txt", "w") as f:
        f.write(e.json())
    print("Validation Failed. Check schema_error.txt")
except Exception as e:
    print(f"Error: {e}")
