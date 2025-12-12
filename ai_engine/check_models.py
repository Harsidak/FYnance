import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load .env
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

api_key = os.getenv("API_KEY")

if not api_key:
    print("NO API_KEY found in .env file!")
else:
    print(f"Found API Key (starts with {api_key[:5]}...)")
    genai.configure(api_key=api_key)
    
    try:
        print("\nListing Available Models...")
        found_any = False
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"- {m.name}")
                found_any = True
        
        if not found_any:
            print("No models found that support 'generateContent'.")
            
    except Exception as e:
        print(f"Error listing models: {e}")
