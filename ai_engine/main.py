from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

from pydantic import BaseModel

app = FastAPI(
    title="FYNANCE AI Engine",
    description="Microservice for Behaviour Prediction, Intervention Agents, and RAG.",
    version="1.0.0"
)

# CORS Setup
origins = ["*"]  # In production, restrict this to the main backend and frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "active", "service": "FYNANCE AI Engine"}

from modules.prediction import router as prediction_router
from modules.intervention import router as intervention_router
from modules.rag import router as rag_router
from modules.simulation import router as simulation_router

app.include_router(prediction_router, tags=["Prediction"])
app.include_router(intervention_router, tags=["Intervention"])
app.include_router(rag_router, tags=["RAG"])
app.include_router(simulation_router, tags=["Simulation"])

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
