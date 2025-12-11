from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, users, spending, mood, goals, analytics, subscriptions, ai

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FYNANCE API")

# CORS
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(spending.router)
app.include_router(mood.router)
app.include_router(goals.router)
app.include_router(analytics.router)
app.include_router(subscriptions.router)
app.include_router(ai.router)

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Mount Static Files (Frontend Build)
static_dir = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir)

app.mount("/_next", StaticFiles(directory=os.path.join(static_dir, "_next")), name="next-assets")
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Catch-all for SPA (must be last)
@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    # API routes are already handled above by `include_router` precedence
    # If file exists in static, serve it (e.g. favicon.ico)
    file_path = os.path.join(static_dir, full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
        
    # Otherwise serve index.html for React Router
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
        
    return {"error": "Frontend not built. Run build.py"}

if __name__ == "__main__":
    import uvicorn
    print("\n✅ Server running! Open this link in your browser:")
    print("👉 http://localhost:8000\n")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
