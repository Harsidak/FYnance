import os
import subprocess
import sys

def run_server():
    # Paths
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    SERVER_DIR = os.path.join(BASE_DIR, "server")
    
    print("� Starting Unified Server (FastAPI + Static)...")
    
    # Run Server
    try:
        if sys.platform == "win32":
            subprocess.run(["python", "main.py"], cwd=SERVER_DIR, shell=True)
        else:
            subprocess.run(["python3", "main.py"], cwd=SERVER_DIR)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user.")

if __name__ == "__main__":
    run_server()
