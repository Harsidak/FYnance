from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Any
from pydantic import BaseModel
import httpx

router = APIRouter(
    prefix="/ai",
    tags=["AI Features"]
)

AI_ENGINE_URL = "http://localhost:8001"

# Types matching AI Engine
class Transaction(BaseModel):
    amount: float
    category: str
    timestamp: Optional[Any] = None

class BehaviourInput(BaseModel):
    user_id: int
    transactions: List[Transaction]
    mood_logs: Optional[List[str]] = []

class PredictionResponse(BaseModel):
    risk_score: float
    trigger_reason: str
    recommended_intervention: str
    action: Optional[str] = "Check details"

class InterventionRequest(BaseModel):
    risk_score: float
    trigger_reason: str
    user_id: int

class SimulationInput(BaseModel):
    current_balance: Optional[float] = 0.0
    avg_daily_spending: Optional[float] = 0.0
    income_frequency_days: Optional[int] = 30
    income_amount: Optional[float] = 0.0
    savings_goal: Optional[float] = 0.0

# --- Proxy Endpoints ---

@router.post("/predict")
async def get_behaviour_prediction(data: BehaviourInput):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{AI_ENGINE_URL}/predict/behaviour", json=data.model_dump())
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"AI Engine unavailable: {exc}")

@router.post("/intervene")
async def get_intervention(data: InterventionRequest):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{AI_ENGINE_URL}/agent/intervene", json=data.model_dump())
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"AI Engine unavailable: {exc}")

@router.post("/simulate")
async def simulate_future_finances(data: SimulationInput):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{AI_ENGINE_URL}/simulate/future", json=data.model_dump())
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"AI Engine unavailable: {exc}")

@router.get("/rag/seed")
async def seed_rag():
    async with httpx.AsyncClient() as client:
        await client.get(f"{AI_ENGINE_URL}/rag/seed")
    return {"status": "Seeded RAG knowledge base"}
