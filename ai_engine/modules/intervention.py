from fastapi import APIRouter
from pydantic import BaseModel
from enum import Enum
from typing import Optional

# If we had the RAG module ready, we'd import it to fetch content
# from .rag import retrieve_lesson

router = APIRouter()

class InterventionType(str, Enum):
    MICRO_LESSON = "Micro-lesson"
    NUDGE = "Nudge"
    CHALLENGE = "Challenge"
    GUARDRAIL = "Guardrail"
    FUTURE_ADVICE = "Future advice snippet"

class InterventionRequest(BaseModel):
    risk_score: float
    trigger_reason: str
    user_id: int
    context_data: Optional[dict] = {}

class InterventionResponse(BaseModel):
    intervention_type: InterventionType
    content: str
    reason: str
    recommended_user_action: str

from datetime import datetime
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from config import settings

# Configure LangChain Model
model = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash-exp",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0.4
)

# Output Parser
parser = JsonOutputParser(pydantic_object=InterventionResponse)

# --- PURE AI ANALYSIS (Gemini 2.0) ---

class AnalysisResponse(BaseModel):
    risk_score: float
    trigger_reason: str
    recommended_intervention: str
    action: str

@router.post("/agent/analyze", response_model=AnalysisResponse)
async def analyze_financial_health(data: InterventionRequest):
    """
    Pure AI Analysis: Evaluates raw data to determine Risk Score and Advice.
    Replaces manual heuristics.
    """
    
    # 1. Formatting Context
    context_str = "\n".join([f"- {k}: {v}" for k, v in data.context_data.items()]) if data.context_data else "No context."
    
    # 2. The "Risk Engine" Prompt
    prompt = ChatPromptTemplate.from_template(
        """
        Act as a Financial Risk Algorithm (Gemini 2.0 Engine).
        
        INPUT DATA:
        - Financial Context:
        {context}
        - Recent Trigger/Mood: {trigger}
        
        LOGIC PARAMETERS:
        1. **Subscription Bloat**: If Fixed Costs > 40% of Income -> Risk is HIGH (>0.7).
        2. **Burn Rate**: If Spending > Disposable Income -> Risk is CRITICAL (>0.9).
        3. **Impulse Control**: If Mood is 'Sad/Stressed' AND High Spending -> Risk is MODERATE (>0.5).
        4. **Safety**: If Spending is low and Savings are high -> Risk is LOW (<0.2).
        
        OUTPUT FORMAT (JSON):
        - risk_score: Float (0.0 to 1.0). Be precise (e.g., 0.87).
        - trigger_reason: Short, punchy diagnosis (e.g., "Subscription Bloat detected").
        - recommended_intervention: Direct advice (Navy SEAL style).
        - action: Single 3-word command (e.g., "Cancel Netflix Now").
        
        {format_instructions}
        """
    )
    
    analysis_parser = JsonOutputParser(pydantic_object=AnalysisResponse)
    chain = prompt | model | analysis_parser
    
    try:
        response = chain.invoke({
            "context": context_str,
            "trigger": data.trigger_reason, # Passed from prediction pre-check or raw
            "format_instructions": analysis_parser.get_format_instructions()
        })
        
        return AnalysisResponse(
            risk_score=response.get("risk_score", 0.5),
            trigger_reason=response.get("trigger_reason", "Complex financial pattern detected."),
            recommended_intervention=response.get("recommended_intervention", "Review your recent transactions."),
            action=response.get("action", "Check Budget")
        )

    except Exception as e:
        print(f"AI Analysis Failed: {e}")
        return AnalysisResponse(
            risk_score=0.5,
            trigger_reason=f"Analysis Error: {str(e)}",
            recommended_intervention="System manual override.",
            action="Retry Analysis"
        )

@router.post("/agent/intervene", response_model=InterventionResponse)
async def determine_intervention(data: InterventionRequest):
    # Rule-Based Logic for Intervention Type
    if data.risk_score >= 0.8:
        i_type = InterventionType.GUARDRAIL
        prompt_style = "strict, warning about safety limit"
    elif data.risk_score >= 0.5:
        i_type = InterventionType.NUDGE
        prompt_style = "friendly but firm nudge"
    else:
        i_type = InterventionType.MICRO_LESSON
        prompt_style = "positive reinforcement, fun fact"

    # LangChain Prompt
    context_str = "\n".join([f"- {k}: {v}" for k, v in data.context_data.items()]) if data.context_data else "No detailed financial context provided."

    prompt = ChatPromptTemplate.from_template(
        """
        Act as a Tier-1 Wealth Strategist (Principles: Ray Dalio meets a Navy SEAL).
        
        MISSION:
        Analyze the user's financial health based on the data below. 
        - If "Subscription Ratio" is > 40%: IGNORE lattee spending. Focus ENTIRELY on cutting fixed costs.
        - If "Burn Rate" is > 100%: Demand immediate spending freeze.
        - If Mood is "Sad" and Spending is High: Call out the emotional loop gently but firmly.

        DATA:
        - Risk Score: {risk_score} (0-1)
        - Trigger Warnings: {trigger}
        - Financial Context:
        {context}
        
        - User Style: {style}
        
        OUTPUT RULES:
        1. NO FLUFF. No "It is important to save".
        2. BE SPECIFIC. "Cancel Netflix" is better than "Reduce entertainment".
        3. Identify the ONE bottleneck holding them back.
        
        Task: Generate a JSON response.
        {format_instructions}
        """
    )
    
    # Chain
    chain = prompt | model | parser
    
    try:
        response = chain.invoke({
            "risk_score": data.risk_score,
            "trigger": data.trigger_reason,
            "context": context_str,
            "style": prompt_style,
            "type": i_type.value,
            "format_instructions": parser.get_format_instructions()
        })
        
        # Ensure we return valid Pydantic model
        return InterventionResponse(
            intervention_type=i_type, # Enforce rule-based type
            content=response.get("content", "Keep tracking your spending!"),
            reason=response.get("reason", data.trigger_reason),
            recommended_user_action=response.get("recommended_user_action", "Check Budget")
        )
        
    except Exception as e:
        print(f"LangChain Intervention Error: {e}")
        # Fallback
        return InterventionResponse(
            intervention_type=i_type,
            content=f"Error generating insight: {str(e)}",
            reason=data.trigger_reason,
            recommended_user_action="Retry"
        )
