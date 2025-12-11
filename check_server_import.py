
import sys
import os

# Emulate running from server/main.py directory behavior or just adding paths
sys.path.append(os.path.join(os.getcwd(), 'server'))

try:
    from routers import spending, auth, users
    print("Imports successful!")
except ImportError as e:
    print(f"Import failed: {e}")
    import traceback
    traceback.print_exc()
