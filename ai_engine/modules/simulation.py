from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict

router = APIRouter()

class SimulationInput(BaseModel):
    current_balance: float
    avg_daily_spending: float
    income_frequency_days: int
    income_amount: float
    savings_goal: float

class SimulationOutput(BaseModel):
    seven_day_forecast: Dict[str, List[float]]  # "current", "improved"
    thirty_day_forecast: Dict[str, List[float]]
    intervention_effectiveness: float
    recommended_actions: List[str]

@router.post("/simulate/future", response_model=SimulationOutput)
def simulate_future(data: SimulationInput):
    # Mock Simulation Logic
    
    # Current Trajectory: Just subtract avg spending daily
    current_path_7 = []
    current_path_30 = []
    
    balance = data.current_balance
    for day in range(1, 31):
        balance -= data.avg_daily_spending
        # Add income if day matches frequency
        if day % data.income_frequency_days == 0:
            balance += data.income_amount
            
        if day <= 7:
            current_path_7.append(round(balance, 2))
        current_path_30.append(round(balance, 2))
        
    # Improved Trajectory: Assume 20% spending reduction
    improved_path_7 = []
    improved_path_30 = []
    
    balance = data.current_balance
    optimized_spending = data.avg_daily_spending * 0.8  # 20% reduction
    
    for day in range(1, 31):
        balance -= optimized_spending
        if day % data.income_frequency_days == 0:
            balance += data.income_amount
            
        if day <= 7:
            improved_path_7.append(round(balance, 2))
        improved_path_30.append(round(balance, 2))
        
    return SimulationOutput(
        seven_day_forecast={
            "current": current_path_7,
            "improved": improved_path_7
        },
        thirty_day_forecast={
            "current": current_path_30,
            "improved": improved_path_30
        },
        intervention_effectiveness=0.85,  # Mock score
        recommended_actions=[
            "Reduce dining out frequency by 20%",
            "Switch to weekly grocery runs"
        ]
    )
