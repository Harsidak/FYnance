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
    model="gemini-2.5-flash",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0.4,
    max_tokens=None,
    timeout=30,
    max_retries=2,
)

class ChatMessage(BaseModel):
    role: str 
    content: str
    
class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    user_context: Optional[str] = ""
    language: Optional[str] = "en"

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
        from wealth_principles import get_architect_prompt
        
        system_content = get_architect_prompt(
            context_tips=context_tips, 
            user_context=data.user_context
        )
        langchain_history.append(SystemMessage(content=system_content))
        
        # Enforce Language
        if data.language and data.language != "en":
            langchain_history.append(SystemMessage(content=f"IMPORTANT: You MUST reply to the user in {data.language} (Language Code). Translate all concepts naturally."))
        
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
        
        response_content = ai_msg.content
        if isinstance(response_content, list):
            # Handle list of content blocks (e.g. from Gemini)
            full_text = ""
            for block in response_content:
                if isinstance(block, dict) and "text" in block:
                    full_text += block["text"]
                elif isinstance(block, str):
                    full_text += block
            response_content = full_text

        return ChatResponse(response=str(response_content))

    except Exception as e:
        print(f"LangChain Error: {e}")
        return ChatResponse(response=f"My systems are recalibrating... (Error: {str(e)})")
