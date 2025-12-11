
import sys
import os

# Add server dir to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from routers import users
    print("Import successful")
except Exception as e:
    print(f"Import failed: {e}")
    import traceback
    traceback.print_exc()
