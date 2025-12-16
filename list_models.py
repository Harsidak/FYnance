import os
import google.generativeai as genai
from dotenv import load_dotenv

env_path = os.path.abspath("ai_engine/.env")
print(f"--- DIAGNOSTICS ---")
print(f"Looking for .env at: {env_path}")

api_key = None

# Manual Parse
if os.path.exists(env_path):
    print("File exists. Content preview:")
    try:
        with open(env_path, 'r', encoding='utf-8-sig', errors='ignore') as f:
            for line in f:
                clean_line = line.strip()
                if not clean_line or clean_line.startswith("#"):
                    continue
                print(f"  Line: {clean_line[:10]}... (len={len(clean_line)})")
                
                if "API_KEY" in clean_line and "=" in clean_line:
                    possible_key = clean_line.split("=", 1)[1].strip().strip('"').strip("'")
                    if possible_key.startswith("AIza"):
                        api_key = possible_key
                        print(f"  -> FOUND KEY: {api_key[:10]}...")
    except Exception as e:
        print(f"Error reading file: {e}")
else:
    print("File NOT found.")

if not api_key:
    print("Could not find API key in file.")
    exit(1)

print("\n--- LISTING MODELS ---")
genai.configure(api_key=api_key)

try:
    models = list(genai.list_models())
    print(f"Found {len(models)} models.")
    print("--- FLASH MODELS ---")
    for m in models:
        # Filter for generation models
        if 'generateContent' in m.supported_generation_methods:
            if "flash" in m.name.lower():
                print(f"Model: {m.name}")
except Exception as e:
    print(f"API Error: {e}")
