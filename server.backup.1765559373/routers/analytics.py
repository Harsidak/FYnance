from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from server.database import get_db
from server.models import User, Spending, Mood, Goal
from .dependencies import get_current_user
import datetime

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
)

@router.get("/spending-trends")
def get_spending_trends(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Group spending by day for the last 7 days
    seven_days_ago = datetime.date.today() - datetime.timedelta(days=7)
    results = db.query(Spending.date, func.sum(Spending.amount)).filter(
        Spending.user_id == current_user.id,
        Spending.date >= seven_days_ago
    ).group_by(Spending.date).all()
    
    data = [{"date": str(r[0]), "amount": r[1]} for r in results]
    return data

@router.get("/mood-spending")
def get_mood_spending_correlation(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Correlate mood and spending on the same days
    thirty_days_ago = datetime.date.today() - datetime.timedelta(days=30)
    
    spendings = db.query(Spending.date, func.sum(Spending.amount)).filter(
        Spending.user_id == current_user.id,
        Spending.date >= thirty_days_ago
    ).group_by(Spending.date).all()
    
    moods = db.query(Mood.date, func.avg(Mood.score)).filter(
        Mood.user_id == current_user.id,
        Mood.date >= thirty_days_ago
    ).group_by(Mood.date).all()
    
    spending_dict = {str(r[0]): r[1] for r in spendings}
    mood_dict = {str(r[0]): r[1] for r in moods}
    
    all_dates = sorted(set(list(spending_dict.keys()) + list(mood_dict.keys())))
    
    data = []
    for d in all_dates:
        data.append({
            "date": d,
            "spending": spending_dict.get(d, 0),
            "mood": mood_dict.get(d, None)
        })
        
    return data

@router.get("/savings-projection")
def get_savings_projection(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Simple projection: Current savings rate extrapolated
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
    
    total_target = sum(g.target_amount for g in goals)
    current_saved = sum(g.current_amount for g in goals)
    
    # Assume static monthly savings for demo (e.g., last 30 days total added to goals)
    # Since we track goal updates as simple PUTs, we don't have a history of goal updates easily in this schema without a separate GoalTransaction table.
    # For now, let's just project based on a mockup average or user's total spending vs (hypothetical income).
    # Easier: Just return the progress towards goals for visualization.
    
    data = []
    for g in goals:
        data.append({
            "name": g.name,
            "current": g.current_amount,
            "target": g.target_amount,
            "deadline": str(g.deadline) if g.deadline else "No deadline"
        })
        
    return {
        "summary": {
            "total_target": total_target,
            "total_saved": current_saved,
            "progress": (current_saved / total_target * 100) if total_target > 0 else 0
        },
        "goals": data
    }

@router.get("/roast")
def get_roast(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Get spending habits
    spendings = db.query(Spending).filter(Spending.user_id == current_user.id).all()
    
    if not spendings:
        return {"roast": "You haven't spent any money yet. Are you a ghost? Start spending so I can judge you."}
        
    total_spent = sum(s.amount for s in spendings)
    categories = {}
    for s in spendings:
        categories[s.category] = categories.get(s.category, 0) + s.amount
        
    top_category = max(categories, key=categories.get)
    top_amount = categories[top_category]
    percent = int((top_amount / total_spent) * 100)
    
    # 2. Basic Roast Logic
    roast = ""
    if percent > 50:
         roast = f"You spent {percent}% of your money on {top_category}. Seriously? Do you have no other hobbies?"
    elif total_spent > 1000:
         roast = f"You've blown ${total_spent} already. I hope you're happy, because your wallet is crying."
    elif top_category == "Food":
         roast = "Stop eating out. Your kitchen misses you, and so does your bank account."
    elif top_category == "Shopping":
         roast = "Retail therapy isn't a valid financial strategy. Put the card down."
    else:
         roast = f"Your spending is boring. {percent}% on {top_category}? Yawn. Do something wild next time."
         
    return {"roast": roast}
