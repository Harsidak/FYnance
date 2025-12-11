
import httpx
import asyncio

async def check_static():
    base_url = "http://localhost:8000"
    files_to_check = [
        "/",
        "/_next/static/chunks/cbd55ab9639e1e66.js", # Found in index.html
        "/static/favicon.ico" # Check /static mount too
    ]
    
    async with httpx.AsyncClient() as client:
        for path in files_to_check:
            url = f"{base_url}{path}"
            try:
                print(f"Checking {url}...")
                resp = await client.get(url)
                print(f"Status: {resp.status_code}")
                if resp.status_code == 200:
                    print(f"Size: {len(resp.content)} bytes")
                else:
                    print(f"Error: Server returned {resp.status_code}")
            except Exception as e:
                print(f"Failed to connect: {e}")

if __name__ == "__main__":
    asyncio.run(check_static())
