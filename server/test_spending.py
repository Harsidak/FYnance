import requests

# 1. Login to get token
base_url = "http://localhost:8000"
auth_data = {
    "username": "testuser_debug",
    "password": "password123"
}
# Note: login expects form data, not json
response = requests.post(f"{base_url}/auth/login", data=auth_data)
if response.status_code != 200:
    print(f"Login failed: {response.text}")
    exit(1)

token = response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# 2. Try to add spending with typical frontend payload
# Frontend sends: { amount: '123', category: 'Food', description: '' }
payload = {
    "amount": "123", # String
    "category": "Food",
    "description": "" # Empty string
    # date is missing
}

print(f"Sending payload: {payload}")
resp = requests.post(f"{base_url}/spending/", json=payload, headers=headers)
print(f"Status: {resp.status_code}")
with open("error_response.txt", "w") as f:
    f.write(resp.text)
print(f"Response: {resp.text}")
