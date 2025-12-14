from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from config import settings
import numpy as np

router = APIRouter()

# --- Input Schema ---
class SimulationInput(BaseModel):
    current_balance: float
    avg_daily_spending: float
    income_frequency_days: int
    income_amount: float
    savings_goal: float
    user_context: Optional[str] = "Student with irregular spending habits."

# --- Output Schema (Enriched) ---
class SimulationOutput(BaseModel):
    seven_day_forecast: Dict[str, List[float]]  # "current", "improved"
    thirty_day_forecast: Dict[str, List[float]]
    intervention_effectiveness: float
    recommended_actions: List[str]
    survival_probability: float # 0-1
    shock_resilience: str # High/Medium/Low
    waste_audit: float # Est. amount lost to waste
    narrative: str # Brief AI explanation of the future
    teacher_report: str # Full markdown analysis

# --- AI Configuration ---
model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0.4,
    timeout=25 # Fail fast if too slow
)

parser = JsonOutputParser()

@router.post("/simulate/future", response_model=SimulationOutput)
async def simulate_future(data: SimulationInput):
    # Prompt Construction - Optimized for speed (5 points only)
    prompt = ChatPromptTemplate.from_template(
        """
        Act as a wise, no-nonsense Financial Teacher/Mentor (like a digital Dave Ramsey or Ramit Sethi).
        
        USER DATA:
        - Balance: ${balance}
        - Spend/Day: ${daily_spend}
        - Income: ${income} every {freq} days
        - Goal: ${goal}
        
        TASK:
        1. Predict 30-day "Current" vs "Optimized" (20% cut) paths.
        2. ANALYZE DEEPLY:
           - Survival Prob: Will they go broke?
           - Shock Resilience: Can they handle a $300 tire blowout?
           - Waste Audit: Quantify their "stupid spending".
           - Teacher's Report: Write a 3-paragraph lesson.
             * Paragraph 1: The Diagnosis (What they are doing wrong).
             * Paragraph 2: The Lesson (The concept they need to learn, e.g., 'Pay Yourself First').
             * Paragraph 3: The Homework (Specific steps to fix it).
        
        OUTPUT JSON:
        {{
            "key_points_current": [5 numbers],
            "key_points_optimized": [5 numbers],
            "survival_probability": 0.X,
            "shock_resilience": "Yes/No - Reason",
            "waste_audit": 0.0,
            "narrative": "One sentence punchline.",
            "teacher_report": "Markdown string with the 3 paragraphs...",
            "recommended_actions": ["Action 1", "Action 2", "Action 3"]
        }}
        """
    )

    chain = prompt | model | parser

    try:
        # Ask AI for Key Points
        result = await chain.ainvoke({
            "balance": data.current_balance,
            "daily_spend": data.avg_daily_spending,
            "income": data.income_amount,
            "freq": data.income_frequency_days,
            "goal": data.savings_goal
        })
        
        # Interpolate to 30 days using Numpy
        days_key = [0, 6, 14, 21, 29] # 0-indexed indices for Days 1, 7, 15, 22, 30
        days_full = np.arange(30)
        
        # Current Layout
        current_5 = result.get("key_points_current", [])
        if len(current_5) < 5: raise ValueError("AI returned insufficient points")
        current_30 = np.interp(days_full, days_key, current_5[:5]).tolist()
        
        # Optimized Layout
        opt_5 = result.get("key_points_optimized", [])
        if len(opt_5) < 5: opt_5 = current_5 # Fallback
        opt_30 = np.interp(days_full, days_key, opt_5[:5]).tolist()
        
        return SimulationOutput(
            seven_day_forecast={
                "current": [round(x, 2) for x in current_30[:7]],
                "improved": [round(x, 2) for x in opt_30[:7]]
            },
            thirty_day_forecast={
                "current": [round(x, 2) for x in current_30],
                "improved": [round(x, 2) for x in opt_30]
            },
            intervention_effectiveness=0.85,
            recommended_actions=result.get("recommended_actions", ["Reduce discretionary spending."]),
            survival_probability=result.get("survival_probability", 0.5),
            shock_resilience=result.get("shock_resilience", "Unknown"),
            waste_audit=result.get("waste_audit", 0.0),
            narrative=result.get("narrative", "Simulation complete."),
            teacher_report=result.get("teacher_report", "Teacher is grading your papers...")
        )

    except Exception as e:
        print(f"AI Simulation Failed/Timeout: {e}")
        # Fallback to Linear Logic
        bal = data.current_balance
        path = []
        for d in range(30):
            bal -= data.avg_daily_spending
            if (d+1) % data.income_frequency_days == 0:
                bal += data.income_amount
            path.append(round(bal, 2))
            
        return SimulationOutput(
            seven_day_forecast={"current": path[:7], "improved": path[:7]},
            thirty_day_forecast={"current": path, "improved": path},
            intervention_effectiveness=0.0,
            recommended_actions=["AI Offline. Using linear projection."],
            survival_probability=0.5,
            shock_resilience="Unknown",
            waste_audit=0.0,
            narrative="AI unavailable. Showing standard projection.",
            teacher_report="**AI Offline.** Using mathematical projection only."
        )
