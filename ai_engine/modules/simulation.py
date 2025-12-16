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

class SimulationOutput(BaseModel):
    seven_day_forecast: Dict[str, List[float]]  # "current", "improved"
    thirty_day_forecast: Dict[str, List[float]]
    intervention_effectiveness: float
    recommended_actions: List[str]
    survival_probability: float # 0-1
    shock_resilience: str # High/Medium/Low
    liquidity_buffer: float # Days of expenses covered
    stress_test_result: str # Narrative of worst-case scenario
    waste_audit: float # Est. amount lost to waste
    narrative: str # Brief AI explanation of the future
    teacher_report: str # Full markdown analysis

# --- Deterministic Simulation Engine ---
class WealthSimulator:
    def __init__(self, balance, daily_spend, income_amt, income_freq):
        self.initial_limit = balance
        self.daily_spend = daily_spend
        self.income_amt = income_amt
        self.income_freq = income_freq

    def run_path(self, days=30, spend_mult=1.0, income_reliability=1.0, apy=0.0):
        """
        Runs a simulation path.
        spend_mult: Multiplier for daily spend (e.g. 1.1 for 10% higher spend).
        income_reliability: Probability (0-1) that income arrives on due date (simple model: if random > rel, skip).
        apy: Annual Percentage Yield for interest (e.g. 0.04 for 4%).
        """
        path = []
        balance = self.initial_limit
        daily_rate = (1 + apy) ** (1/365) - 1 if apy > 0 else 0

        for day in range(days):
            # 1. Spend
            # Add some variability: +/- 20% random noise on spend unless rigid
            variance = random.uniform(0.8, 1.2)
            actual_spend = self.daily_spend * spend_mult * variance
            balance -= actual_spend

            # 2. Income
            # Income day logic
            if (day + 1) % self.income_freq == 0:
                if random.random() <= income_reliability:
                    balance += self.income_amt
            
            # 3. Interest / Compounding
            if balance > 0:
                balance += balance * daily_rate

            path.append(round(balance, 2))
        
        return path

    def calculate_metrics(self, path):
        min_bal = min(path)
        end_bal = path[-1]
        
        # Survival Prob (Simple)
        survival = 1.0 if min_bal > 0 else 0.0
        
        # Liquidity Buffer (Days until 0 based on avg spend)
        # Using initial balance for pure liquidity calculation
        buffer_days = self.initial_limit / self.daily_spend if self.daily_spend > 0 else 999
        
        return {
            "min_balance": min_bal,
            "end_balance": end_bal,
            "survival_prob": survival,
            "liquidity_buffer": round(buffer_days, 1)
        }

# --- AI Configuration for Narrative ---
model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0.3
)
parser = JsonOutputParser()

@router.post("/simulate/future", response_model=SimulationOutput)
async def simulate_future(data: SimulationInput):
    # 1. Run Deterministic Math Models
    sim = WealthSimulator(
        data.current_balance, 
        data.avg_daily_spending, 
        data.income_amount, 
        data.income_frequency_days
    )

    # A. Baseline Path (Current Status Quo)
    path_baseline = sim.run_path(days=30, spend_mult=1.0, income_reliability=1.0, apy=0.0)
    
    # B. Conservative Path (Stress Test: +15% Spend, 90% Income Reliability)
    path_conservative = sim.run_path(days=30, spend_mult=1.15, income_reliability=0.9, apy=0.0)
    
    # C. Optimized Path (Wealth Defense: -20% Spend, 4% APY Yield)
    path_optimized = sim.run_path(days=30, spend_mult=0.8, income_reliability=1.0, apy=0.04)

    # 2. Calculate Metrics from Math
    metrics_base = sim.calculate_metrics(path_baseline)
    metrics_stress = sim.calculate_metrics(path_conservative)
    
    # 3. AI Narrative Generation
    # We pass the MATH results to the AI, asking it to explain them.
    from wealth_principles import WEALTH_DEFENSE_PROMPT
    
    prompt = ChatPromptTemplate.from_template(
        WEALTH_DEFENSE_PROMPT + """
        
        SYSTEM DATA (Valid Math Results):
        - Current Balance: ${balance}
        - 30-Day Projection (Baseline): Ends at ${end_base}, Low Point: ${min_base}
        - 30-Day Projection (Stress Test): Ends at ${end_stress}, Low Point: ${min_stress}
        - 30-Day Projection (Optimized): Ends at ${end_opt}
        - Liquidity Buffer: {buffer} days of expenses.
        - Survival Probability (Baseline): {surv_prob}
        
        TASK:
        Interpret these results.
        1. Compare the Baseline vs. Optimized outcome.
        2. Analyze the Stress Test (Conservative) - did they survive variance?
        3. Provide the "Teacher Report" and "Recommended Actions".
        
        OUTPUT JSON:
        {{
            "shock_resilience": "High/Medium/Low",
            "stress_test_result": "Narrative of what happened in the stress test path.",
            "waste_audit": (Estimate of potential saving between baseline and optimized end balance),
            "narrative": "Short summary.",
            "teacher_report": "Markdown report.",
            "recommended_actions": ["Action 1", "Action 2"]
        }}
        """
    )
    
    chain = prompt | model | parser
    
    try:
        ai_analysis = await chain.ainvoke({
            "balance": data.current_balance,
            "end_base": metrics_base["end_balance"],
            "min_base": metrics_base["min_balance"],
            "end_stress": metrics_stress["end_balance"],
            "min_stress": metrics_stress["min_balance"],
            "end_opt": path_optimized[-1],
            "buffer": metrics_base["liquidity_buffer"],
            "surv_prob": metrics_base["survival_prob"]
        })
        
        # Merge Math + AI
        return SimulationOutput(
            seven_day_forecast={
                "current": path_baseline[:7],
                "improved": path_optimized[:7]
            },
            thirty_day_forecast={
                "current": path_baseline,
                "improved": path_optimized
            },
            intervention_effectiveness=0.9, # High confidence in math
            recommended_actions=ai_analysis.get("recommended_actions", ["Reduce Volatility"]),
            survival_probability=metrics_base["survival_prob"],
            shock_resilience=ai_analysis.get("shock_resilience", "Medium"),
            liquidity_buffer=metrics_base["liquidity_buffer"],
            stress_test_result=ai_analysis.get("stress_test_result", "Stress test analysis pending."),
            waste_audit=float(ai_analysis.get("waste_audit", 0.0)),
            narrative=ai_analysis.get("narrative", "Simulation complete."),
            teacher_report=ai_analysis.get("teacher_report", "Report generated.")
        )
        
    except Exception as e:
        print(f"AI Narrative Failed: {e}")
        # Fallback: Return Math Only
        return SimulationOutput(
            seven_day_forecast={"current": path_baseline[:7], "improved": path_optimized[:7]},
            thirty_day_forecast={"current": path_baseline, "improved": path_optimized},
            intervention_effectiveness=0.9,
            recommended_actions=["System: AI Offline, but Math holds true.", "Cut spending by 20%."],
            survival_probability=metrics_base["survival_prob"],
            shock_resilience="Unknown",
            liquidity_buffer=metrics_base["liquidity_buffer"],
            stress_test_result=f"Math Stress Test: End Balance ${metrics_stress['end_balance']}",
            waste_audit=path_optimized[-1] - path_baseline[-1],
            narrative="Deterministic projection shown.",
            teacher_report="**AI Unavailable.** Displaying raw mathematical projections."
        )
