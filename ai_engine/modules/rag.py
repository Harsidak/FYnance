from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
try:
    import chromadb
    from chromadb.utils import embedding_functions
    CHROMA_AVAILABLE = True
    chroma_client = chromadb.PersistentClient(path="./chroma_db")
    sentence_transformer_ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
    collection = chroma_client.get_or_create_collection(name="financial_lessons", embedding_function=sentence_transformer_ef)
except Exception as e:
    print(f"Warning: ChromaDB not available ({e}). Running in Mock RAG mode.")
    CHROMA_AVAILABLE = False
    collection = None

router = APIRouter()

class DocumentInput(BaseModel):
    id: str
    text: str
    metadata: dict

class QueryInput(BaseModel):
    query_text: str
    n_results: int = 1

class QueryOutput(BaseModel):
    documents: List[str]
    metadatas: List[dict]

@router.post("/rag/add_document")
def add_document(doc: DocumentInput):
    if not CHROMA_AVAILABLE:
        return {"status": "mock_added", "id": doc.id}
        
    collection.add(
        documents=[doc.text],
        metadatas=[doc.metadata],
        ids=[doc.id]
    )
    return {"status": "added", "id": doc.id}

import google.generativeai as genai
from config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

@router.post("/rag/query", response_model=QueryOutput)
async def query_knowledge_base(query: QueryInput):
    if not CHROMA_AVAILABLE:
        # Mock Response
        return QueryOutput(
            documents=[f"Mock Wisdom: Information about '{query.query_text}' is important."],
            metadatas=[{"category": "mock"}]
        )

    results = collection.query(
        query_texts=[query.query_text],
        n_results=query.n_results
    )
    
    if not results['documents']:
        return QueryOutput(documents=[], metadatas=[])
    
    # RAG Synthesis
    retrieved_text = "\n".join(results['documents'][0])
    try:
        prompt = f"""
        You are a financial mentor. Use the snippets below to answer.
        
        Knowledge:
        {retrieved_text}
        
        User Question: {query.query_text}
        
        Task: Return a JSON object.
        Format:
        {{
            "answer": "Concise answer (max 50 words)",
            "key_takeaway": "One short bullet point"
        }}
        """
        response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
        
        import json
        clean_text = response.text.replace('```json', '').replace('```', '').strip()
        parsed = json.loads(clean_text)
        
        final_answer = parsed.get("answer", retrieved_text[:100])
        # We could also use 'key_takeaway' if we return more fields later
        
    except Exception:
        final_answer = retrieved_text # Fallback
        
    # We return the synthesized answer as the FIRST document for the frontend to display
    return QueryOutput(
        documents=[final_answer],
        metadatas=results['metadatas'][0]
    )

@router.get("/rag/seed")
def seed_initial_knowledge():
    """Seed the database with some initial financial lessons."""
    if not CHROMA_AVAILABLE:
        return {"status": "Mock Seeded"}
        
    lessons = [
        ("lesson_1", "The 50/30/20 rule suggests spending 50% on needs, 30% on wants, and 20% on savings.", {"category": "budgeting"}),
        ("lesson_2", "Compound interest is the 8th wonder of the world. He who understands it, earns it.", {"category": "investing"}),
        ("lesson_3", "Impulse buying is often triggered by emotions. Wait 24 hours before making a big purchase.", {"category": "psychology"}),
        ("lesson_4", "Emergency funds should cover 3-6 months of living expenses.", {"category": "safety"}),
    ]
    
    for id, text, meta in lessons:
        collection.add(documents=[text], metadatas=[meta], ids=[id])
        
    return {"status": "Seeded 4 default lessons"}
