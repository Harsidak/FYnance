from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import random
# In a real scenario, we would import joblib to load a trained model
# import joblib 

router = APIRouter()

class Transaction(BaseModel):
    amount: float
    category: str
    timestamp: str

class BehaviourInput(BaseModel):
    user_id: int
    transactions: List[Transaction]
    mood_logs: Optional[List[str]] = []

class PredictionOutput(BaseModel):
    risk_score: float
    trigger_reason: str
    recommended_intervention: str
    action: str

from .intervention import determine_intervention, InterventionRequest

@router.post("/predict/behaviour", response_model=PredictionOutput)
async def predict_behaviour(data: BehaviourInput):
    # Mock Logic for Behaviour Prediction
    total_spending = sum(t.amount for t in data.transactions)
    
    # 2. Heuristic Logic
    risk_score = 0.0
    trigger = "Normal spending behaviour"

    if total_spending > 5000:
        risk_score = 0.9
        trigger = "High spending spike detected"
    elif total_spending > 1000:
        risk_score = 0.6
        trigger = "Moderate spending detected"
    else:
        risk_score = 0.1
        trigger = "Low spending"

    if data.mood_logs and "sad" in data.mood_logs:
        risk_score += 0.2
        trigger += " + Emotional spending risk"
        
    final_risk = min(risk_score, 1.0)
    
    # 3. Call The AI Intervention Agent (Gemini)
    intervention_req = InterventionRequest(
        risk_score=final_risk,
        trigger_reason=trigger,
        user_id=data.user_id
    )
    
    # Direct internal call
    agent_response = await determine_intervention(intervention_req)

    return PredictionOutput(
        risk_score=final_risk,
        trigger_reason=agent_response.reason, # Use the catchy title from Gemini
        recommended_intervention=agent_response.content,
        action=agent_response.recommended_user_action
    )
