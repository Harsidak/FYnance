
import httpx
import asyncio

async def verify_content():
    base_url = "http://localhost:8000"
    # A JS file we know exists
    js_path = "/_next/static/chunks/cbd55ab9639e1e66.js" 
    
    async with httpx.AsyncClient() as client:
        print(f"Fetching {js_path}...")
        resp = await client.get(f"{base_url}{js_path}")
        print(f"Status: {resp.status_code}")
        print(f"Content-Type: {resp.headers.get('content-type')}")
        print(f"First 100 bytes: {resp.content[:100]}")
        
        if b"<!DOCTYPE html>" in resp.content[:100]:
            print("FAILURE: Received HTML instead of JS (SPA Fallback triggered)")
        else:
            print("SUCCESS: Received likely JS content")

if __name__ == "__main__":
    asyncio.run(verify_content())
