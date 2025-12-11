
import requests
import sys

BASE_URL = "http://localhost:8000"

def test_auth_goals():
    # 1. Register/Login User
    username = "testuser_auth"
    password = "password123"
    email = "test_auth@example.com"
    
    print(f"Testing Auth Flow for User: {username}")
    
    # Try Register
    try:
        reg_res = requests.post(f"{BASE_URL}/auth/register", json={
            "username": username,
            "email": email,
            "password": password
        })
        if reg_res.status_code == 200:
            print("Registration Successful")
        elif reg_res.status_code == 400 and "already registered" in reg_res.text:
             print("User already exists, proceeding to login...")
        else:
             print(f"Registration Failed: {reg_res.status_code} {reg_res.text}")
             return
    except Exception as e:
        print(f"Server not reachable? {e}")
        return

    # 2. Login
    login_data = {
        "username": username,
        "password": password
    }
    # OAuth2PasswordRequestForm expects form data, not JSON
    login_res = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    
    if login_res.status_code != 200:
        print(f"Login Failed: {login_res.status_code} {login_res.text}")
        return
        
    token = login_res.json().get("access_token")
    print(f"Got Token: {token[:10]}...")
    
    # 3. Access Goals
    headers = {"Authorization": f"Bearer {token}"}
    goals_res = requests.get(f"{BASE_URL}/goals", headers=headers)
    
    if goals_res.status_code == 200:
        print("✅ SUCCESS: GET /goals returned 200 OK")
        print(f"Goals Data: {goals_res.json()}")
    elif goals_res.status_code == 401:
        print("❌ FAILURE: GET /goals returned 401 Unauthorized")
    else:
        print(f"⚠️ UNEXPECTED: {goals_res.status_code} {goals_res.text}")

if __name__ == "__main__":
    test_auth_goals()
