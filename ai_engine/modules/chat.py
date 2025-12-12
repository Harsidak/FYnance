from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai
from config import settings
from .knowledge import retrieve_context

router = APIRouter()

# Configure Gemini
try:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-pro')
except Exception as e:
    print(f"Gemini Config Error: {e}")

class ChatMessage(BaseModel):
    role: str 
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    user_context: Optional[str] = ""

class ChatResponse(BaseModel):
    response: str

@router.post("/chat/send", response_model=ChatResponse)
async def chat_with_buddy(data: ChatRequest):
    try:
        # Retrieve Context (Mock)
        context_tips = retrieve_context(data.message)
        
        system_prompt = f"""
        You are Fin, a Gen-Z Financial Buddy.
        Style: Casual, emoji-friendly.
        Mission: Help users save money.
        
        Financial Tips:
        {context_tips}
        """
        
        history_gemini = []
        for msg in data.history:
            role = "user" if msg.role == "user" else "model"
            history_gemini.append({"role": role, "parts": [msg.content]})
            
        chat = model.start_chat(history=history_gemini)
        
        full_message = f"{system_prompt}\nUser Context: {data.user_context}\nUser: {data.message}"
        response = chat.send_message(full_message)
        
        return ChatResponse(response=response.text)

    except Exception as e:
        print(f"Gemini Error: {e}")
        return ChatResponse(response=f"Back online! (Standard Engine). Error: {str(e)}")
