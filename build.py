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
        # Start AI Engine (Port 8001)
        print("Starting AI Engine (Port 8001)...")
        ai_process = subprocess.Popen(["python", "main.py"], cwd=os.path.join(BASE_DIR, "ai_engine"), shell=True)

        # Start Main Server (Port 8000)
        print("Starting Main Server (Port 8000)...")
        server_process = subprocess.Popen(["python", "main.py"], cwd=SERVER_DIR, shell=True)
        
        # Keep alive
        ai_process.wait()
        server_process.wait()
    except KeyboardInterrupt:
        print("\nServer stopped by user.")

if __name__ == "__main__":
    run_server()
