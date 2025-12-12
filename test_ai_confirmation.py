import httpx
import asyncio

async def test_intervention():
    url = "http://localhost:8001/agent/intervene"
    payload = {
        "risk_score": 0.95,
        "trigger_reason": "High spending spike",
        "user_id": 1
    }
    print(f"Testing {url} with {payload}...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=10.0)
            print(f"Status: {response.status_code}")
            print(f"Response: {response.json()}")
            if response.status_code == 200:
                print("SUCCESS: AI Engine responded correctly.")
            else:
                print("FAILURE: Unexpected status code.")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(test_intervention())
