import requests
import json
import httpx
import asyncio

URL = "http://localhost:8000/ai/simulate"

payload = {
    "current_balance": 1200.0,
    "avg_daily_spending": 45.0,
    "income_frequency_days": 14,
    "income_amount": 2000.0,
    "savings_goal": 3000.0,
    "monthly_expenses": 1500.0,
    "income_stability": "medium",
    "safety_multiplier": 6.0,
    "risk_tolerance": "medium"
}

def test_sync():
    print(f"Testing POST {URL}...")
    try:
        resp = requests.post(URL, json=payload)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            print("Keys received:", list(data.keys()))
            print("Target Keys:", list(data.get('targets', {}).keys()))
            print("Action Path Length:", len(data.get('action_path', [])))
        else:
            print("Error Response:", resp.text)
    except Exception as e:
        print(f"Connection Failed: {e}")

if __name__ == "__main__":
    test_sync()
