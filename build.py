import os
import subprocess
import sys
import time

def run_server():
    # Paths
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    SERVER_DIR = os.path.join(BASE_DIR, "server")
    AI_DIR = os.path.join(BASE_DIR, "ai_engine")
    
    print("Starting Unified Server (FastAPI + Static)...")
    
    ai_process = None
    server_process = None

    try:
        # Start AI Engine (Port 8001)
        print("Starting AI Engine (Port 8001)...")
        ai_process = subprocess.Popen(["python", "main.py"], cwd=AI_DIR, shell=True)

        # Start Main Server (Port 8000) - updated to use env vars if configured
        print("Starting Main Server (Port 8000)...")
        server_process = subprocess.Popen(["python", "main.py"], cwd=SERVER_DIR, shell=True)
        
        # Keep alive loop
        while True:
            time.sleep(1)
            if ai_process.poll() is not None:
                print("AI Engine stopped unexpectedly.")
                break
            if server_process.poll() is not None:
                print("Main Server stopped unexpectedly.")
                break

    except KeyboardInterrupt:
        print("\nStopping servers...")
    finally:
        if server_process:
            print("Terminating Main Server...")
            subprocess.call(["taskkill", "/F", "/T", "/PID", str(server_process.pid)])
        if ai_process:
            print("Terminating AI Engine...")
            subprocess.call(["taskkill", "/F", "/T", "/PID", str(ai_process.pid)])
        print("Servers stopped.")

if __name__ == "__main__":
    run_server()
