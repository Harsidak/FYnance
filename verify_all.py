import requests
import json

BASE_URL = "http://localhost:8000"

def test_social():
    print("Testing /social/pulse...")
    try:
        res = requests.get(f"{BASE_URL}/social/pulse")
        if res.status_code == 200:
            print("✅ Social Pulse OK:", res.json())
        else:
            print("❌ Social Pulse Failed:", res.status_code, res.text)
    except Exception as e:
        print("❌ Social Pulse Error:", e)

def test_ai_future():
    print("\nTesting /ai/predict for Future Self...")
    payload = {
        "user_id": 1,
        "transactions": [
            {"amount": 500.0, "category": "Food", "timestamp": "2023-10-27T10:00:00Z"}
        ],
        "mood_logs": []
    }
    try:
        res = requests.post(f"{BASE_URL}/ai/predict", json=payload)
        if res.status_code == 200:
            data = res.json()
            if "future_self_status" in data:
                print(f"✅ Future Self Status: {data['future_self_status']}")
            else:
                print("❌ 'future_self_status' missing in response")
        else:
            print("❌ AI Predict Failed:", res.status_code, res.text)
    except Exception as e:
        print("❌ AI Predict Error:", e)

if __name__ == "__main__":
    test_social()
    test_ai_future()
