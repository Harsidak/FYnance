import httpx
import asyncio
import json

async def debug_sim():
    url = "http://localhost:8000/ai/simulate"
    print(f"Testing Simulation Endpoint: {url}")
    
    payload = {
        "current_balance": 5000,
        "avg_daily_spending": 150,
        "income_frequency_days": 30,
        "income_amount": 4000,
        "savings_goal": 10000
    }
    
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, timeout=10.0)
            print(f"Status: {resp.status_code}")
            if resp.status_code == 200:
                data = resp.json()
                print(json.dumps(data, indent=2))
                
                # Verify structure
                if "thirty_day_forecast" in data:
                    fc = data["thirty_day_forecast"]
                    if "current" in fc and isinstance(fc["current"], list):
                        print(f"✅ 'current' is a list of length {len(fc['current'])}")
                    else:
                        print("❌ 'current' is NOT a list or missing.")
                else:
                    print("❌ 'thirty_day_forecast' key missing.")
            else:
                print(f"❌ Error Response: {resp.text}")
    except Exception as e:
        print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    asyncio.run(debug_sim())
