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
    model="gemini-pro",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0.4
)

# Output Parser
parser = JsonOutputParser(pydantic_object=InterventionResponse)

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
    prompt = ChatPromptTemplate.from_template(
        """
        Act as a Gen-Z financial coach.
        User Data:
        - Risk Score: {risk_score} (0-1)
        - Trigger: {trigger}
        - Style: {style}
        - Required Type: {type}
        
        Task: Generate a JSON response for the user.
        {format_instructions}
        """
    )
    
    # Chain
    chain = prompt | model | parser
    
    try:
        response = chain.invoke({
            "risk_score": data.risk_score,
            "trigger": data.trigger_reason,
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
