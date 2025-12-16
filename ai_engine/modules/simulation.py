from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from config import settings
import numpy as np
import random

router = APIRouter()

# --- Input/Output Schemas ---
class SimulationInput(BaseModel):
    current_balance: float
    avg_daily_spending: float
    income_frequency_days: int
    income_amount: float
    savings_goal: float
    user_context: Optional[str] = "Student with irregular spending habits."
    
    # Wealth Architect Params
    monthly_expenses: float
    safety_multiplier: Optional[float] = 6.0 # Months of safety
    income_stability: Optional[str] = "medium" # low, medium, high
    risk_tolerance: Optional[str] = "medium" # low, medium, high

class ActionStep(BaseModel):
    step: str
    impact: str
    difficulty: str # Easy, Medium, Hard
    horizon: str # Immediate, Short-term, Long-term

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
    thirty_day_forecast: Dict[str, List[float]] # "current", "improved"
    
    # Wealth Architect Metrics
    targets: FinancialTargets
    buckets: BucketAllocation
    
    # AI Qualitative
    narrative: str 
    teacher_report: str 
    action_path: List[ActionStep]
    
    # Resilience
    shock_resilience: str 
    liquidity_buffer: float

# --- Deterministic Engines ---

class TargetEngine:
    @staticmethod
    def calculate(monthly_expenses, income_stability, desired_annual_lifestyle, current_nw):
        # 1. Security Floor
        # Multiplier depends on stability: High=6m, Med=12m, Low=18m
        stability_map = {"high": 6, "medium": 12, "low": 18}
        safety_months = stability_map.get(income_stability.lower(), 12)
        security_floor = monthly_expenses * safety_months
        
        # 2. Freedom Target (4% Rule)
        # Safe Withdrawal Rate
        freedom_target = desired_annual_lifestyle / 0.04
        
        # 3. Legacy Target
        legacy_target = freedom_target * 1.5
        
        return FinancialTargets(
            security_floor=round(security_floor, 2),
            freedom_target=round(freedom_target, 2),
            legacy_target=round(legacy_target, 2),
            current_net_worth=round(current_nw, 2),
            gap_to_security=round(max(0, security_floor - current_nw), 2),
            gap_to_freedom=round(max(0, freedom_target - current_nw), 2)
        )

class BucketEngine:
    @staticmethod
    def allocate(income_stability, risk_tolerance, age=30):
        # Base logic
        security = 50.0
        growth = 30.0
        dream = 20.0
        
        # Adjust for Stability
        if income_stability == "low":
            security += 20 # 70
            growth -= 10   # 20
            dream -= 10    # 10
        elif income_stability == "high":
            security -= 10 # 40
            growth += 10   # 40
        
        # Adjust for Risk Tolerance
        if risk_tolerance == "high":
            growth += 10
            security -= 10
        elif risk_tolerance == "low":
            security += 10
            growth -= 10
            
        # Normalize
        total = security + growth + dream
        return BucketAllocation(
            security_percent=round((security/total)*100, 1),
            growth_percent=round((growth/total)*100, 1),
            dream_percent=round((dream/total)*100, 1),
            rationale=f" optimized for {income_stability} stability and {risk_tolerance} risk."
        )

class WealthSimulator:
    def __init__(self, balance, daily_spend, income_amt, income_freq):
        self.initial_limit = balance
        self.daily_spend = daily_spend
        self.income_amt = income_amt
        self.income_freq = income_freq

    def run_path(self, days=30, spend_mult=1.0, income_reliability=1.0, apy=0.0):
        path = []
        balance = self.initial_limit
        daily_rate = (1 + apy) ** (1/365) - 1 if apy > 0 else 0

        for day in range(days):
            variance = random.uniform(0.8, 1.2)
            actual_spend = self.daily_spend * spend_mult * variance
            balance -= actual_spend

            if (day + 1) % self.income_freq == 0:
                if random.random() <= income_reliability:
                    balance += self.income_amt
            
            if balance > 0:
                balance += balance * daily_rate

            path.append(round(balance, 2))
        
        return path

# --- AI Configuration ---
model = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash-exp",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0.3
)
parser = JsonOutputParser()

@router.post("/simulate/future", response_model=SimulationOutput)
async def simulate_future(data: SimulationInput):
    # 1. Run Deterministic Math Models (Targets & Buckets)
    targets = TargetEngine.calculate(
        monthly_expenses=data.monthly_expenses,
        income_stability=data.income_stability,
        desired_annual_lifestyle=data.monthly_expenses * 1.5 * 12, # Aspiration assumption
        current_nw=data.current_balance
    )
    
    buckets = BucketEngine.allocate(
        income_stability=data.income_stability,
        risk_tolerance=data.risk_tolerance
    )
    
    sim = WealthSimulator(data.current_balance, data.avg_daily_spending, data.income_amount, data.income_frequency_days)
    path_baseline = sim.run_path(days=30, spend_mult=1.0)
    path_optimized = sim.run_path(days=30, spend_mult=0.8, apy=0.04)
    
    # 2. AI Narrative & Action Path
    prompt = ChatPromptTemplate.from_template(
        """
        Act as a Wealth Architect. Use the calculated financial data to build a strategic plan.
        
        DATA:
        - Security Floor: ${security_floor} (Gap: ${gap_security})
        - Freedom Target: ${freedom_target}
        - Recommended Buckets: Security {sec}%, Growth {gro}%, Dream {drm}%
        
        User Context: {user_context}
        
        TASK:
        1. Create an "Action Path" of 3 distinct steps to close the gap to the Security Floor.
        2. Write a brief teacher report explaining the bucket split.
        
        OUTPUT JSON:
        {{
            "narrative": "One sentence summary.",
            "teacher_report": "Markdown explanation.",
            "shock_resilience": "High/Medium/Low",
            "action_path": [
                {{ "step": "Cut Netflix", "impact": "+$15/mo", "difficulty": "Easy", "horizon": "Immediate" }}
            ]
        }}
        """
    )
    
    chain = prompt | model | parser
    
    try:
        ai_resp = await chain.ainvoke({
            "security_floor": targets.security_floor,
            "gap_security": targets.gap_to_security,
            "freedom_target": targets.freedom_target,
            "sec": buckets.security_percent,
            "gro": buckets.growth_percent,
            "drm": buckets.dream_percent,
            "user_context": data.user_context
        })
        
        return SimulationOutput(
            thirty_day_forecast={ "current": path_baseline, "improved": path_optimized },
            targets=targets,
            buckets=buckets,
            narrative=ai_resp.get("narrative", "Plan generated."),
            teacher_report=ai_resp.get("teacher_report", "Review your targets."),
            action_path=[ActionStep(**step) for step in ai_resp.get("action_path", [])],
            shock_resilience=ai_resp.get("shock_resilience", "Medium"),
            liquidity_buffer=data.current_balance / max(data.avg_daily_spending, 1.0)
        )
        
    except Exception as e:
        print(f"AI Sim Error: {e}")
        return SimulationOutput(
            thirty_day_forecast={ "current": path_baseline, "improved": path_optimized },
            targets=targets,
            buckets=buckets,
            narrative="AI unavailable.",
            teacher_report="Math-only verification.",
            action_path=[],
            shock_resilience="Unknown",
            liquidity_buffer=0.0
        )
