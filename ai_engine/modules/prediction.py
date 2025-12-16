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
    timestamp: Optional[str] = None

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
    user_profile: Optional[UserProfile]
    financial_context: Optional[FinancialContext]

class PredictionOutput(BaseModel):
    risk_score: float
    trigger_reason: str
    recommended_intervention: str
    action: str

from .intervention import determine_intervention, InterventionRequest

@router.post("/predict/behaviour", response_model=PredictionOutput)
async def predict_behaviour(data: BehaviourInput):
    # --- 1. Calculate Core Metrics ---
    total_spending = sum(t.amount for t in data.transactions)
    
    income = data.user_profile.monthly_income if data.user_profile else 0
    fixed_costs = data.financial_context.fixed_costs if data.financial_context else 0
    savings = data.user_profile.savings_balance if data.user_profile else 0
    
    # Disposable Income (True loose cash)
    disposable_income = max(income - fixed_costs, 1.0) # Avoid div/0
    
    # Ratios
    # Spending relative to total income
    income_burn_ratio = total_spending / max(income, 1.0) if income > 0 else 1.0
    
    # Spending relative to disposable (The "True" Burn Rate)
    disposable_burn_ratio = total_spending / disposable_income
    
    # Fixed Cost Ratio (Subscription Bloat)
    fixed_cost_ratio = fixed_costs / max(income, 1.0) if income > 0 else 0
    
    # --- 2. Heuristic Logic (Ratio Based) ---
    # --- 2. Prepare Context for AI ---
    # We still calculate ratios to give the AI "Eyes", but it makes the judgment.
    context_payload = {
        "income": income,
        "total_spending": total_spending,
        "fixed_costs": fixed_costs,
        "disposable_income_cap": disposable_income,
        "burn_rate_amount": total_spending,
        "burn_rate_ratio": f"{int(disposable_burn_ratio * 100)}%",
        "subscription_ratio": f"{int(fixed_cost_ratio*100)}%",
        "mood_logs": data.mood_logs
    }

    # --- 3. Call The Pure AI Risk Engine ---
    from .intervention import analyze_financial_health, InterventionRequest
    
    agent_req = InterventionRequest(
        risk_score=0.0, # Placeholder, AI will calculate
        trigger_reason="Raw Data Analysis", 
        user_id=data.user_id,
        context_data=context_payload
    )
    
    # Direct internal call to the AI Engine
    ai_verdict = await analyze_financial_health(agent_req)

    return PredictionOutput(
        risk_score=ai_verdict.risk_score,
        trigger_reason=ai_verdict.trigger_reason,
        recommended_intervention=ai_verdict.recommended_intervention,
        action=ai_verdict.action
    )


