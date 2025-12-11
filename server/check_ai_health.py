
import httpx
import asyncio
import time

async def check_ai_health():
    url = "http://localhost:8001/"
    print(f"Connecting to {url}...")
    
    for i in range(5):
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(url, timeout=2.0)
                if resp.status_code == 200:
                    print("AI Engine is UP!")
                    print(resp.json())
                    return
        except Exception as e:
            print(f"Attempt {i+1} failed: {e}")
            time.sleep(2)
    
    print("AI Engine is DOWN.")

if __name__ == "__main__":
    asyncio.run(check_ai_health())
