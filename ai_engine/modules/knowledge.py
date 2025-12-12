def retrieve_context(query: str, k: int = 2) -> str:
    """Mock RAG: Returns basic financial tips."""
    tips = [
        "Tip: Save 20% of your income.",
        "Tip: Use the 50/30/20 rule.",
        "Tip: Wait 24h before impulse buys."
    ]
    return "\\n".join(tips)

def seed_knowledge_base():
    pass
