import httpx
import asyncio

async def test_conn():
    url = "http://localhost:8001/predict/behaviour"
    print(f"Testing POST to {url}...")
    
    payload = {
        "user_id": 1,
        "transactions": [],
        "mood_logs": []
    }
    
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, timeout=10.0)
            print(f"Status Code: {resp.status_code}")
            print(f"Response: {resp.text}")
            if resp.status_code == 200:
                print("✅ AI Prediction Endpoint Verified!")
            else:
                print("❌ Endpoint returned non-200 code.")
    except Exception as e:
        print(f"❌ Failed to connect: {e}")

if __name__ == "__main__":
    asyncio.run(test_conn())
