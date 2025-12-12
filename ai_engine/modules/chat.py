from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from config import settings
from .knowledge import retrieve_context

router = APIRouter()

# Configure LangChain Chat Model
chat_model = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0.7,
    convert_system_message_to_human=True
)

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
        # 1. Retrieve Knowledge
        context_tips = retrieve_context(data.message)
        
        # 2. Build History for LangChain
        # LangChain expects a list of BaseMessages
        langchain_history = []
        
        # Add System Context
        system_content = f"""
        You are Fin, a Gen-Z Financial Buddy.
        Style: Casual, emoji-friendly 🚀. 
        Mission: Help users save money and build wealth.
        
        Financial Context / RAG Tips:
        {context_tips}
        
        User's Current Setup:
        {data.user_context}
        """
        langchain_history.append(SystemMessage(content=system_content))
        
        # Add Conversation History
        for msg in data.history:
            if msg.role == "user":
                langchain_history.append(HumanMessage(content=msg.content))
            else:
                langchain_history.append(AIMessage(content=msg.content))
                
        # Add Current User Message
        langchain_history.append(HumanMessage(content=data.message))
        
        # 3. Generate Response
        ai_msg = chat_model.invoke(langchain_history)
        
        return ChatResponse(response=ai_msg.content)

    except Exception as e:
        print(f"LangChain Error: {e}")
        return ChatResponse(response=f"My systems are recalibrating... (Error: {str(e)})")
