import httpx
import asyncio
import json

async def debug_analytics():
    base_url = "http://localhost:8000/analytics"
    print(f"Testing Analytics Endpoints...")
    
    # We need a user token usually, but assume analytics might be open or we can mock it?
    # Wait, the frontend code uses `api.js` with token.
    # The routers normally require auth.
    # We will try to hit it. If 401, we need to login first.
    
    # Actually, let's login first.
    auth_url = "http://localhost:8000/auth/login"
    # Admin creds from context
    data = {"username": "admin", "password": "password123"} 
    
    async with httpx.AsyncClient() as client:
        # Login
        print("Logging in...")
        try:
            r = await client.post(auth_url, data=data)
            if r.status_code != 200:
                print(f"❌ Login Failed: {r.text}")
                return
            token = r.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            print("✅ Login Successful.")
        except Exception as e:
            print(f"❌ Login Connection Failed: {e}")
            return

        # 1. Spending Trends
        print("\nTesting /spending-trends...")
        try:
            resp = await client.get(f"{base_url}/spending-trends", headers=headers)
            print(f"Status: {resp.status_code}")
            if resp.status_code == 200:
                d = resp.json()
                print(f"Data type: {type(d)}")
                if isinstance(d, list) and len(d) > 0:
                    print(f"Sample item: {d[0]}")
                else:
                    print(f"Data: {d}")
        except Exception as e:
            print(f"Error: {e}")

        # 2. Mood Spending
        print("\nTesting /mood-spending...")
        try:
            resp = await client.get(f"{base_url}/mood-spending", headers=headers)
            print(f"Status: {resp.status_code}")
            if resp.status_code == 200:
                d = resp.json()
                print(f"Data type: {type(d)}")
                if isinstance(d, list) and len(d) > 0:
                    print(f"Sample item: {d[0]}")
                else:
                    print(f"Data: {d}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(debug_analytics())
