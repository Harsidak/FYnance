
import httpx
import asyncio

async def verify_api():
    base_url = "http://localhost:8000"
    
    # helper to login
    async with httpx.AsyncClient() as client:
        # Login
        resp = await client.post(f"{base_url}/auth/login", data={"username": "testuser_debug", "password": "password123"})
        if resp.status_code != 200:
            print(f"Login Failed: {resp.text}")
            return
            
        token = resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Check /users/me
        print("Checking /users/me...")
        resp = await client.get(f"{base_url}/users/me", headers=headers)
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text}")

if __name__ == "__main__":
    asyncio.run(verify_api())
