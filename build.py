import os
import shutil
import subprocess
import sys

def build_client():
    print("🚀 Starting Production Build...")
    
    # Paths
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    CLIENT_DIR = os.path.join(BASE_DIR, "client")
    SERVER_STATIC_DIR = os.path.join(BASE_DIR, "server", "static")
    
    # 1. Build Next.js
    print(f"📦 Building Client in {CLIENT_DIR}...")
    try:
        # Check if node_modules exists, install if not
        if not os.path.exists(os.path.join(CLIENT_DIR, "node_modules")):
             print("Installing dependencies...")
             # Windows needs shell=True for npm, or npm.cmd
             subprocess.run(["npm", "install"], cwd=CLIENT_DIR, shell=True, check=True)

        print("Building project...")
        subprocess.run(["npm", "run", "build"], cwd=CLIENT_DIR, shell=True, check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Build Failed: {e}")
        sys.exit(1)
        
    # 2. Clear old static files
    print("🧹 Clearing old static files...")
    if os.path.exists(SERVER_STATIC_DIR):
        shutil.rmtree(SERVER_STATIC_DIR)
    os.makedirs(SERVER_STATIC_DIR)
    
    # 3. Copy new build
    print("📂 Moving build artifacts...")
    client_out = os.path.join(CLIENT_DIR, "out")
    
    # Copy contents of 'out' to 'server/static'
    # 'out' contains index.html, _next, etc.
    if os.path.exists(client_out):
        for item in os.listdir(client_out):
            s = os.path.join(client_out, item)
            d = os.path.join(SERVER_STATIC_DIR, item)
            if os.path.isdir(s):
                shutil.copytree(s, d)
            else:
                shutil.copy2(s, d)
    else:
        print("❌ 'out' directory not found. Did Next.js export fail?")
        sys.exit(1)

    print("✅ Build Complete & Deployed to Server!")
    print("\nStarting Unified Server...")
    
    # 4. Run Server
    SERVER_DIR = os.path.join(BASE_DIR, "server")
    print("🚀 Starting Server...")
    try:
        if sys.platform == "win32":
            subprocess.run(["python", "main.py"], cwd=SERVER_DIR, shell=True)
        else:
            subprocess.run(["python3", "main.py"], cwd=SERVER_DIR)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user.")

if __name__ == "__main__":
    build_client()
