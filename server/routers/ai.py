from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Any, Dict
from pydantic import BaseModel
import httpx

router = APIRouter(
    prefix="/ai",
    tags=["AI Features"]
)

import os

AI_ENGINE_URL = os.getenv("AI_ENGINE_URL", "http://localhost:8001")

# Types matching AI Engine
class Transaction(BaseModel):
    amount: float
    category: str
    timestamp: Optional[Any] = None

class UserProfile(BaseModel):
    monthly_income: float
    savings_balance: float
    income_stability: str

class FinancialContext(BaseModel):
    fixed_costs: float
    currency: str

class BehaviourInput(BaseModel):
    user_id: int
    transactions: List[Transaction]
    mood_logs: Optional[List[str]] = []
    user_profile: Optional[UserProfile] = None
    financial_context: Optional[FinancialContext] = None

class PredictionResponse(BaseModel):
    risk_score: float
    trigger_reason: str
    recommended_intervention: str
    action: Optional[str] = "Check details"
    future_self_status: Optional[str] = "neutral" # happy, stressed, neutral

class InterventionRequest(BaseModel):
    risk_score: float
    trigger_reason: str
    user_id: int
    context_data: Optional[dict] = {}

class SimulationInput(BaseModel):
    current_balance: Optional[float] = 0.0
    avg_daily_spending: Optional[float] = 0.0
    income_frequency_days: Optional[int] = 30
    income_amount: Optional[float] = 0.0
    savings_goal: Optional[float] = 0.0
    
    # Wealth Architect Fields
    monthly_expenses: Optional[float] = 0.0
    safety_multiplier: Optional[float] = 6.0
    income_stability: Optional[str] = "medium"
    risk_tolerance: Optional[str] = "medium"

# --- Output Models ---
class ActionStep(BaseModel):
    step: str
    impact: str
    difficulty: str 
    horizon: str 

class FinancialTargets(BaseModel):
    security_floor: float
    freedom_target: float
    legacy_target: float
    current_net_worth: float
    gap_to_security: float
    gap_to_freedom: float

class BucketAllocation(BaseModel):
    security_percent: float
    growth_percent: float
    dream_percent: float
    rationale: str

class SimulationOutput(BaseModel):
    # Forecasts
    thirty_day_forecast: Dict[str, List[float]]
    
    # Wealth Architect Metrics
    targets: Optional[FinancialTargets] = None
    buckets: Optional[BucketAllocation] = None
    
    # AI Qualitative
    narrative: str 
    teacher_report: str 
    action_path: Optional[List[ActionStep]] = []
    
    # Resilience
    shock_resilience: str 
    liquidity_buffer: float
    
    # Legacy Support (Optional)
    seven_day_forecast: Optional[Dict[str, List[float]]] = None
    recommended_actions: Optional[List[str]] = []
    survival_probability: Optional[float] = 0.0
    stress_test_result: Optional[str] = ""
    waste_audit: Optional[float] = 0.0

# --- Proxy Endpoints ---

@router.post("/predict")
async def get_behaviour_prediction(data: BehaviourInput):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{AI_ENGINE_URL}/predict/behaviour", json=data.model_dump(), timeout=60.0)
            response.raise_for_status()
            response_data = response.json()
            
            # Add lightweight Future Self logic here
            risk = response_data.get("risk_score", 0)
            if risk < 0.3:
                response_data["future_self_status"] = "happy"
            elif risk > 0.7:
                response_data["future_self_status"] = "stressed"
            else:
                response_data["future_self_status"] = "neutral"
                
            return response_data
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"AI Engine unavailable: {exc}")

@router.post("/intervene")
async def get_intervention(data: InterventionRequest):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{AI_ENGINE_URL}/agent/intervene", json=data.model_dump(), timeout=60.0)
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"AI Engine unavailable: {exc}")

@router.post("/simulate")
async def simulate_future_finances(data: SimulationInput):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{AI_ENGINE_URL}/simulate/future", json=data.model_dump(), timeout=60.0)
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"AI Engine unavailable: {exc}")

@router.get("/rag/seed")
async def seed_rag():
    async with httpx.AsyncClient() as client:
        await client.get(f"{AI_ENGINE_URL}/rag/seed")
    return {"status": "Seeded RAG knowledge base"}

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

@router.post("/chat")
async def chat_interaction(data: ChatRequest):
    # Fetch User Context (Mock for now, could fetch from DB)
    context = "User has $1200 balance. Spend trends: High food costs."
    
    payload = {
        "message": data.message,
        "history": [m.model_dump() for m in data.history],
        "user_context": context
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{AI_ENGINE_URL}/chat/send", json=payload, timeout=60.0)
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"AI Engine unavailable: {exc}")
