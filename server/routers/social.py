from fastapi import APIRouter
import random

router = APIRouter(
    prefix="/social",
    tags=["Social Norms"]
)

@router.get("/pulse")
def get_campus_pulse():
    """
    Returns aggregated mock data to leverage Social Proof and Counter-Herd logic.
    """
    # Mock Logic: Generate a "Hidden Norm" that encourages frugality
    norms = [
        {"text": "72% of students spent < $15 on dining this week.", "trend": "positive"},
        {"text": "Most peers (8/10) saved their last paycheck.", "trend": "positive"},
        {"text": "Campus avg: $0 spent on impulse buys today.", "trend": "neutral"},
        {"text": "Top 10% savers avoided 'Sale' emails this month.", "trend": "positive"}
    ]
    
    return random.choice(norms)
