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

import google.generativeai as genai
from config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

@router.post("/agent/intervene", response_model=InterventionResponse)
async def determine_intervention(data: InterventionRequest):
    # Rule-Based Logic for Intervention Type
    if data.risk_score >= 0.8:
        i_type = InterventionType.GUARDRAIL
        action = "Review Budget"
        prompt_style = "strict, warning about safety limit"
    elif data.risk_score >= 0.5:
        i_type = InterventionType.NUDGE
        action = "Accept Challenge"
        prompt_style = "friendly but firm nudge"
    else:
        i_type = InterventionType.MICRO_LESSON
        action = "Read More"
        prompt_style = "positive reinforcement, fun fact"

    # Gemini Generation
    try:
        prompt = f"""
        Act as a Gen-Z financial coach.
        User Data:
        - Risk Score: {data.risk_score} (0-1)
        - Trigger: {data.trigger_reason}
        - Style: {prompt_style}
        
        Task: Generate a JSON response with a short, punchy intervention.
        Format:
        {{
            "intervention_type": "{i_type.value}", 
            "title": "Short Title",
            "message": "Max 2 sentences advice",
            "action": "Actionable step"
        }}
        """
        response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
        
        # Clean and Parse JSON
        import json
        clean_text = response.text.replace('```json', '').replace('```', '').strip()
        parsed = json.loads(clean_text)
        
        content = parsed.get("message", "Watch your spending!")
        action = parsed.get("action", recommended_user_action)
        reason = parsed.get("title", data.trigger_reason) # Use title as the 'reason' or header
        
    except Exception as e:
        print(f"Gemini/JSON Error: {e}")
        # Fallback
        content = f"Notice: {data.trigger_reason}. Watch your spending!"
        reason = data.trigger_reason
        action = recommended_user_action

    return InterventionResponse(
        intervention_type=i_type,
        content=content,
        reason=reason,
        recommended_user_action=action
    )
