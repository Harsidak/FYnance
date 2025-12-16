from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, ChatSession, ChatMessage, Goal, Subscription, Spending
from routers.auth import get_current_user
from pydantic import BaseModel
from typing import List, Optional
import httpx
import os
from datetime import datetime

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)

AI_ENGINE_URL = os.getenv("AI_ENGINE_URL", "http://localhost:8001")

# --- Schemas ---
class ChatSessionCreate(BaseModel):
    title: Optional[str] = "New Chat"

class ChatSessionResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ChatMessageRequest(BaseModel):
    message: str

# --- Endpoints ---

@router.get("/sessions", response_model=List[ChatSessionResponse])
def get_sessions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(ChatSession).filter(ChatSession.user_id == current_user.id).order_by(ChatSession.updated_at.desc()).all()

@router.post("/sessions", response_model=ChatSessionResponse)
def create_session(session_data: ChatSessionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_session = ChatSession(user_id=current_user.id, title=session_data.title)
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

@router.patch("/sessions/{session_id}", response_model=ChatSessionResponse)
def update_session(session_id: int, session_data: ChatSessionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.title = session_data.title
    session.updated_at = datetime.now()
    db.commit()
    db.refresh(session)
    return session

@router.delete("/sessions/{session_id}")
def delete_session(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    db.delete(session)
    db.commit()
    return {"status": "success"}

@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessageResponse])
def get_messages(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc()).all()

@router.post("/sessions/{session_id}/message", response_model=ChatMessageResponse)
async def send_message(session_id: int, message_data: ChatMessageRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Verify Session
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # 2. Save User Message
    user_msg = ChatMessage(session_id=session_id, role="user", content=message_data.message)
    db.add(user_msg)
    
    # 3. Aggregate Context
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
    subs = db.query(Subscription).filter(Subscription.user_id == current_user.id).all()
    recent_spending = db.query(Spending).filter(Spending.user_id == current_user.id).order_by(Spending.date.desc()).limit(10).all()
    
    context = f"""
    User Profile:
    - Monthly Income: ${current_user.monthly_income}
    - Savings Balance: ${current_user.savings_balance}
    - Hourly Wage: ${current_user.hourly_wage}
    
    Active Goals:
    {chr(10).join([f"- {g.name}: ${g.current_amount}/${g.target_amount} (Due: {g.deadline})" for g in goals])}
    
    Subscriptions:
    {chr(10).join([f"- {s.name}: ${s.cost} ({s.billing_cycle})" for s in subs])}
    
    Recent Spending:
    {chr(10).join([f"- {s.category}: ${s.amount} ({s.description})" for s in recent_spending])}
    """
    
    # 4. Fetch History for Context Window
    history_msgs = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc()).limit(20).all()
    history_payload = [{"role": m.role, "content": m.content} for m in history_msgs]

    # 5. Call AI Engine
    ai_payload = {
        "message": message_data.message,
        "history": history_payload,
        "user_context": context
    }
    
    ai_response_text = "I'm having trouble reaching my brain servers."
    
    async with httpx.AsyncClient() as client:
        try:
            # We use the existing AI Engine chat endpoint but passed with rich context
            response = await client.post(f"{AI_ENGINE_URL}/chat/send", json=ai_payload, timeout=60.0)
            if response.status_code == 200:
                ai_response_text = response.json().get("response", "")
            else:
                ai_response_text = f"Connection Error: {response.text}"
        except Exception as e:
            ai_response_text = f"AI Error: {str(e)}"
            
    # 6. Save AI Response
    ai_msg = ChatMessage(session_id=session_id, role="assistant", content=ai_response_text)
    db.add(ai_msg)
    
    # Update Session Timestamp
    session.updated_at = datetime.now()
    
    db.commit()
    db.refresh(ai_msg)
    
    return ai_msg
